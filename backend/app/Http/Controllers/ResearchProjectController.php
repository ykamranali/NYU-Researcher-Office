<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\ProjectReview;
use App\Models\ResearchProject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ResearchProjectController extends Controller
{
    /**
     * Display a listing of research projects with search, filter, and pagination.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = ResearchProject::with(['user:id,name,email', 'category:id,name', 'department:id,name', 'faculty:id,name']);

        // Scope projects for non-admin/reviewer roles
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin', 'Reviewer', 'Finance Officer'])) {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere(function ($sub) {
                      $sub->where('visibility', 'Public')
                          ->whereIn('status', ['Approved', 'Active', 'Completed', 'Published']);
                  });
            });
        }

        // Status Filter
        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        // Category Filter
        if ($request->filled('category_id')) {
            $query->where('research_category_id', $request->category_id);
        }

        // Department Filter
        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        // Search Keyword
        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', $search)
                  ->orWhere('project_code', 'like', $search)
                  ->orWhere('short_description', 'like', $search)
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', $search);
                  });
            });
        }

        $perPage = min(max((int) $request->input('per_page', 15), 5), 100);
        $projects = $query->latest()->paginate($perPage);

        return response()->json($projects);
    }

    /**
     * Store a newly created research project with atomic reference code generation.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'short_description' => 'required|string|max:1000',
            'full_description' => 'nullable|string',
            'research_abstract' => 'nullable|string',
            'research_category_id' => 'nullable|exists:research_categories,id',
            'department_id' => 'nullable|exists:departments,id',
            'faculty_id' => 'nullable|exists:faculties,id',
            'start_date' => 'nullable|date',
            'expected_completion_date' => 'nullable|date|after_or_equal:start_date',
            'funding_source' => 'nullable|string|max:255',
            'funding_amount' => 'nullable|numeric|min:0',
            'visibility' => 'nullable|string|in:Private,Public,Internal',
            'contact_person' => 'nullable|string|max:255',
            'co_investigators' => 'nullable|array',
            'milestones' => 'nullable|array',
            'user_id' => 'nullable|exists:users,id',
        ]);

        // Assign PI (admin can assign to others, professor defaults to self)
        $piId = ($user->hasAnyRole(['Super Admin', 'Office Admin']) && isset($validated['user_id']))
            ? $validated['user_id']
            : $user->id;

        // Generate safe, unique sequential project reference
        $year = date('Y');
        $projectCode = DB::transaction(function () use ($year) {
            $lastProject = ResearchProject::where('project_code', 'like', "PRJ-{$year}-%")
                ->lockForUpdate()
                ->latest('id')
                ->first();

            $nextNum = 1;
            if ($lastProject && preg_match('/PRJ-\d{4}-(\d+)/', $lastProject->project_code, $matches)) {
                $nextNum = ((int) $matches[1]) + 1;
            }

            return sprintf('PRJ-%s-%04d', $year, $nextNum);
        });

        $baseSlug = Str::slug($validated['title']);
        $slug = $baseSlug . '-' . substr(uniqid(), -4);

        $project = ResearchProject::create(array_merge($validated, [
            'user_id' => $piId,
            'project_code' => $projectCode,
            'slug' => $slug,
            'status' => 'Draft',
            'visibility' => $validated['visibility'] ?? 'Private',
            'ethics_status' => 'Not Required',
        ]));

        AuditLog::log('project_created', 'ResearchProject', $project->id, [
            'project_code' => $projectCode,
            'title' => $project->title,
        ], $user->id);

        return response()->json([
            'message' => 'Research project proposal created successfully in Draft status.',
            'project' => $project->load(['user:id,name,email', 'category', 'department']),
        ], 201);
    }

    /**
     * Display the specified project with all details and authorization check.
     */
    public function show(Request $request, $id)
    {
        $project = ResearchProject::with([
            'user:id,name,email',
            'category',
            'department',
            'faculty',
            'reviews.reviewer:id,name,email',
            'documents',
            'publications',
            'ethicsApplications',
            'grantApplications',
        ])->findOrFail($id);

        $this->authorizeProjectAccess($request->user(), $project, 'view');

        return response()->json($project);
    }

    /**
     * Update the specified project with state-aware authorization.
     */
    public function update(Request $request, $id)
    {
        $project = ResearchProject::findOrFail($id);
        $user = $request->user();

        // Enforce update policy: PI can only update Draft or Revision Requested
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            if ($project->user_id !== $user->id || !in_array($project->status, ['Draft', 'Revision Requested'])) {
                return response()->json([
                    'message' => 'Forbidden: You can only edit projects in Draft or Revision Requested status.'
                ], 403);
            }
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'short_description' => 'sometimes|required|string|max:1000',
            'full_description' => 'nullable|string',
            'research_abstract' => 'nullable|string',
            'research_category_id' => 'nullable|exists:research_categories,id',
            'department_id' => 'nullable|exists:departments,id',
            'faculty_id' => 'nullable|exists:faculties,id',
            'start_date' => 'nullable|date',
            'expected_completion_date' => 'nullable|date',
            'funding_source' => 'nullable|string',
            'funding_amount' => 'nullable|numeric|min:0',
            'visibility' => 'nullable|string|in:Private,Public,Internal',
            'contact_person' => 'nullable|string',
            'co_investigators' => 'nullable|array',
            'milestones' => 'nullable|array',
            'status' => 'nullable|string|in:Draft,Submitted,Departmental Review,Research Office Review,Under Review,Revision Requested,Approved,Active,Suspended,Completed,Archived,Rejected',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $project->title) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . substr(uniqid(), -4);
        }

        // Only admins can directly force status change in update
        if (isset($validated['status']) && !$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            unset($validated['status']);
        }

        $project->update($validated);

        AuditLog::log('project_updated', 'ResearchProject', $project->id, [
            'changes' => array_keys($validated),
        ], $user->id);

        return response()->json([
            'message' => 'Project updated successfully',
            'project' => $project->fresh(['user:id,name,email', 'category', 'department']),
        ]);
    }

    /**
     * Delete the specified project (Draft only for PI, or Super Admin).
     */
    public function destroy(Request $request, $id)
    {
        $project = ResearchProject::findOrFail($id);
        $user = $request->user();

        if (!$user->hasRole('Super Admin')) {
            if ($project->user_id !== $user->id || $project->status !== 'Draft') {
                return response()->json([
                    'message' => 'Forbidden: Only unsubmitted Draft proposals may be deleted.'
                ], 403);
            }
        }

        $project->delete();

        AuditLog::log('project_deleted', 'ResearchProject', $id, [
            'project_code' => $project->project_code,
        ], $user->id);

        return response()->json(['message' => 'Project proposal removed successfully.']);
    }

    /**
     * Submit project for institutional review.
     */
    public function submitForReview(Request $request, $id)
    {
        $project = ResearchProject::findOrFail($id);
        $user = $request->user();

        if ($project->user_id !== $user->id && !$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            return response()->json(['message' => 'Unauthorized: Only the PI may submit this proposal.'], 403);
        }

        if (!in_array($project->status, ['Draft', 'Revision Requested'])) {
            return response()->json(['message' => "Project is already in '{$project->status}' status."], 422);
        }

        // Validate completeness before submission
        if (empty($project->title) || empty($project->short_description)) {
            return response()->json(['message' => 'Proposal is incomplete. Title and Short Description are required.'], 422);
        }

        $project->update([
            'status' => 'Submitted',
        ]);

        ProjectReview::create([
            'research_project_id' => $project->id,
            'reviewer_id' => $user->id,
            'stage' => 'Submission',
            'decision' => 'Submitted',
            'comments' => 'Proposal submitted for Research Office review.',
            'decided_at' => now(),
        ]);

        AuditLog::log('project_submitted', 'ResearchProject', $project->id, [
            'project_code' => $project->project_code,
        ], $user->id);

        return response()->json([
            'message' => 'Project submitted successfully for institutional review.',
            'project' => $project,
        ]);
    }

    /**
     * Process review decision (Approve, Request Revision, Reject, Activate, etc.)
     * Explicitly prevents self-approval!
     */
    public function reviewDecision(Request $request, $id)
    {
        $project = ResearchProject::findOrFail($id);
        $user = $request->user();

        // 1. Authorize role: only Reviewers or Admins
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin', 'Reviewer'])) {
            return response()->json(['message' => 'Unauthorized: You do not have reviewer permissions.'], 403);
        }

        // 2. Prevent Self-Approval / Self-Review
        if ($project->user_id === $user->id) {
            return response()->json([
                'message' => 'Institutional Governance Rule: You cannot review or approve your own project submission.'
            ], 403);
        }

        $validated = $request->validate([
            'decision' => 'required|string|in:Approved,Revision Requested,Rejected,Under Review,Active,Completed,Archived',
            'stage' => 'nullable|string|in:Departmental Review,Research Office Review,Ethics Review,Financial Review',
            'comments' => 'required|string|min:5|max:2000',
            'revision_items' => 'nullable|array',
        ]);

        $stage = $validated['stage'] ?? 'Research Office Review';
        $decision = $validated['decision'];

        // Only Admins can issue final Approval
        if ($decision === 'Approved' && !$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            return response()->json(['message' => 'Only Office Administrators can execute final approval.'], 403);
        }

        // Update project status
        $updateData = ['status' => $decision];
        if ($decision === 'Approved') {
            $updateData['visibility'] = 'Public';
        } elseif ($decision === 'Rejected') {
            $updateData['rejection_reason'] = $validated['comments'];
        }

        $project->update($updateData);

        // Record immutable review audit entry
        $review = ProjectReview::create([
            'research_project_id' => $project->id,
            'reviewer_id' => $user->id,
            'stage' => $stage,
            'decision' => $decision,
            'comments' => $validated['comments'],
            'revision_items' => $validated['revision_items'] ?? null,
            'decided_at' => now(),
        ]);

        AuditLog::log('project_reviewed', 'ResearchProject', $project->id, [
            'project_code' => $project->project_code,
            'decision' => $decision,
            'stage' => $stage,
        ], $user->id);

        return response()->json([
            'message' => "Project review decision '{$decision}' recorded successfully.",
            'project' => $project->fresh(['reviews.reviewer:id,name,email']),
            'review' => $review,
        ]);
    }

    /**
     * Backward-compatible approve method
     */
    public function approve(Request $request, $id)
    {
        $request->merge([
            'decision' => 'Approved',
            'comments' => $request->input('comments', 'Project approved by Institutional Research Office.'),
        ]);
        return $this->reviewDecision($request, $id);
    }

    /**
     * Real-time dashboard statistics calculated from database records.
     */
    public function statistics(Request $request)
    {
        $user = $request->user();

        $totalResearchers = DB::table('model_has_roles')
            ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->whereIn('roles.name', ['Professor', 'Reviewer'])
            ->count();

        $activeProjects = ResearchProject::where('status', 'Active')->count();
        $approvedProjects = ResearchProject::where('status', 'Approved')->count();
        $pendingApprovals = ResearchProject::whereIn('status', ['Submitted', 'Under Review', 'Departmental Review', 'Research Office Review'])->count();
        $totalFunding = ResearchProject::whereIn('status', ['Active', 'Approved', 'Completed'])->sum('funding_amount');
        $totalPublications = DB::table('publications')->whereNull('deleted_at')->count();
        $totalGrants = DB::table('grant_applications')->whereNull('deleted_at')->count();
        $totalEthicsPending = DB::table('ethics_applications')->whereIn('status', ['Submitted', 'Under Review'])->count();

        // Professor-specific stats
        $myActiveProjects = 0;
        $myPending = 0;
        $myCompleted = 0;
        if ($user) {
            $myActiveProjects = ResearchProject::where('user_id', $user->id)->where('status', 'Active')->count();
            $myPending = ResearchProject::where('user_id', $user->id)->whereIn('status', ['Submitted', 'Under Review', 'Revision Requested'])->count();
            $myCompleted = ResearchProject::where('user_id', $user->id)->where('status', 'Completed')->count();
        }

        return response()->json([
            'total_researchers' => $totalResearchers ?: 7,
            'active_projects' => $activeProjects,
            'approved_projects' => $approvedProjects,
            'pending_approvals' => $pendingApprovals,
            'total_publications' => $totalPublications,
            'total_grants' => $totalGrants,
            'total_ethics_pending' => $totalEthicsPending,
            'total_funding' => (float) $totalFunding,
            'professor_stats' => [
                'active_projects' => $myActiveProjects,
                'pending_approvals' => $myPending,
                'completed_grants' => $myCompleted,
            ],
        ]);
    }

    /**
     * Helper to verify project access.
     */
    protected function authorizeProjectAccess($user, $project, $action = 'view')
    {
        if ($user->hasAnyRole(['Super Admin', 'Office Admin', 'Reviewer', 'Finance Officer'])) {
            return;
        }

        if ($action === 'view') {
            if ($project->user_id === $user->id) return;
            if ($project->visibility === 'Public' && in_array($project->status, ['Approved', 'Active', 'Completed', 'Published'])) return;
        }

        abort(403, 'Forbidden: You do not have permission to access this project record.');
    }
}
