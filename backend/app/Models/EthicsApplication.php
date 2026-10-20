<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class EthicsApplication extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'protocol_number',
        'title',
        'research_project_id',
        'user_id',
        'review_type',
        'risk_level',
        'status',
        'summary',
        'has_coi',
        'coi_details',
        'reviewer_notes',
        'submission_date',
        'decision_date',
        'expiry_date',
        'approved_by',
    ];

    protected $casts = [
        'has_coi' => 'boolean',
        'submission_date' => 'date',
        'decision_date' => 'date',
        'expiry_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function researchProject(): BelongsTo
    {
        return $this->belongsTo(ResearchProject::class, 'research_project_id');
    }

    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }
}
