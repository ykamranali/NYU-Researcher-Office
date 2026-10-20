<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\EthicsApplication;
use App\Models\GrantApplication;
use App\Models\OpportunityApplication;
use App\Models\ProjectReview;
use App\Models\ResearchProject;
use Illuminate\Http\Request;

class ApprovalsController extends Controller
{
    /**
     * Unified institutional approvals inbox.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin', 'Reviewer', 'Finance Officer'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $items = collect();

        // 1. Projects pending review
        $projects = ResearchProject::with('user:id,name,email')
            ->whereIn('status', ['Submitted', 'Under Review', 'Departmental Review', 'Research Office Review'])
            ->get();

        foreach ($projects as $p) {
            $items->push([
                'id' => 'PRJ-' . $p->id,
                'raw_id' => $p->id,
                'entity_type' => 'ResearchProject',
                'type' => 'Research Proposal',
                'title' => $p->title,
                'applicant' => $p->user?->name ?? 'Unknown Researcher',
                'applicant_id' => $p->user_id,
                'date' => $p->updated_at->format('M j, Y'),
                'status' => 'Pending',
                'current_stage' => $p->status,
                'can_approve' => $user->id !== $p->user_id, // Governance: cannot approve own
            ]);
        }

        // 2. Ethics Protocols pending review
        $ethics = EthicsApplication::with('user:id,name,email')
            ->whereIn('status', ['Submitted', 'Under Review'])
            ->get();

        foreach ($ethics as $e) {
            $items->push([
                'id' => 'IRB-' . $e->id,
                'raw_id' => $e->id,
                'entity_type' => 'EthicsApplication',
                'type' => 'Ethics / IRB Review',
                'title' => $e->title,
                'applicant' => $e->user?->name ?? 'Unknown',
                'applicant_id' => $e->user_id,
                'date' => $e->created_at->format('M j, Y'),
                'status' => 'Pending',
                'current_stage' => $e->status,
                'can_approve' => $user->id !== $e->user_id,
            ]);
        }

        // 3. Grants pending review
        if ($user->hasAnyRole(['Super Admin', 'Office Admin', 'Finance Officer'])) {
            $grants = GrantApplication::with('applicant:id,name,email')
                ->whereIn('status', ['Submitted', 'Under Review'])
                ->get();

            foreach ($grants as $g) {
                $items->push([
                    'id' => 'GRT-' . $g->id,
                    'raw_id' => $g->id,
                    'entity_type' => 'GrantApplication',
                    'type' => 'Grant Award Review',
                    'title' => $g->title . ' ($' . number_format($g->requested_amount, 2) . ')',
                    'applicant' => $g->applicant?->name ?? 'Unknown',
                    'applicant_id' => $g->applicant_id,
                    'date' => $g->created_at->format('M j, Y'),
                    'status' => 'Pending',
                    'current_stage' => $g->status,
                    'can_approve' => $user->id !== $g->applicant_id,
                ]);
            }
        }

        return response()->json($items);
    }

    /**
     * Fast-action Approve an item from unified inbox.
     */
    public function approve(Request $request)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin', 'Reviewer', 'Finance Officer'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'entity_type' => 'required|string|in:ResearchProject,EthicsApplication,GrantApplication,OpportunityApplication',
            'raw_id' => 'required|integer',
            'comments' => 'nullable|string',
        ]);

        $comments = $validated['comments'] ?? 'Approved by institutional review authority.';

        switch ($validated['entity_type']) {
            case 'ResearchProject':
                $project = ResearchProject::findOrFail($validated['raw_id']);
                if ($project->user_id === $user->id) {
                    return response()->json(['message' => 'Governance Rule: You cannot approve your own submission.'], 403);
                }
                $project->update(['status' => 'Approved', 'visibility' => 'Public']);
                ProjectReview::create([
                    'research_project_id' => $project->id,
                    'reviewer_id' => $user->id,
                    'stage' => 'Research Office Review',
                    'decision' => 'Approved',
                    'comments' => $comments,
                    'decided_at' => now(),
                ]);
                AuditLog::log('project_approved', 'ResearchProject', $project->id, ['approver' => $user->email], $user->id);
                break;

            case 'EthicsApplication':
                $ethics = EthicsApplication::findOrFail($validated['raw_id']);
                if ($ethics->user_id === $user->id) {
                    return response()->json(['message' => 'Governance Rule: You cannot approve your own ethics protocol.'], 403);
                }
                $ethics->update([
                    'status' => 'Approved',
                    'decision_date' => now(),
                    'expiry_date' => now()->addYear(),
                    'approved_by' => $user->id,
                    'reviewer_notes' => $comments,
                ]);
                if ($ethics->research_project_id) {
                    ResearchProject::where('id', $ethics->research_project_id)->update(['ethics_status' => 'Approved']);
                }
                AuditLog::log('ethics_approved', 'EthicsApplication', $ethics->id, [], $user->id);
                break;

            case 'GrantApplication':
                $grant = GrantApplication::findOrFail($validated['raw_id']);
                if ($grant->applicant_id === $user->id) {
                    return response()->json(['message' => 'Governance Rule: You cannot approve your own grant application.'], 403);
                }
                $grant->update([
                    'status' => 'Awarded',
                    'award_date' => now(),
                    'awarded_amount' => $grant->requested_amount,
                    'financial_notes' => $comments,
                    'finance_officer_id' => $user->id,
                ]);
                AuditLog::log('grant_awarded', 'GrantApplication', $grant->id, [], $user->id);
                break;
        }

        return response()->json([
            'message' => 'Item approved successfully',
        ]);
    }

    /**
     * Fast-action Reject an item from unified inbox.
     */
    public function reject(Request $request)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin', 'Reviewer', 'Finance Officer'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'entity_type' => 'required|string|in:ResearchProject,EthicsApplication,GrantApplication,OpportunityApplication',
            'raw_id' => 'required|integer',
            'comments' => 'required|string|min:5',
        ]);

        switch ($validated['entity_type']) {
            case 'ResearchProject':
                $project = ResearchProject::findOrFail($validated['raw_id']);
                if ($project->user_id === $user->id) {
                    return response()->json(['message' => 'Governance Rule: Self-decision forbidden.'], 403);
                }
                $project->update(['status' => 'Rejected', 'rejection_reason' => $validated['comments']]);
                ProjectReview::create([
                    'research_project_id' => $project->id,
                    'reviewer_id' => $user->id,
                    'stage' => 'Research Office Review',
                    'decision' => 'Rejected',
                    'comments' => $validated['comments'],
                    'decided_at' => now(),
                ]);
                AuditLog::log('project_rejected', 'ResearchProject', $project->id, [], $user->id);
                break;

            case 'EthicsApplication':
                $ethics = EthicsApplication::findOrFail($validated['raw_id']);
                $ethics->update([
                    'status' => 'Rejected',
                    'decision_date' => now(),
                    'reviewer_notes' => $validated['comments'],
                    'approved_by' => $user->id,
                ]);
                AuditLog::log('ethics_rejected', 'EthicsApplication', $ethics->id, [], $user->id);
                break;

            case 'GrantApplication':
                $grant = GrantApplication::findOrFail($validated['raw_id']);
                $grant->update([
                    'status' => 'Rejected',
                    'financial_notes' => $validated['comments'],
                    'finance_officer_id' => $user->id,
                ]);
                AuditLog::log('grant_rejected', 'GrantApplication', $grant->id, [], $user->id);
                break;
        }

        return response()->json([
            'message' => 'Item marked as rejected with reason recorded.',
        ]);
    }
}
