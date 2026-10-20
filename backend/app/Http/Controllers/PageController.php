<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Page;
use App\Models\PageBlock;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PageController extends Controller
{
    public function index()
    {
        return response()->json(Page::with('blocks')->get());
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            return response()->json(['message' => 'Unauthorized: Only Research Administrators can manage CMS pages.'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'status' => 'required|string|in:Draft,Published,Scheduled,Archived',
            'blocks' => 'nullable|array',
        ]);

        $page = Page::create([
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . rand(100, 999),
            'status' => $validated['status'],
        ]);

        if (isset($validated['blocks'])) {
            foreach ($validated['blocks'] as $index => $block) {
                PageBlock::create([
                    'page_id' => $page->id,
                    'type' => $block['type'],
                    'content' => $block['content'],
                    'order' => $index,
                ]);
            }
        }

        AuditLog::log('page_created', 'Page', $page->id, ['title' => $page->title], $user->id);

        return response()->json([
            'message' => 'Page created successfully',
            'page' => $page->load('blocks')
        ], 201);
    }

    public function show($id)
    {
        return response()->json(Page::with('blocks')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            return response()->json(['message' => 'Unauthorized: Only Research Administrators can manage CMS pages.'], 403);
        }

        $page = Page::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|string|in:Draft,Published,Scheduled,Archived',
            'blocks' => 'nullable|array',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $page->title) {
            $page->slug = Str::slug($validated['title']) . '-' . rand(100, 999);
        }

        $page->update($validated);

        if (isset($validated['blocks'])) {
            $page->blocks()->delete();
            foreach ($validated['blocks'] as $index => $block) {
                PageBlock::create([
                    'page_id' => $page->id,
                    'type' => $block['type'],
                    'content' => $block['content'],
                    'order' => $index,
                ]);
            }
        }

        AuditLog::log('page_updated', 'Page', $page->id, [], $user->id);

        return response()->json([
            'message' => 'Page updated successfully',
            'page' => $page->load('blocks')
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            return response()->json(['message' => 'Unauthorized: Only Research Administrators can manage CMS pages.'], 403);
        }

        $page = Page::findOrFail($id);
        $page->delete();

        AuditLog::log('page_deleted', 'Page', $id, [], $user->id);

        return response()->json(['message' => 'Page deleted successfully']);
    }
}
