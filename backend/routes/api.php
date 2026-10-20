<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ResearchProjectController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\PublicationController;
use App\Http\Controllers\OpportunityController;
use App\Http\Controllers\OpportunityApplicationController;
use App\Http\Controllers\GrantApplicationController;
use App\Http\Controllers\EthicsApplicationController;
use App\Http\Controllers\ApprovalsController;
use App\Http\Controllers\PeopleController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SystemSettingsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MetadataController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\NewsArticleController;
use App\Http\Controllers\EventController;

/*
|--------------------------------------------------------------------------
| Public API Routes
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/metadata', [MetadataController::class, 'index']);

// Public Read-Only Feeds
Route::get('/public/news', [NewsArticleController::class, 'index']);
Route::get('/public/events', [EventController::class, 'index']);
Route::get('/public/opportunities', [OpportunityController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Protected University Portal Routes (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Session & User Context
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    // Dashboard Overview Statistics
    Route::get('/dashboard/stats', [ResearchProjectController::class, 'statistics']);

    // Research Project Management Lifecycle
    Route::get('/projects', [ResearchProjectController::class, 'index']);
    Route::post('/projects', [ResearchProjectController::class, 'store']);
    Route::get('/projects/{id}', [ResearchProjectController::class, 'show']);
    Route::put('/projects/{id}', [ResearchProjectController::class, 'update']);
    Route::delete('/projects/{id}', [ResearchProjectController::class, 'destroy']);
    Route::post('/projects/{id}/submit', [ResearchProjectController::class, 'submitForReview']);
    Route::post('/projects/{id}/review', [ResearchProjectController::class, 'reviewDecision']);
    Route::post('/projects/{id}/approve', [ResearchProjectController::class, 'approve']);

    // Secure Document Management
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::post('/documents', [DocumentController::class, 'store']);
    Route::get('/documents/{id}/download', [DocumentController::class, 'download']);
    Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);

    // Publications Directory
    Route::apiResource('publications', PublicationController::class);
    Route::post('/publications/resolve-doi', [PublicationController::class, 'resolveDoi']);

    // Opportunities & Student Applications
    Route::apiResource('opportunities', OpportunityController::class);
    Route::get('/opportunity-applications', [OpportunityApplicationController::class, 'index']);
    Route::post('/opportunity-applications', [OpportunityApplicationController::class, 'store']);
    Route::patch('/opportunity-applications/{id}/status', [OpportunityApplicationController::class, 'updateStatus']);

    // Grants & Funding
    Route::get('/grants', [GrantApplicationController::class, 'index']);
    Route::post('/grants', [GrantApplicationController::class, 'store']);
    Route::get('/grants/{id}', [GrantApplicationController::class, 'show']);
    Route::post('/grants/{id}/award', [GrantApplicationController::class, 'awardDecision']);
    Route::post('/grants/{id}/expenditure', [GrantApplicationController::class, 'recordExpenditure']);

    // Ethics & Research Compliance (IRB)
    Route::get('/ethics', [EthicsApplicationController::class, 'index']);
    Route::post('/ethics', [EthicsApplicationController::class, 'store']);
    Route::get('/ethics/{id}', [EthicsApplicationController::class, 'show']);
    Route::post('/ethics/{id}/review', [EthicsApplicationController::class, 'reviewDecision']);

    // Unified Review & Approvals Inbox
    Route::get('/approvals', [ApprovalsController::class, 'index']);
    Route::post('/approvals/approve', [ApprovalsController::class, 'approve']);
    Route::post('/approvals/reject', [ApprovalsController::class, 'reject']);

    // People & Role Administration
    Route::get('/people', [PeopleController::class, 'index']);
    Route::post('/people', [PeopleController::class, 'store']);
    Route::put('/people/{id}', [PeopleController::class, 'update']);
    Route::delete('/people/{id}', [PeopleController::class, 'destroy']);

    // Institutional Reports & Analytics
    Route::get('/reports/analytics', [ReportController::class, 'index']);

    // System Settings
    Route::get('/system/settings', [SystemSettingsController::class, 'index']);
    Route::put('/system/settings', [SystemSettingsController::class, 'update']);

    // Content Engine (CMS Pages, News, Events)
    Route::apiResource('pages', PageController::class);
    Route::apiResource('news', NewsArticleController::class);
    Route::apiResource('events', EventController::class);
});
