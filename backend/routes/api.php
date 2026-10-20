<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ResearchProjectController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Research Projects
    Route::apiResource('projects', ResearchProjectController::class);
    Route::post('projects/{id}/submit', [ResearchProjectController::class, 'submitForReview']);
    Route::post('projects/{id}/approve', [ResearchProjectController::class, 'approve']);

    // CMS Pages
    Route::apiResource('pages', \App\Http\Controllers\PageController::class);

    // Content Engine
    Route::apiResource('news', \App\Http\Controllers\NewsArticleController::class);
    Route::apiResource('events', \App\Http\Controllers\EventController::class);
    Route::apiResource('opportunities', \App\Http\Controllers\OpportunityController::class);
});
