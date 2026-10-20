<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Opportunity;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OpportunityController extends Controller
{
    /**
     * Display a listing of opportunities with type and status filtering.
     */
    public function index(Request $request)
    {
        $query = Opportunity::query();

        if ($request->filled('type') && $request->type !== 'All Types' && $request->type !== 'All') {
            $query->where('type', $request->type);
        }

        if ($request->has('active_only')) {
            $query->where('is_active', true);
        }

        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', $search)
                  ->orWhere('description', 'like', $search)
                  ->orWhere('department', 'like', $search);
            });
        }

        return response()->json($query->latest()->get());
    }

    /**
     * Store a newly created opportunity (Office Admin / Super Admin only).
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            return response()->json(['message' => 'Unauthorized: Only Research Administrators can post opportunities.'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:Grant,Fellowship,Assistantship,Postdoc,Seed Funding,Internship',
            'description' => 'required|string',
            'department' => 'nullable|string|max:255',
            'funding_amount' => 'nullable|numeric|min:0',
            'deadline' => 'nullable|date',
            'application_link' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $baseSlug = Str::slug($validated['title']);
        $slug = $baseSlug . '-' . substr(uniqid(), -4);

        $opportunity = Opportunity::create(array_merge($validated, [
            'slug' => $slug,
            'is_active' => $validated['is_active'] ?? true,
        ]));

        AuditLog::log('opportunity_created', 'Opportunity', $opportunity->id, [
            'title' => $opportunity->title,
        ], $user->id);

        return response()->json([
            'message' => 'Opportunity published successfully',
            'opportunity' => $opportunity,
        ], 201);
    }

    /**
     * Display the specified opportunity.
     */
    public function show($id)
    {
        $opportunity = Opportunity::with('applications.applicant:id,name,email')->findOrFail($id);
        return response()->json($opportunity);
    }

    /**
     * Update the specified opportunity.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $opportunity = Opportunity::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string',
            'description' => 'sometimes|required|string',
            'department' => 'nullable|string',
            'funding_amount' => 'nullable|numeric|min:0',
            'deadline' => 'nullable|date',
            'application_link' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $opportunity->update($validated);

        AuditLog::log('opportunity_updated', 'Opportunity', $opportunity->id, [], $user->id);

        return response()->json([
            'message' => 'Opportunity updated successfully',
            'opportunity' => $opportunity,
        ]);
    }

    /**
     * Remove the specified opportunity.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $opportunity = Opportunity::findOrFail($id);
        $opportunity->delete();

        AuditLog::log('opportunity_deleted', 'Opportunity', $id, [], $user->id);

        return response()->json(['message' => 'Opportunity deleted successfully']);
    }
}
