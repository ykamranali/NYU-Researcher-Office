<?php

namespace Tests\Feature;

use App\Models\EthicsApplication;
use App\Models\GrantApplication;
use App\Models\Opportunity;
use App\Models\OpportunityApplication;
use App\Models\ResearchProject;
use App\Models\User;
use Database\Seeders\InstitutionalReferenceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ComprehensiveRoleAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected User $student;
    protected User $professorA;
    protected User $professorB;
    protected User $reviewer;
    protected User $finance;
    protected User $officeAdmin;
    protected User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(InstitutionalReferenceSeeder::class);

        $this->student = User::create(['name' => 'Alice Student', 'email' => 'student.alice@nyu.edu', 'password' => bcrypt('Pass123!')]);
        $this->student->assignRole('Student');

        $this->professorA = User::create(['name' => 'Prof Alice', 'email' => 'prof.alice@nyu.edu', 'password' => bcrypt('Pass123!')]);
        $this->professorA->assignRole('Professor');

        $this->professorB = User::create(['name' => 'Prof Bob', 'email' => 'prof.bob@nyu.edu', 'password' => bcrypt('Pass123!')]);
        $this->professorB->assignRole('Professor');

        $this->reviewer = User::create(['name' => 'Dr. Reviewer', 'email' => 'reviewer.dan@nyu.edu', 'password' => bcrypt('Pass123!')]);
        $this->reviewer->assignRole('Reviewer');

        $this->finance = User::create(['name' => 'Fiona Finance', 'email' => 'finance.fiona@nyu.edu', 'password' => bcrypt('Pass123!')]);
        $this->finance->assignRole('Finance Officer');

        $this->officeAdmin = User::create(['name' => 'Oscar Office', 'email' => 'office.oscar@nyu.edu', 'password' => bcrypt('Pass123!')]);
        $this->officeAdmin->assignRole('Office Admin');

        $this->superAdmin = User::create(['name' => 'Sam Super', 'email' => 'super.sam@nyu.edu', 'password' => bcrypt('Pass123!')]);
        $this->superAdmin->assignRole('Super Admin');
    }

    public function test_student_cannot_access_administrative_endpoints(): void
    {
        Sanctum::actingAs($this->student);

        // Cannot manage people
        $this->getJson('/api/people')->assertStatus(403);
        $this->postJson('/api/people', ['name' => 'X', 'email' => 'x@nyu.edu', 'role' => 'Student'])->assertStatus(403);

        // Cannot view or edit system settings
        $this->getJson('/api/system/settings')->assertStatus(403);
        $this->putJson('/api/system/settings', ['university_name' => 'Hacked'])->assertStatus(403);

        // Cannot view analytics reports
        $this->getJson('/api/reports/analytics')->assertStatus(403);

        // Cannot create opportunities
        $this->postJson('/api/opportunities', [
            'title' => 'Student Opportunity',
            'type' => 'Internship',
            'description' => 'Test',
        ])->assertStatus(403);

        // Cannot create CMS pages, news, or events
        $this->postJson('/api/pages', ['title' => 'New Page', 'status' => 'Published'])->assertStatus(403);
        $this->postJson('/api/news', ['title' => 'Fake News', 'content' => 'Content'])->assertStatus(403);
        $this->postJson('/api/events', ['title' => 'Fake Event', 'description' => 'Desc', 'start_time' => now()->addDays(5)])->assertStatus(403);

        // Cannot submit grant proposals directly
        $this->postJson('/api/grants', [
            'title' => 'Student Grant',
            'funding_agency' => 'NSF',
            'requested_amount' => 50000,
        ])->assertStatus(403);
    }

    public function test_professor_cannot_approve_own_research_project(): void
    {
        $project = ResearchProject::create([
            'user_id' => $this->professorA->id,
            'title' => 'Quantum Cryptography',
            'project_code' => 'PRJ-2026-9001',
            'slug' => 'quantum-cryptography',
            'short_description' => 'Testing self-approval blocking',
            'status' => 'Submitted',
            'visibility' => 'Private',
        ]);

        Sanctum::actingAs($this->professorA);

        // Direct project review endpoint: self-approval blocked
        $response = $this->postJson("/api/projects/{$project->id}/review", [
            'decision' => 'Approved',
            'comments' => 'Self-approving my own research proposal',
        ]);
        $response->assertStatus(403);

        // Unified approvals endpoint: self-approval blocked
        $approvalResponse = $this->postJson('/api/approvals/approve', [
            'entity_type' => 'ResearchProject',
            'raw_id' => $project->id,
            'comments' => 'Self-approving via unified inbox',
        ]);
        $approvalResponse->assertStatus(403);

        // Confirm project is still Submitted, not Approved
        $project->refresh();
        $this->assertEquals('Submitted', $project->status);
    }

    public function test_professor_cannot_approve_own_ethics_application(): void
    {
        $ethics = EthicsApplication::create([
            'user_id' => $this->professorA->id,
            'title' => 'Human Trial Ethics Protocol',
            'protocol_number' => 'IRB-2026-9001',
            'review_type' => 'Human Subjects',
            'risk_level' => 'Minimal Risk',
            'summary' => 'Comprehensive protocol for patient cognitive trials.',
            'has_coi' => false,
            'status' => 'Submitted',
            'submission_date' => now(),
        ]);

        Sanctum::actingAs($this->professorA);

        $response = $this->postJson("/api/ethics/{$ethics->id}/review", [
            'status' => 'Approved',
            'reviewer_notes' => 'Self-approving ethics protocol',
        ]);
        $response->assertStatus(403);

        $ethics->refresh();
        $this->assertEquals('Submitted', $ethics->status);
    }

    public function test_professor_cannot_award_own_grant_application(): void
    {
        $grant = GrantApplication::create([
            'applicant_id' => $this->professorA->id,
            'title' => 'Federal Oncology AI Grant',
            'grant_code' => 'GRT-2026-9001',
            'funding_agency' => 'NIH',
            'requested_amount' => 500000,
            'status' => 'Submitted',
        ]);

        Sanctum::actingAs($this->professorA);

        $response = $this->postJson("/api/grants/{$grant->id}/award", [
            'status' => 'Awarded',
            'awarded_amount' => 500000,
        ]);
        $response->assertStatus(403);

        $grant->refresh();
        $this->assertEquals('Submitted', $grant->status);
    }

    public function test_idor_protection_preventing_unauthorized_project_access_and_modification(): void
    {
        $projectA = ResearchProject::create([
            'user_id' => $this->professorA->id,
            'title' => 'Confidential Weapon Defense Study',
            'project_code' => 'PRJ-2026-9002',
            'slug' => 'confidential-study',
            'short_description' => 'Secret project',
            'status' => 'Draft',
            'visibility' => 'Private',
        ]);

        // Professor B attempts to view Professor A's private Draft
        Sanctum::actingAs($this->professorB);
        $this->getJson("/api/projects/{$projectA->id}")->assertStatus(403);

        // Professor B attempts to modify Professor A's Draft
        $this->putJson("/api/projects/{$projectA->id}", [
            'title' => 'Hijacked Title',
        ])->assertStatus(403);

        // Student attempts to view Professor A's private Draft
        Sanctum::actingAs($this->student);
        $this->getJson("/api/projects/{$projectA->id}")->assertStatus(403);
    }

    public function test_reviewer_cannot_perform_financial_grant_awards(): void
    {
        $grant = GrantApplication::create([
            'applicant_id' => $this->professorA->id,
            'title' => 'Nanotech Materials Research',
            'grant_code' => 'GRT-2026-9003',
            'funding_agency' => 'DOE',
            'requested_amount' => 250000,
            'status' => 'Submitted',
        ]);

        Sanctum::actingAs($this->reviewer);

        $this->postJson("/api/grants/{$grant->id}/award", [
            'status' => 'Awarded',
            'awarded_amount' => 250000,
        ])->assertStatus(403);
    }

    public function test_finance_officer_cannot_render_ethics_irb_decisions(): void
    {
        $ethics = EthicsApplication::create([
            'user_id' => $this->professorA->id,
            'title' => 'Stem Cell Protocols',
            'protocol_number' => 'IRB-2026-9004',
            'review_type' => 'Biosafety',
            'risk_level' => 'Minimal Risk',
            'summary' => 'Protocol testing biosafety containment levels.',
            'has_coi' => false,
            'status' => 'Submitted',
            'submission_date' => now(),
        ]);

        Sanctum::actingAs($this->finance);

        $this->postJson("/api/ethics/{$ethics->id}/review", [
            'status' => 'Approved',
            'reviewer_notes' => 'Finance officer attempting ethics approval',
        ])->assertStatus(403);
    }

    public function test_office_admin_can_approve_project_with_audit_trail(): void
    {
        $project = ResearchProject::create([
            'user_id' => $this->professorA->id,
            'title' => 'Climate Resilience In Urban Centers',
            'project_code' => 'PRJ-2026-9005',
            'slug' => 'climate-resilience',
            'short_description' => 'Urban climate adaptation and sensors',
            'status' => 'Submitted',
            'visibility' => 'Private',
        ]);

        Sanctum::actingAs($this->officeAdmin);

        $response = $this->postJson("/api/projects/{$project->id}/review", [
            'decision' => 'Approved',
            'comments' => 'Fully vetted and compliant with university standards.',
        ]);

        $response->assertStatus(200);

        $project->refresh();
        $this->assertEquals('Approved', $project->status);
        $this->assertEquals('Public', $project->visibility);
    }
}
