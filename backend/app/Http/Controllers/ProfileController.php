<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\ProfessorProfile;
use App\Models\ResearcherProfile;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's full profile details.
     */
    public function show(Request $request)
    {
        $user = $request->user();
        $role = $user->roles->first()?->name ?? 'Student';

        $profileData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $role,
            'roles' => $user->roles->pluck('name'),
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'created_at' => $user->created_at,
        ];

        if ($role === 'Professor' || $role === 'Reviewer') {
            $prof = ProfessorProfile::with(['faculty', 'department'])->firstOrCreate(['user_id' => $user->id]);
            $profileData['profile'] = $prof;
        } elseif ($role === 'Student') {
            $student = StudentProfile::with(['faculty', 'department'])->firstOrCreate(['user_id' => $user->id]);
            $profileData['profile'] = $student;
        } else {
            $res = ResearcherProfile::with(['faculty', 'department'])->firstOrCreate(['user_id' => $user->id]);
            $profileData['profile'] = $res;
        }

        return response()->json($profileData);
    }

    /**
     * Update user profile information.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'title' => 'nullable|string|max:255',
            'biography' => 'nullable|string|max:3000',
            'research_interests' => 'nullable|array',
            'orcid' => 'nullable|string|max:30',
            'google_scholar' => 'nullable|string|max:255',
            'linkedin' => 'nullable|string|max:255',
            'faculty_id' => 'nullable|exists:faculties,id',
            'department_id' => 'nullable|exists:departments,id',
            'current_password' => 'nullable|string',
            'new_password' => 'nullable|string|min:8|confirmed',
        ]);

        if (isset($validated['name'])) {
            $user->update(['name' => $validated['name']]);
        }

        // Handle password change if requested
        if (!empty($validated['new_password'])) {
            if (empty($validated['current_password']) || !Hash::check($validated['current_password'], $user->password)) {
                return response()->json(['message' => 'The provided current password does not match.'], 422);
            }
            $user->update(['password' => Hash::make($validated['new_password'])]);
            AuditLog::log('password_changed', 'User', $user->id, [], $user->id);
        }

        // Update profile model
        $role = $user->roles->first()?->name ?? 'Student';
        $profileFields = [
            'title' => $validated['title'] ?? null,
            'biography' => $validated['biography'] ?? null,
            'research_interests' => $validated['research_interests'] ?? null,
            'orcid' => $validated['orcid'] ?? null,
            'google_scholar' => $validated['google_scholar'] ?? null,
            'linkedin' => $validated['linkedin'] ?? null,
            'faculty_id' => $validated['faculty_id'] ?? null,
            'department_id' => $validated['department_id'] ?? null,
        ];

        // Clean nulls from update
        $profileFields = array_filter($profileFields, fn($v) => !is_null($v));

        if ($role === 'Professor' || $role === 'Reviewer') {
            ProfessorProfile::updateOrCreate(['user_id' => $user->id], $profileFields);
        } elseif ($role === 'Student') {
            StudentProfile::updateOrCreate(['user_id' => $user->id], $profileFields);
        } else {
            ResearcherProfile::updateOrCreate(['user_id' => $user->id], $profileFields);
        }

        AuditLog::log('profile_updated', 'User', $user->id, [], $user->id);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role,
            ],
        ]);
    }
}
