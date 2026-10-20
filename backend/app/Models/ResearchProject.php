<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class ResearchProject extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    protected $casts = [
        'co_investigators' => 'array',
        'milestones' => 'array',
        'start_date' => 'date',
        'expected_completion_date' => 'date',
        'actual_completion_date' => 'date',
        'funding_amount' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function principalInvestigator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function faculty(): BelongsTo
    {
        return $this->belongsTo(Faculty::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ResearchCategory::class, 'research_category_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProjectReview::class)->latest();
    }

    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    public function publications(): HasMany
    {
        return $this->hasMany(Publication::class);
    }

    public function ethicsApplications(): HasMany
    {
        return $this->hasMany(EthicsApplication::class);
    }

    public function grantApplications(): HasMany
    {
        return $this->hasMany(GrantApplication::class);
    }
}
