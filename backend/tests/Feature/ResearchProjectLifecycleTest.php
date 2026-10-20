<?php

namespace Tests\Feature;

use App\Models\ResearchProject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ResearchProjectLifecycleTest extends TestCase
{
    use RefreshDatabase;

    protected User $professor;
    protected User $anotherProfessor;
    protected User $admin;
    protected User $student;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Office Admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Professor', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Student', 'guard_name' => 'web']);

        $this->professor = User::firstOrCreate(
            ['email' => 'prof.lifecycle@nyu.edu'],
            ['name' => 'Prof. Testing', 'password' => bcrypt('password')]
        );
        $this->professor->syncRoles(['Professor']);

        $this->anotherProfessor = User::firstOrCreate(
            ['email' => 'prof.other@nyu.edu'],
            ['name' => 'Prof. Other', 'password' => bcrypt('password')]
        );
        $this->anotherProfessor->syncRoles(['Professor']);

        $this->admin = User::firstOrCreate(
            ['email' => 'admin.lifecycle@nyu.edu'],
            ['name' => 'Admin Testing', 'password' => bcrypt('password')]
        );
        $this->admin->syncRoles(['Office Admin']);

        $this->student = User::firstOrCreate(
            ['email' => 'student.lifecycle@nyu.edu'],
            ['name' => 'Student Testing', 'password' => bcrypt('password')]
        );
        $this->student->syncRoles(['Student']);
    }

    public function test_professor_can_create_draft_project_with_unique_reference(): void
    {
        Sanctum::actingAs($this->professor);

        $payload = [
            'title' => 'Neuro-Symbolic Reasoning in Autonomous Robotics',
            'short_description' => 'Hybrid neural network representations for spatial planning.',
            'visibility' => 'Private',
        ];

        $response = $this->postJson('/api/projects', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('project.status', 'Draft');

        $projectCode = $response->json('project.project_code');
        $this->assertMatchesRegularExpression('/PRJ-\d{4}-\d{4}/', $projectCode);
        $this->assertEquals($this->professor->id, $response->json('project.user_id'));
    }

    public function test_professor_cannot_approve_their_own_project(): void
    {
        $project = ResearchProject::create([
            'user_id' => $this->professor->id,
            'project_code' => 'PRJ-2026-9901',
            'title' => 'Self Approval Test Project',
            'slug' => 'self-approval-test-project',
            'short_description' => 'Testing self approval prevention',
            'status' => 'Submitted',
            'visibility' => 'Private',
        ]);

        Sanctum::actingAs($this->professor);

        $response = $this->postJson("/api/projects/{$project->id}/approve");

        // Must reject self-approval per university governance rule
        $response->assertStatus(403);
        $this->assertDatabaseHas('research_projects', [
            'id' => $project->id,
            'status' => 'Submitted',
        ]);
    }

    public function test_office_admin_can_approve_project_and_set_public(): void
    {
        $project = ResearchProject::create([
            'user_id' => $this->professor->id,
            'project_code' => 'PRJ-2026-9902',
            'title' => 'Admin Approval Test Project',
            'slug' => 'admin-approval-test-project',
            'short_description' => 'Testing administrative approval transition',
            'status' => 'Submitted',
            'visibility' => 'Private',
        ]);

        Sanctum::actingAs($this->admin);

        $response = $this->postJson("/api/projects/{$project->id}/review", [
            'decision' => 'Approved',
            'comments' => 'Proposal verified by Research Administration.',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('research_projects', [
            'id' => $project->id,
            'status' => 'Approved',
            'visibility' => 'Public',
        ]);
    }

    public function test_unauthorized_user_cannot_view_private_draft_project(): void
    {
        $privateProject = ResearchProject::create([
            'user_id' => $this->professor->id,
            'project_code' => 'PRJ-2026-9903',
            'title' => 'Confidential Proposal',
            'slug' => 'confidential-proposal',
            'short_description' => 'Unpublished draft',
            'status' => 'Draft',
            'visibility' => 'Private',
        ]);

        // Attempt access as another professor (IDOR attack test)
        Sanctum::actingAs($this->anotherProfessor);
        $response = $this->getJson("/api/projects/{$privateProject->id}");
        $response->assertStatus(403);

        // Attempt access as student
        Sanctum::actingAs($this->student);
        $studentResponse = $this->getJson("/api/projects/{$privateProject->id}");
        $studentResponse->assertStatus(403);
    }
}
