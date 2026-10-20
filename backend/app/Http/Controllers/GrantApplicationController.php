<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\GrantApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GrantApplicationController extends Controller
{
    /**
     * Display a listing of grants.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = GrantApplication::with(['applicant:id,name,email', 'researchProject:id,title,project_code', 'financeOfficer:id,name']);

        // Non-admin/finance users can only view their own grant applications
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin', 'Finance Officer'])) {
            $query->where('applicant_id', $user->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->get());
    }

    /**
     * Submit a new grant proposal.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Students cannot submit grant proposals directly
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin', 'Professor'])) {
            return response()->json([
                'message' => 'Forbidden: Only faculty researchers or administrators may submit institutional grant proposals.'
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'opportunity_id' => 'nullable|exists:opportunities,id',
            'research_project_id' => 'nullable|exists:research_projects,id',
            'funding_agency' => 'required|string|max:255',
            'requested_amount' => 'required|numeric|min:1',
            'submission_deadline' => 'nullable|date',
            'project_start_date' => 'nullable|date',
            'project_end_date' => 'nullable|date',
            'budget_breakdown' => 'nullable|array',
            'milestones' => 'nullable|array',
        ]);

        $year = date('Y');
        $grantCode = DB::transaction(function () use ($year) {
            $lastGrant = GrantApplication::where('grant_code', 'like', "GRT-{$year}-%")
                ->lockForUpdate()
                ->latest('id')
                ->first();

            $next = 1;
            if ($lastGrant && preg_match('/GRT-\d{4}-(\d+)/', $lastGrant->grant_code, $m)) {
                $next = ((int) $m[1]) + 1;
            }
            return sprintf('GRT-%s-%03d', $year, $next);
        });

        $grant = GrantApplication::create(array_merge($validated, [
            'grant_code' => $grantCode,
            'applicant_id' => $user->id,
            'status' => 'Submitted',
            'total_expended' => 0.00,
        ]));

        AuditLog::log('grant_submitted', 'GrantApplication', $grant->id, [
            'grant_code' => $grantCode,
            'requested_amount' => $grant->requested_amount,
        ], $user->id);

        return response()->json([
            'message' => 'Grant proposal submitted successfully for institutional review.',
            'grant' => $grant->load('applicant:id,name,email'),
        ], 201);
    }

    /**
     * Display the specified grant application.
     */
    public function show(Request $request, $id)
    {
        $grant = GrantApplication::with(['applicant:id,name,email', 'researchProject', 'financeOfficer:id,name'])->findOrFail($id);
        $user = $request->user();

        if (!$user->hasAnyRole(['Super Admin', 'Office Admin', 'Finance Officer']) && $grant->applicant_id !== $user->id) {
            return response()->json(['message' => 'Forbidden: You do not have permission to view this grant application.'], 403);
        }

        return response()->json($grant);
    }

    /**
     * Financial / Administrative Award Decision.
     */
    public function awardDecision(Request $request, $id)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin', 'Finance Officer'])) {
            return response()->json(['message' => 'Unauthorized: Financial review requires Finance Officer or Administrator credentials.'], 403);
        }

        $grant = GrantApplication::findOrFail($id);

        // Governance: prevent self-approval of grants
        if ($grant->applicant_id === $user->id) {
            return response()->json([
                'message' => 'Governance Rule: You cannot approve or award your own grant application.'
            ], 403);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:Awarded,Rejected,Under Review,Closed',
            'awarded_amount' => 'nullable|numeric|min:0',
            'financial_notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($grant, $validated, $user) {
            $grant->update([
                'status' => $validated['status'],
                'awarded_amount' => $validated['awarded_amount'] ?? $grant->requested_amount,
                'award_date' => $validated['status'] === 'Awarded' ? now() : $grant->award_date,
                'financial_notes' => $validated['financial_notes'] ?? $grant->financial_notes,
                'finance_officer_id' => $user->id,
            ]);

            AuditLog::log('grant_award_decision', 'GrantApplication', $grant->id, [
                'grant_code' => $grant->grant_code,
                'status' => $validated['status'],
                'awarded_amount' => $grant->awarded_amount,
            ], $user->id);
        });

        return response()->json([
            'message' => "Grant decision '{$validated['status']}' recorded successfully.",
            'grant' => $grant->fresh(),
        ]);
    }

    /**
     * Record expenditure against awarded grant.
     */
    public function recordExpenditure(Request $request, $id)
    {
        $user = $request->user();
        $grant = GrantApplication::findOrFail($id);

        if (!$user->hasAnyRole(['Super Admin', 'Office Admin', 'Finance Officer']) && $grant->applicant_id !== $user->id) {
            return response()->json(['message' => 'Forbidden: You do not have permission to manage this grant.'], 403);
        }

        if ($grant->status !== 'Awarded') {
            return response()->json([
                'message' => 'Cannot record expenditure against a grant that is not in Awarded status.'
            ], 422);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'category' => 'required|string',
            'description' => 'required|string',
        ]);

        $newTotal = $grant->total_expended + $validated['amount'];
        $grant->update(['total_expended' => $newTotal]);

        AuditLog::log('grant_expenditure_logged', 'GrantApplication', $grant->id, [
            'amount' => $validated['amount'],
            'category' => $validated['category'],
            'new_total_expended' => $newTotal,
        ], $user->id);

        return response()->json([
            'message' => 'Expenditure logged successfully',
            'grant' => $grant->fresh(),
        ]);
    }
}
