<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\NewsArticle;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NewsArticleController extends Controller
{
    /**
     * Display a listing of news articles.
     */
    public function index(Request $request)
    {
        $query = NewsArticle::query();

        // If not admin, only show published
        $user = $request->user('sanctum');
        if (!$user || !$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            $query->where('is_published', true);
        }

        return response()->json($query->latest()->get());
    }

    /**
     * Store a newly created news article.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string|max:500',
            'content' => 'required|string',
            'author' => 'nullable|string|max:255',
            'featured_image' => 'nullable|string',
            'is_published' => 'nullable|boolean',
        ]);

        $slug = Str::slug($validated['title']) . '-' . substr(uniqid(), -4);

        $article = NewsArticle::create(array_merge($validated, [
            'slug' => $slug,
            'is_published' => $validated['is_published'] ?? true,
            'published_at' => ($validated['is_published'] ?? true) ? now() : null,
        ]));

        AuditLog::log('news_article_created', 'NewsArticle', $article->id, [], $user->id);

        return response()->json([
            'message' => 'News article published successfully',
            'article' => $article,
        ], 201);
    }

    /**
     * Display the specified news article.
     */
    public function show($id)
    {
        $article = NewsArticle::where('id', $id)->orWhere('slug', $id)->firstOrFail();
        return response()->json($article);
    }

    /**
     * Update the specified news article.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $article = NewsArticle::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'summary' => 'nullable|string',
            'content' => 'sometimes|required|string',
            'author' => 'nullable|string',
            'featured_image' => 'nullable|string',
            'is_published' => 'nullable|boolean',
        ]);

        $article->update($validated);

        AuditLog::log('news_article_updated', 'NewsArticle', $article->id, [], $user->id);

        return response()->json([
            'message' => 'News article updated successfully',
            'article' => $article,
        ]);
    }

    /**
     * Remove the specified news article.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $article = NewsArticle::findOrFail($id);
        $article->delete();

        AuditLog::log('news_article_deleted', 'NewsArticle', $id, [], $user->id);

        return response()->json(['message' => 'News article removed successfully']);
    }
}
