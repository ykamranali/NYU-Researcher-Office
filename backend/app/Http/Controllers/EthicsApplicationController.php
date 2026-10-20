<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\EthicsApplication;
use App\Models\ResearchProject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EthicsApplicationController extends Controller
{
    /**
     * List ethics applications with status filtering.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = EthicsApplication::with(['user:id,name,email', 'researchProject:id,title,project_code', 'approver:id,name']);

        if (!$user->hasAnyRole(['Super Admin', 'Office Admin', 'Reviewer'])) {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->get());
    }

    /**
     * Submit a new Ethics / IRB protocol.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'research_project_id' => 'nullable|exists:research_projects,id',
            'review_type' => 'required|string|in:Human Subjects,Animal Care (IACUC),Biosafety,Data Privacy',
            'risk_level' => 'required|string|in:Exempt,Minimal Risk,Full Board Review',
            'summary' => 'required|string|min:20',
            'has_coi' => 'required|boolean',
            'coi_details' => 'nullable|required_if:has_coi,true|string',
        ]);

        $year = date('Y');
        $protocolNum = DB::transaction(function () use ($year) {
            $last = EthicsApplication::where('protocol_number', 'like', "IRB-{$year}-%")
                ->lockForUpdate()
                ->latest('id')
                ->first();
            $next = 1;
            if ($last && preg_match('/IRB-\d{4}-(\d+)/', $last->protocol_number, $m)) {
                $next = ((int) $m[1]) + 1;
            }
            return sprintf('IRB-%s-%04d', $year, $next);
        });

        $ethics = EthicsApplication::create(array_merge($validated, [
            'protocol_number' => $protocolNum,
            'user_id' => $user->id,
            'status' => 'Submitted',
            'submission_date' => now(),
        ]));

        // If linked to a project, update project's ethics status to Pending
        if ($ethics->research_project_id) {
            ResearchProject::where('id', $ethics->research_project_id)
                ->where('ethics_status', '!=', 'Approved')
                ->update(['ethics_status' => 'Pending Review']);
        }

        AuditLog::log('ethics_protocol_submitted', 'EthicsApplication', $ethics->id, [
            'protocol_number' => $protocolNum,
            'review_type' => $ethics->review_type,
        ], $user->id);

        return response()->json([
            'message' => 'Ethics protocol submitted successfully for institutional committee review.',
            'protocol' => $ethics->load(['user:id,name,email', 'researchProject:id,title']),
        ], 201);
    }

    /**
     * View protocol details.
     */
    public function show(Request $request, $id)
    {
        $ethics = EthicsApplication::with(['user:id,name,email', 'researchProject', 'approver:id,name', 'documents'])->findOrFail($id);
        $user = $request->user();

        if (!$user->hasAnyRole(['Super Admin', 'Office Admin', 'Reviewer']) && $ethics->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($ethics);
    }

    /**
     * Committee Decision (Approved, Modifications Required, Rejected).
     * Prevents self-approval!
     */
    public function reviewDecision(Request $request, $id)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin', 'Reviewer'])) {
            return response()->json(['message' => 'Unauthorized: Only designated IRB reviewers or administrators may render ethics decisions.'], 403);
        }

        $ethics = EthicsApplication::findOrFail($id);

        if ($ethics->user_id === $user->id) {
            return response()->json(['message' => 'Governance Rule: You cannot review your own ethics application.'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:Approved,Modifications Required,Rejected,Under Review',
            'reviewer_notes' => 'required|string|min:5',
            'expiry_date' => 'nullable|date|after:today',
        ]);

        $expiry = $validated['expiry_date'] ?? ($validated['status'] === 'Approved' ? now()->addYear() : null);

        $ethics->update([
            'status' => $validated['status'],
            'reviewer_notes' => $validated['reviewer_notes'],
            'decision_date' => now(),
            'expiry_date' => $expiry,
            'approved_by' => $user->id,
        ]);

        // Sync with linked project
        if ($ethics->research_project_id) {
            $projectStatus = match ($validated['status']) {
                'Approved' => 'Approved',
                'Rejected' => 'Rejected',
                'Modifications Required' => 'Modifications Required',
                default => 'Pending Review',
            };
            ResearchProject::where('id', $ethics->research_project_id)->update(['ethics_status' => $projectStatus]);
        }

        AuditLog::log('ethics_decision_rendered', 'EthicsApplication', $ethics->id, [
            'protocol_number' => $ethics->protocol_number,
            'status' => $validated['status'],
        ], $user->id);

        return response()->json([
            'message' => "Ethics decision '{$validated['status']}' registered successfully.",
            'protocol' => $ethics->fresh(['user:id,name,email', 'approver:id,name']),
        ]);
    }
}
