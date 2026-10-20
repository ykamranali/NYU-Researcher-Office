<?php

namespace App\Policies;

use App\Models\ResearchProject;
use App\Models\User;

class ResearchProjectPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Office Admin', 'Reviewer', 'Finance Officer', 'Professor']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ResearchProject $project): bool
    {
        if ($user->hasAnyRole(['Super Admin', 'Office Admin', 'Reviewer', 'Finance Officer'])) {
            return true;
        }

        if ($project->visibility === 'Public' && in_array($project->status, ['Approved', 'Active', 'Completed', 'Published'])) {
            return true;
        }

        // Project Owner / PI
        if ($project->user_id === $user->id) {
            return true;
        }

        // Check if listed in co_investigators array
        if (is_array($project->co_investigators)) {
            foreach ($project->co_investigators as $coInv) {
                if (is_array($coInv) && isset($coInv['email']) && strtolower($coInv['email']) === strtolower($user->email)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Office Admin', 'Professor']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ResearchProject $project): bool
    {
        if ($user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            return true;
        }

        // PI can only update if in Draft or Revision Requested
        if ($project->user_id === $user->id && in_array($project->status, ['Draft', 'Revision Requested'])) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ResearchProject $project): bool
    {
        if ($user->hasRole('Super Admin')) {
            return true;
        }

        if ($project->user_id === $user->id && $project->status === 'Draft') {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can submit the project for review.
     */
    public function submit(User $user, ResearchProject $project): bool
    {
        return $project->user_id === $user->id && in_array($project->status, ['Draft', 'Revision Requested']);
    }

    /**
     * Determine whether the user can review or request revisions.
     * Prevents self-review!
     */
    public function review(User $user, ResearchProject $project): bool
    {
        if ($project->user_id === $user->id) {
            return false; // Prohibit self-review
        }

        return $user->hasAnyRole(['Super Admin', 'Office Admin', 'Reviewer']);
    }

    /**
     * Determine whether the user can approve the project.
     * Prevents self-approval!
     */
    public function approve(User $user, ResearchProject $project): bool
    {
        if ($project->user_id === $user->id) {
            return false; // Prohibit self-approval
        }

        return $user->hasAnyRole(['Super Admin', 'Office Admin']);
    }
}
