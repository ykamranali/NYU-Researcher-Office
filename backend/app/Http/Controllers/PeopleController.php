<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class PeopleController extends Controller
{
    /**
     * List all users with roles and department affiliations.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Super Admin', 'Office Admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = User::with(['roles', 'professorProfile.department', 'studentProfile.department', 'researcherProfile.department']);

        if ($request->filled('role') && $request->role !== 'All') {
            $query->role($request->role);
        }

        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                  ->orWhere('email', 'like', $search);
            });
        }

        $users = $query->latest()->get()->map(function ($u) {
            $role = $u->roles->first()?->name ?? 'Student';
            $dept = $u->professorProfile?->department?->name 
                ?? $u->studentProfile?->department?->name 
                ?? $u->researcherProfile?->department?->name 
                ?? 'University-wide';

            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $role,
                'department' => $dept,
                'status' => 'Active',
                'created_at' => $u->created_at->format('M j, Y'),
            ];
        });

        return response()->json($users);
    }

    /**
     * Admin create a new university user with designated role.
     */
    public function store(Request $request)
    {
        $admin = $request->user();
        if (!$admin->hasAnyRole(['Super Admin', 'Office Admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:Super Admin,Office Admin,Professor,Student,Reviewer,Finance Officer',
            'department_id' => 'nullable|exists:departments,id',
            'faculty_id' => 'nullable|exists:faculties,id',
        ]);

        // Only Super Admin can create another Super Admin
        if ($validated['role'] === 'Super Admin' && !$admin->hasRole('Super Admin')) {
            return response()->json(['message' => 'Only Super Admins can appoint another Super Admin.'], 403);
        }

        $newUser = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
        ]);

        $newUser->assignRole($validated['role']);

        if ($validated['role'] === 'Professor' || $validated['role'] === 'Reviewer') {
            $newUser->professorProfile()->create([
                'faculty_id' => $validated['faculty_id'] ?? null,
                'department_id' => $validated['department_id'] ?? null,
            ]);
        } elseif ($validated['role'] === 'Student') {
            $newUser->studentProfile()->create([
                'faculty_id' => $validated['faculty_id'] ?? null,
                'department_id' => $validated['department_id'] ?? null,
            ]);
        }

        AuditLog::log('user_provisioned', 'User', $newUser->id, [
            'email' => $newUser->email,
            'role' => $validated['role'],
        ], $admin->id);

        return response()->json([
            'message' => 'User account created and role provisioned successfully.',
            'user' => [
                'id' => $newUser->id,
                'name' => $newUser->name,
                'email' => $newUser->email,
                'role' => $validated['role'],
            ],
        ], 201);
    }

    /**
     * Update user role or information.
     */
    public function update(Request $request, $id)
    {
        $admin = $request->user();
        if (!$admin->hasAnyRole(['Super Admin', 'Office Admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $targetUser = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'role' => 'nullable|string|in:Super Admin,Office Admin,Professor,Student,Reviewer,Finance Officer',
        ]);

        if (isset($validated['name'])) {
            $targetUser->update(['name' => $validated['name']]);
        }

        if (isset($validated['role'])) {
            if ($validated['role'] === 'Super Admin' && !$admin->hasRole('Super Admin')) {
                return response()->json(['message' => 'Only Super Admins can grant Super Admin role.'], 403);
            }
            $targetUser->syncRoles([$validated['role']]);
        }

        AuditLog::log('user_updated', 'User', $targetUser->id, [
            'updated_by' => $admin->email,
            'new_role' => $validated['role'] ?? null,
        ], $admin->id);

        return response()->json([
            'message' => 'User details updated successfully',
            'user' => $targetUser->fresh(['roles']),
        ]);
    }

    /**
     * Delete user account.
     */
    public function destroy(Request $request, $id)
    {
        $admin = $request->user();
        if (!$admin->hasRole('Super Admin')) {
            return response()->json(['message' => 'Only Super Admins can delete user accounts.'], 403);
        }

        if ((int) $id === $admin->id) {
            return response()->json(['message' => 'Cannot delete your own administrator account.'], 422);
        }

        $targetUser = User::findOrFail($id);
        $targetUser->delete();

        AuditLog::log('user_deleted', 'User', $id, [], $admin->id);

        return response()->json(['message' => 'User account deleted successfully']);
    }
}
