<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Opportunity;
use App\Models\OpportunityApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OpportunityApplicationController extends Controller
{
    /**
     * List applications (Student sees own; Admin sees all).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = OpportunityApplication::with(['opportunity', 'applicant:id,name,email']);

        if (!$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            $query->where('applicant_id', $user->id);
        }

        return response()->json($query->latest()->get());
    }

    /**
     * Submit an application for an opportunity.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'opportunity_id' => 'required|exists:opportunities,id',
            'statement_of_purpose' => 'required|string|min:20',
            'gpa' => 'nullable|string',
            'academic_level' => 'nullable|string',
        ]);

        // Check if opportunity is active
        $opportunity = Opportunity::findOrFail($validated['opportunity_id']);
        if (!$opportunity->is_active) {
            return response()->json(['message' => 'This opportunity is no longer accepting applications.'], 422);
        }

        // Prevent duplicate applications
        $existing = OpportunityApplication::where('opportunity_id', $opportunity->id)
            ->where('applicant_id', $user->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You have already submitted an application for this opportunity.'], 422);
        }

        $year = date('Y');
        $appNumber = DB::transaction(function () use ($year) {
            $last = OpportunityApplication::where('application_number', 'like', "APP-{$year}-%")
                ->lockForUpdate()
                ->latest('id')
                ->first();
            $next = 1;
            if ($last && preg_match('/APP-\d{4}-(\d+)/', $last->application_number, $m)) {
                $next = ((int) $m[1]) + 1;
            }
            return sprintf('APP-%s-%03d', $year, $next);
        });

        $app = OpportunityApplication::create(array_merge($validated, [
            'application_number' => $appNumber,
            'applicant_id' => $user->id,
            'status' => 'Submitted',
        ]));

        AuditLog::log('opportunity_application_submitted', 'OpportunityApplication', $app->id, [
            'application_number' => $appNumber,
            'opportunity_id' => $opportunity->id,
        ], $user->id);

        return response()->json([
            'message' => 'Application submitted successfully!',
            'application' => $app->load('opportunity'),
        ], 201);
    }

    /**
     * Admin review decision (Accepted, Rejected, Shortlisted).
     */
    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $app = OpportunityApplication::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:Submitted,Under Review,Shortlisted,Accepted,Rejected',
            'reviewer_notes' => 'nullable|string',
        ]);

        $app->update([
            'status' => $validated['status'],
            'reviewer_notes' => $validated['reviewer_notes'] ?? $app->reviewer_notes,
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
        ]);

        AuditLog::log('opportunity_application_reviewed', 'OpportunityApplication', $app->id, [
            'status' => $validated['status'],
        ], $user->id);

        return response()->json([
            'message' => "Application status updated to '{$validated['status']}'",
            'application' => $app->fresh(['applicant:id,name,email', 'opportunity']),
        ]);
    }
}
