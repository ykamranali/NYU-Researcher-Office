<?php

namespace App\Http\Controllers;

use App\Models\ResearchProject;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ResearchProjectController extends Controller
{
    public function index(Request $request)
    {
        $query = ResearchProject::query();
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'short_description' => 'required|string',
            'full_description' => 'nullable|string',
            'research_category_id' => 'nullable|exists:research_categories,id',
            'start_date' => 'nullable|date',
            'expected_completion_date' => 'nullable|date',
            'funding_source' => 'nullable|string',
            'funding_amount' => 'nullable|numeric',
        ]);

        $projectCode = 'PRJ-' . date('Y') . '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
        $slug = Str::slug($validated['title']) . '-' . rand(100, 999);

        $project = ResearchProject::create(array_merge($validated, [
            'project_code' => $projectCode,
            'slug' => $slug,
            'status' => 'Draft',
            'visibility' => 'Private',
        ]));

        return response()->json([
            'message' => 'Project created successfully',
            'project' => $project
        ], 201);
    }

    public function show($id)
    {
        $project = ResearchProject::findOrFail($id);
        return response()->json($project);
    }

    public function update(Request $request, $id)
    {
        $project = ResearchProject::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'short_description' => 'sometimes|required|string',
            'full_description' => 'nullable|string',
            'status' => 'sometimes|required|string|in:Draft,Submitted,Under Review,Approved,Active,In Progress,On Hold,Completed,Published,Archived,Rejected',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $project->title) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . rand(100, 999);
        }

        $project->update($validated);

        return response()->json([
            'message' => 'Project updated successfully',
            'project' => $project
        ]);
    }

    public function destroy($id)
    {
        $project = ResearchProject::findOrFail($id);
        $project->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }

    public function submitForReview($id)
    {
        $project = ResearchProject::findOrFail($id);
        $project->update(['status' => 'Submitted']);
        
        return response()->json([
            'message' => 'Project submitted for review',
            'project' => $project
        ]);
    }

    public function approve($id)
    {
        $project = ResearchProject::findOrFail($id);
        $project->update([
            'status' => 'Approved',
            'visibility' => 'Public'
        ]);
        
        return response()->json([
            'message' => 'Project approved',
            'project' => $project
        ]);
    }
}
