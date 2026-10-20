<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ResearchCategory extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function researchProjects(): HasMany
    {
        return $this->hasMany(ResearchProject::class);
    }
}
