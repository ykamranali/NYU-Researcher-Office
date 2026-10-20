<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NewsArticleController extends Controller
{
    public function index()
    {
        return response()->json(\App\Models\NewsArticle::all());
    }

    public function store(Request $request)
    {
    }

    public function show(string $id)
    {
    }

    public function update(Request $request, string $id)
    {
    }

    public function destroy(string $id)
    {
    }
}
