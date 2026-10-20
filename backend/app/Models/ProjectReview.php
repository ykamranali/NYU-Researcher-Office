<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'research_project_id',
        'reviewer_id',
        'stage',
        'decision',
        'comments',
        'revision_items',
        'decided_at',
    ];

    protected $casts = [
        'revision_items' => 'array',
        'decided_at' => 'datetime',
    ];

    public function researchProject(): BelongsTo
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
