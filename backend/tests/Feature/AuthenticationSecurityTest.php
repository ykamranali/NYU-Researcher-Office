<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthenticationSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Ensure roles exist
        Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Office Admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Professor', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Student', 'guard_name' => 'web']);
    }

    public function test_anonymous_users_cannot_access_protected_apis(): void
    {
        $this->getJson('/api/user')->assertStatus(401);
        $this->getJson('/api/projects')->assertStatus(401);
        $this->getJson('/api/documents')->assertStatus(401);
        $this->getJson('/api/approvals')->assertStatus(401);
        $this->getJson('/api/reports/analytics')->assertStatus(401);
    }

    public function test_public_registration_cannot_self_assign_super_admin(): void
    {
        $payload = [
            'name' => 'Malicious Actor',
            'email' => 'hacker@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'Super Admin',
        ];

        $response = $this->postJson('/api/register', $payload);
        // Must reject self-privilege assignment
        $response->assertStatus(422);

        $this->assertDatabaseMissing('users', ['email' => 'hacker@example.com']);
    }

    public function test_public_registration_cannot_self_assign_office_admin(): void
    {
        $payload = [
            'name' => 'Infiltrator',
            'email' => 'infiltrator@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'Office Admin',
        ];

        $response = $this->postJson('/api/register', $payload);
        $response->assertStatus(422);

        $this->assertDatabaseMissing('users', ['email' => 'infiltrator@example.com']);
    }

    public function test_public_registration_succeeds_for_student_or_professor(): void
    {
        $payload = [
            'name' => 'Valid Student',
            'email' => 'student.valid@nyu.edu',
            'password' => 'SecurePass2026!',
            'password_confirmation' => 'SecurePass2026!',
            'role' => 'Student',
        ];

        $response = $this->postJson('/api/register', $payload);
        $response->assertStatus(201)
            ->assertJsonStructure(['access_token', 'user' => ['id', 'email', 'name']]);

        $user = User::where('email', 'student.valid@nyu.edu')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasRole('Student'));
    }

    public function test_user_can_login_and_receive_sanctum_token(): void
    {
        $user = User::create([
            'name' => 'Faculty Member',
            'email' => 'faculty.test@nyu.edu',
            'password' => bcrypt('StrongSecret123!'),
        ]);
        $user->assignRole('Professor');

        $response = $this->postJson('/api/login', [
            'email' => 'faculty.test@nyu.edu',
            'password' => 'StrongSecret123!',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['access_token', 'user', 'role'])
            ->assertJson(['role' => 'Professor']);
    }

    public function test_invalid_credentials_are_rejected(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'nonexistent@nyu.edu',
            'password' => 'WrongPass',
        ]);

        $response->assertStatus(422);
    }
}
