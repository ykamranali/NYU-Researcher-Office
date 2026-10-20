<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function researchProjects(): HasMany
    {
        return $this->hasMany(ResearchProject::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'uploaded_by');
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
        return $this->hasMany(GrantApplication::class, 'applicant_id');
    }

    public function opportunityApplications(): HasMany
    {
        return $this->hasMany(OpportunityApplication::class, 'applicant_id');
    }

    public function researcherProfile(): HasOne
    {
        return $this->hasOne(ResearcherProfile::class);
    }

    public function studentProfile(): HasOne
    {
        return $this->hasOne(StudentProfile::class);
    }

    public function professorProfile(): HasOne
    {
        return $this->hasOne(ProfessorProfile::class);
    }
}
