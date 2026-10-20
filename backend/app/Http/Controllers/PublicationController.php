<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Publication;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PublicationController extends Controller
{
    /**
     * Display publications list with filtering.
     */
    public function index(Request $request)
    {
        $query = Publication::with(['user:id,name', 'researchProject:id,title,project_code']);

        if ($request->filled('type') && $request->type !== 'All') {
            $query->where('publication_type', $request->type);
        }

        if ($request->filled('year')) {
            $query->where('publication_year', $request->year);
        }

        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', $search)
                  ->orWhere('authors', 'like', $search)
                  ->orWhere('journal_conference', 'like', $search)
                  ->orWhere('doi', 'like', $search);
            });
        }

        return response()->json($query->latest()->get());
    }

    /**
     * Create a new publication with duplicate DOI detection.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'authors' => 'required|string|max:500',
            'author_affiliations' => 'nullable|string|max:500',
            'journal_conference' => 'required|string|max:255',
            'publication_year' => 'required|integer|min:1900|max:2099',
            'publication_date' => 'nullable|date',
            'doi' => 'nullable|string|max:255',
            'url' => 'nullable|url',
            'publication_type' => 'required|string|in:Journal Article,Conference Paper,Book Chapter,Pre-print,Patent',
            'abstract' => 'nullable|string',
            'keywords' => 'nullable|string',
            'research_project_id' => 'nullable|exists:research_projects,id',
        ]);

        // Duplicate Detection
        if (!empty($validated['doi'])) {
            $existingDoi = Publication::where('doi', $validated['doi'])->first();
            if ($existingDoi) {
                return response()->json([
                    'message' => "A publication with DOI '{$validated['doi']}' is already registered in the directory."
                ], 422);
            }
        }

        $slug = Str::slug($validated['title']) . '-' . substr(uniqid(), -4);

        $publication = Publication::create(array_merge($validated, [
            'slug' => $slug,
            'user_id' => $user->id,
            'verification_status' => $user->hasAnyRole(['Super Admin', 'Office Admin']) ? 'Verified' : 'Pending',
        ]));

        AuditLog::log('publication_created', 'Publication', $publication->id, [
            'title' => $publication->title,
            'doi' => $publication->doi,
        ], $user->id);

        return response()->json([
            'message' => 'Publication added to the university research directory.',
            'publication' => $publication->load(['user:id,name', 'researchProject:id,title']),
        ], 201);
    }

    /**
     * Display publication details.
     */
    public function show($id)
    {
        $publication = Publication::with(['user:id,name,email', 'researchProject'])->findOrFail($id);
        return response()->json($publication);
    }

    /**
     * Update publication.
     */
    public function update(Request $request, $id)
    {
        $publication = Publication::findOrFail($id);
        $user = $request->user();

        if (!$user->hasAnyRole(['Super Admin', 'Office Admin']) && $publication->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'authors' => 'sometimes|required|string|max:500',
            'journal_conference' => 'sometimes|required|string|max:255',
            'publication_year' => 'sometimes|required|integer',
            'publication_date' => 'nullable|date',
            'doi' => 'nullable|string|max:255',
            'url' => 'nullable|url',
            'publication_type' => 'sometimes|required|string',
            'abstract' => 'nullable|string',
            'verification_status' => 'nullable|string|in:Verified,Pending,Flagged',
        ]);

        if (isset($validated['verification_status']) && !$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            unset($validated['verification_status']);
        }

        $publication->update($validated);

        AuditLog::log('publication_updated', 'Publication', $publication->id, [], $user->id);

        return response()->json([
            'message' => 'Publication updated successfully',
            'publication' => $publication,
        ]);
    }

    /**
     * Delete publication.
     */
    public function destroy(Request $request, $id)
    {
        $publication = Publication::findOrFail($id);
        $user = $request->user();

        if (!$user->hasAnyRole(['Super Admin', 'Office Admin']) && $publication->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $publication->delete();

        AuditLog::log('publication_deleted', 'Publication', $id, [], $user->id);

        return response()->json(['message' => 'Publication removed from directory']);
    }

    /**
     * Resolve DOI metadata safely (fails gracefully if unreachable).
     */
    public function resolveDoi(Request $request)
    {
        $request->validate(['doi' => 'required|string']);
        $doi = trim($request->doi);

        // Standard clean regex check
        if (!preg_match('/^10\.\d{4,9}\/[-._;()\/:\w]+$/i', $doi)) {
            return response()->json(['message' => 'Invalid DOI format. Must be in standard 10.xxxx/... format.'], 422);
        }

        // Check local duplicate first
        $existing = Publication::where('doi', $doi)->first();
        if ($existing) {
            return response()->json([
                'found' => true,
                'source' => 'local_directory',
                'publication' => $existing,
            ]);
        }

        return response()->json([
            'found' => false,
            'doi' => $doi,
            'message' => 'DOI format valid. You can proceed with publication details registration.',
        ]);
    }
}
