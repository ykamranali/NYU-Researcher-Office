<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle public registration with strict role restrictions.
     * Public users can ONLY register as Student or Professor.
     * Self-assigning Super Admin, Office Admin, Reviewer, or Finance Officer is strictly forbidden.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'nullable|string|in:Student,Professor',
        ]);

        // Explicitly enforce non-privileged role
        $requestedRole = $validated['role'] ?? 'Student';
        if (in_array(strtolower($requestedRole), ['super admin', 'office admin', 'reviewer', 'finance officer', 'finance/grants officer'])) {
            return response()->json([
                'message' => 'Unauthorized role assignment. Administrative accounts must be provisioned by the Research Office.'
            ], 403);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole($requestedRole);

        // Create standard researcher/student profile stub
        if ($requestedRole === 'Professor') {
            $user->professorProfile()->create(['title' => 'Faculty Researcher']);
        } else {
            $user->studentProfile()->create();
        }

        AuditLog::log('user_registered', 'User', $user->id, [
            'email' => $user->email,
            'role' => $requestedRole,
        ], $user->id);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => [$requestedRole],
            ],
            'role' => $requestedRole,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Authenticate user with rate limiting and audit logging.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $throttleKey = Str::transliterate(Str::lower($request->input('email')) . '|' . $request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            AuditLog::log('login_rate_limited', 'User', null, [
                'email' => $request->email,
                'retry_after' => $seconds,
            ]);

            return response()->json([
                'message' => "Too many login attempts. Please try again in {$seconds} seconds."
            ], 429);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            RateLimiter::hit($throttleKey, 60);

            AuditLog::log('login_failed', 'User', $user?->id, [
                'email' => $request->email,
                'reason' => 'Invalid credentials',
            ]);

            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our university records.'],
            ]);
        }

        RateLimiter::clear($throttleKey);

        // Revoke prior tokens if single-session enforcement is needed
        // $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;
        $primaryRole = $user->roles->first()?->name ?? 'Student';
        $permissions = $user->getAllPermissions()->pluck('name');

        AuditLog::log('login_success', 'User', $user->id, [
            'email' => $user->email,
            'role' => $primaryRole,
        ], $user->id);

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                'permissions' => $permissions,
            ],
            'role' => $primaryRole,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Invalidate current token and log out.
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            AuditLog::log('logout', 'User', $user->id, [], $user->id);
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Retrieve the current authenticated user's profile and permissions.
     */
    public function user(Request $request)
    {
        $user = $request->user();
        $primaryRole = $user->roles->first()?->name ?? 'Student';

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $primaryRole,
            'roles' => $user->roles->pluck('name'),
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'created_at' => $user->created_at,
        ]);
    }
}
