<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class GrantApplication extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'grant_code',
        'title',
        'opportunity_id',
        'research_project_id',
        'applicant_id',
        'funding_agency',
        'requested_amount',
        'awarded_amount',
        'status',
        'submission_deadline',
        'award_date',
        'project_start_date',
        'project_end_date',
        'budget_breakdown',
        'milestones',
        'total_expended',
        'financial_notes',
        'finance_officer_id',
    ];

    protected $casts = [
        'budget_breakdown' => 'array',
        'milestones' => 'array',
        'requested_amount' => 'decimal:2',
        'awarded_amount' => 'decimal:2',
        'total_expended' => 'decimal:2',
        'submission_deadline' => 'date',
        'award_date' => 'date',
        'project_start_date' => 'date',
        'project_end_date' => 'date',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'applicant_id');
    }

    public function opportunity(): BelongsTo
    {
        return $this->belongsTo(Opportunity::class);
    }

    public function researchProject(): BelongsTo
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function financeOfficer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'finance_officer_id');
    }

    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }
}
