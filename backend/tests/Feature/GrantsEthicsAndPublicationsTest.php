<?php

namespace Tests\Feature;

use App\Models\EthicsApplication;
use App\Models\GrantApplication;
use App\Models\Publication;
use App\Models\ResearchProject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class GrantsEthicsAndPublicationsTest extends TestCase
{
    use RefreshDatabase;

    protected User $professor;
    protected User $financeOfficer;
    protected User $admin;
    protected User $student;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Office Admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Finance Officer', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Professor', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Student', 'guard_name' => 'web']);

        $this->professor = User::firstOrCreate(
            ['email' => 'prof.grants@nyu.edu'],
            ['name' => 'Prof. Grants', 'password' => bcrypt('password')]
        );
        $this->professor->syncRoles(['Professor']);

        $this->financeOfficer = User::firstOrCreate(
            ['email' => 'finance.officer@nyu.edu'],
            ['name' => 'Finance Officer', 'password' => bcrypt('password')]
        );
        $this->financeOfficer->syncRoles(['Finance Officer']);

        $this->admin = User::firstOrCreate(
            ['email' => 'admin.grants@nyu.edu'],
            ['name' => 'Admin Grants', 'password' => bcrypt('password')]
        );
        $this->admin->syncRoles(['Office Admin']);

        $this->student = User::firstOrCreate(
            ['email' => 'student.grants@nyu.edu'],
            ['name' => 'Student Grants', 'password' => bcrypt('password')]
        );
        $this->student->syncRoles(['Student']);
    }

    public function test_professor_can_submit_grant_and_finance_can_award(): void
    {
        Sanctum::actingAs($this->professor);

        $grantResponse = $this->postJson('/api/grants', [
            'title' => 'NSF Quantum Information Science Grant',
            'funding_agency' => 'NSF',
            'requested_amount' => 500000.00,
            'budget_breakdown' => ['Equipment' => 200000, 'Personnel' => 300000],
        ]);

        $grantResponse->assertStatus(201);
        $grantId = $grantResponse->json('grant.id');

        // Finance Officer awards grant
        Sanctum::actingAs($this->financeOfficer);
        $awardResponse = $this->postJson("/api/grants/{$grantId}/award", [
            'status' => 'Awarded',
            'awarded_amount' => 500000.00,
            'financial_notes' => 'Awarded in full for fiscal year 2026.',
        ]);

        $awardResponse->assertStatus(200);
        $this->assertDatabaseHas('grant_applications', [
            'id' => $grantId,
            'status' => 'Awarded',
            'awarded_amount' => 500000.00,
        ]);
    }

    public function test_student_cannot_award_grant_funds(): void
    {
        $grant = GrantApplication::create([
            'grant_code' => 'GRT-2026-901',
            'title' => 'Test Grant',
            'applicant_id' => $this->professor->id,
            'funding_agency' => 'NIH',
            'requested_amount' => 100000.00,
            'status' => 'Submitted',
        ]);

        Sanctum::actingAs($this->student);
        $response = $this->postJson("/api/grants/{$grant->id}/award", [
            'status' => 'Awarded',
            'awarded_amount' => 100000.00,
        ]);

        $response->assertStatus(403);
    }

    public function test_duplicate_doi_is_rejected_on_publication_creation(): void
    {
        Sanctum::actingAs($this->professor);

        Publication::create([
            'title' => 'Existing Machine Learning Paper',
            'slug' => 'existing-ml-paper',
            'authors' => 'Dr. Jane Smith',
            'journal_conference' => 'Nature Machine Intelligence',
            'publication_year' => 2026,
            'doi' => '10.1038/s42256-026-0001-x',
            'publication_type' => 'Journal Article',
            'user_id' => $this->professor->id,
        ]);

        // Attempt registering another paper with identical DOI
        $duplicateResponse = $this->postJson('/api/publications', [
            'title' => 'Duplicate Submission Attempt',
            'authors' => 'Different Authors',
            'journal_conference' => 'Another Journal',
            'publication_year' => 2026,
            'doi' => '10.1038/s42256-026-0001-x',
            'publication_type' => 'Journal Article',
        ]);

        $duplicateResponse->assertStatus(422);
    }

    public function test_approvals_inbox_lists_pending_institutional_items(): void
    {
        ResearchProject::create([
            'user_id' => $this->professor->id,
            'project_code' => 'PRJ-2026-8888',
            'title' => 'Pending Project for Review',
            'slug' => 'pending-project-review',
            'short_description' => 'Waiting for approval',
            'status' => 'Submitted',
            'visibility' => 'Private',
        ]);

        Sanctum::actingAs($this->admin);
        $response = $this->getJson('/api/approvals');

        $response->assertStatus(200);
        $items = collect($response->json());
        $found = $items->firstWhere('raw_id', ResearchProject::where('project_code', 'PRJ-2026-8888')->value('id'));
        $this->assertNotNull($found);
        $this->assertEquals('Pending', $found['status']);
    }
}
