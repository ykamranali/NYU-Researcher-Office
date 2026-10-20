<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\Department;
use App\Models\EthicsApplication;
use App\Models\Event;
use App\Models\Faculty;
use App\Models\GrantApplication;
use App\Models\NewsArticle;
use App\Models\Opportunity;
use App\Models\Publication;
use App\Models\ResearchCategory;
use App\Models\ResearchProject;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DevelopmentDemoSeeder extends Seeder
{
    /**
     * Seed demonstration accounts and test records for local development and QA only.
     * Strictly barred from execution in production environments.
     */
    public function run(): void
    {
        if (app()->environment('production')) {
            throw new \RuntimeException('SECURITY ERROR: DevelopmentDemoSeeder cannot be executed in production environments.');
        }

        $superAdminRole = Role::findByName('Super Admin', 'web');
        $officeAdminRole = Role::findByName('Office Admin', 'web');
        $professorRole = Role::findByName('Professor', 'web');
        $reviewerRole = Role::findByName('Reviewer', 'web');
        $financeRole = Role::findByName('Finance Officer', 'web');
        $studentRole = Role::findByName('Student', 'web');

        $tandon = Faculty::where('slug', 'tandon-engineering')->first();
        $cas = Faculty::where('slug', 'college-arts-science')->first();
        $csDept = Department::where('slug', 'computer-science')->first();
        $bmeDept = Department::where('slug', 'biomedical-engineering')->first();
        $aiCat = ResearchCategory::where('slug', 'data-science-ai')->first();
        $healthCat = ResearchCategory::where('slug', 'health-life-sciences')->first();
        $sustCat = ResearchCategory::where('slug', 'sustainability-clean-tech')->first();

        // 1. Seed Demo Users for Local Development Testing Only
        $superAdmin = User::updateOrCreate(
            ['email' => 'admin@nyu.edu'],
            [
                'name' => 'Dr. Eleanor Vance (Super Admin)',
                'password' => Hash::make('AdminSecret2026!'),
                'email_verified_at' => now(),
            ]
        );
        $superAdmin->syncRoles([$superAdminRole]);

        $officeAdmin = User::updateOrCreate(
            ['email' => 'office@nyu.edu'],
            [
                'name' => 'Marcus Holloway (Office Admin)',
                'password' => Hash::make('OfficeAdmin2026!'),
                'email_verified_at' => now(),
            ]
        );
        $officeAdmin->syncRoles([$officeAdminRole]);

        $prof1 = User::updateOrCreate(
            ['email' => 'professor@nyu.edu'],
            [
                'name' => 'Dr. Jane Smith (Professor)',
                'password' => Hash::make('Professor2026!'),
                'email_verified_at' => now(),
            ]
        );
        $prof1->syncRoles([$professorRole]);

        $prof2 = User::updateOrCreate(
            ['email' => 'robert.chen@nyu.edu'],
            [
                'name' => 'Dr. Robert Chen (Professor)',
                'password' => Hash::make('Professor2026!'),
                'email_verified_at' => now(),
            ]
        );
        $prof2->syncRoles([$professorRole]);

        $reviewer = User::updateOrCreate(
            ['email' => 'reviewer@nyu.edu'],
            [
                'name' => 'Dr. Alan Turing (Reviewer)',
                'password' => Hash::make('Reviewer2026!'),
                'email_verified_at' => now(),
            ]
        );
        $reviewer->syncRoles([$reviewerRole]);

        $finance = User::updateOrCreate(
            ['email' => 'finance@nyu.edu'],
            [
                'name' => 'Sarah Connor (Finance Officer)',
                'password' => Hash::make('Finance2026!'),
                'email_verified_at' => now(),
            ]
        );
        $finance->syncRoles([$financeRole]);

        $student = User::updateOrCreate(
            ['email' => 'student@nyu.edu'],
            [
                'name' => 'Alex Johnson (Student)',
                'password' => Hash::make('Student2026!'),
                'email_verified_at' => now(),
            ]
        );
        $student->syncRoles([$studentRole]);

        SystemSetting::setVal('admin_bootstrap_completed', 'true', 'security', 'boolean', 'Flags whether initial super admin was bootstrapped');

        // 2. Seed Sample Research Projects
        $prj1 = ResearchProject::updateOrCreate(
            ['project_code' => 'PRJ-2026-001'],
            [
                'user_id' => $prof1->id,
                'title' => 'AI-Based Healthcare Diagnostics for Early Oncology Detection',
                'slug' => 'ai-based-healthcare-diagnostics',
                'short_description' => 'Developing federated deep learning models for early stage oncological screening using multimodal imaging.',
                'full_description' => 'This project investigates the deployment of privacy-preserving machine learning algorithms across hospital networks to detect malignant carcinomas with high sensitivity.',
                'research_category_id' => $healthCat?->id,
                'faculty_id' => $tandon?->id,
                'department_id' => $csDept?->id,
                'start_date' => '2026-01-15',
                'expected_completion_date' => '2027-12-31',
                'funding_source' => 'National Science Foundation (NSF)',
                'funding_amount' => 1250000.00,
                'status' => 'Active',
                'visibility' => 'Public',
                'ethics_status' => 'Approved',
                'contact_person' => 'Dr. Jane Smith (jane.smith@nyu.edu)',
            ]
        );

        $prj2 = ResearchProject::updateOrCreate(
            ['project_code' => 'PRJ-2026-002'],
            [
                'user_id' => $prof2->id,
                'title' => 'Sustainable Concrete Infrastructures using Recycled Polymer Composites',
                'slug' => 'sustainable-concrete-infrastructures',
                'short_description' => 'Engineering high-durability cementitious matrices with upcycled ocean plastics and slag binders.',
                'full_description' => 'Comprehensive laboratory evaluations of tensile resilience, carbon footprint reductions, and thermal resistance in composite structural elements.',
                'research_category_id' => $sustCat?->id,
                'faculty_id' => $tandon?->id,
                'department_id' => $bmeDept?->id,
                'start_date' => '2026-03-01',
                'expected_completion_date' => '2028-02-28',
                'funding_source' => 'Department of Energy (DOE)',
                'funding_amount' => 890000.00,
                'status' => 'Under Review',
                'visibility' => 'Private',
                'ethics_status' => 'Exempt',
                'contact_person' => 'Dr. Robert Chen (robert.chen@nyu.edu)',
            ]
        );

        $prj3 = ResearchProject::updateOrCreate(
            ['project_code' => 'PRJ-2026-003'],
            [
                'user_id' => $prof1->id,
                'title' => 'Quantum Algorithms for Non-Convex Optimization in Power Grids',
                'slug' => 'quantum-algorithms-power-grids',
                'short_description' => 'Formulating variational quantum eigensolvers for real-time load dispatch in microgrid topologies.',
                'full_description' => 'Detailed simulations running on noisy intermediate-scale quantum devices to determine scalability thresholds.',
                'research_category_id' => $aiCat?->id,
                'faculty_id' => $tandon?->id,
                'department_id' => $csDept?->id,
                'start_date' => '2026-06-01',
                'expected_completion_date' => '2027-05-31',
                'funding_source' => 'NYU Internal Seed Grant',
                'funding_amount' => 150000.00,
                'status' => 'Submitted',
                'visibility' => 'Private',
                'ethics_status' => 'Not Required',
                'contact_person' => 'Dr. Jane Smith (jane.smith@nyu.edu)',
            ]
        );

        // 3. Seed Sample Publications
        Publication::updateOrCreate(
            ['doi' => '10.1145/3544548.3581234'],
            [
                'title' => 'Federated Representation Learning for Cross-Silo Medical Imaging',
                'slug' => 'federated-representation-learning-medical-imaging',
                'authors' => 'Dr. Jane Smith, Alex Johnson, Dr. Alan Turing',
                'author_affiliations' => 'New York University, Department of Computer Science',
                'journal_conference' => 'IEEE Transactions on Medical Imaging',
                'publication_year' => 2026,
                'publication_date' => '2026-04-10',
                'publication_type' => 'Journal Article',
                'url' => 'https://doi.org/10.1145/3544548.3581234',
                'verification_status' => 'Verified',
                'user_id' => $prof1->id,
                'research_project_id' => $prj1->id,
                'abstract' => 'We introduce a decentralized model aggregation protocol providing differential privacy guarantees while exceeding centralized diagnostic baselines.',
            ]
        );

        Publication::updateOrCreate(
            ['doi' => '10.1016/j.cemconres.2025.106890'],
            [
                'title' => 'Microstructural Evaluation of Polymer-Modified Cementitious Grouts',
                'slug' => 'microstructural-evaluation-polymer-grouts',
                'authors' => 'Dr. Robert Chen, Michael Chang',
                'author_affiliations' => 'NYU Tandon School of Engineering',
                'journal_conference' => 'Cement and Concrete Research',
                'publication_year' => 2025,
                'publication_date' => '2025-11-15',
                'publication_type' => 'Journal Article',
                'url' => 'https://doi.org/10.1016/j.cemconres.2025.106890',
                'verification_status' => 'Verified',
                'user_id' => $prof2->id,
                'research_project_id' => $prj2->id,
                'abstract' => 'An in-depth investigation into interfacial transition zones of upcycled polyethylene terephthalate in structural formulations.',
            ]
        );

        // 4. Seed Sample Opportunities
        Opportunity::updateOrCreate(
            ['slug' => 'surf-summer-2026'],
            [
                'title' => 'Summer Undergraduate Research Fellowship (SURF)',
                'type' => 'Fellowship',
                'description' => '10-week paid intensive research fellowship across NYU laboratories for undergraduates with high academic merit.',
                'department' => 'University-wide',
                'funding_amount' => 6000.00,
                'deadline' => '2026-11-15',
                'application_link' => '/student/opportunities',
                'is_active' => true,
            ]
        );

        Opportunity::updateOrCreate(
            ['slug' => 'ai-lab-grad-assistantship'],
            [
                'title' => 'Graduate Research Assistant: Biomedical Machine Learning Lab',
                'type' => 'Assistantship',
                'description' => 'Full tuition coverage and monthly stipend for graduate students experienced in PyTorch and federated data pipelines.',
                'department' => 'Computer Science & Engineering',
                'funding_amount' => 38000.00,
                'deadline' => '2026-12-01',
                'application_link' => '/student/opportunities',
                'is_active' => true,
            ]
        );

        // 5. Seed Sample Ethics Application
        EthicsApplication::updateOrCreate(
            ['protocol_number' => 'IRB-2026-0042'],
            [
                'title' => 'Multicenter Validation of De-Identified Radiological Datasets',
                'research_project_id' => $prj1->id,
                'user_id' => $prof1->id,
                'review_type' => 'Human Subjects',
                'risk_level' => 'Exempt',
                'status' => 'Approved',
                'summary' => 'Retrospective analysis of anonymized diagnostic CT scans with zero direct patient contact.',
                'has_coi' => false,
                'submission_date' => '2026-01-05',
                'decision_date' => '2026-01-20',
                'expiry_date' => '2027-01-20',
                'approved_by' => $superAdmin->id,
                'reviewer_notes' => 'Meets Common Rule criteria for secondary use of de-identified health data.',
            ]
        );

        // 6. Seed Sample Grant Application
        GrantApplication::updateOrCreate(
            ['grant_code' => 'GRT-2026-014'],
            [
                'title' => 'Scalable Edge AI for Real-time Critical Care Telemetry',
                'research_project_id' => $prj1->id,
                'applicant_id' => $prof1->id,
                'funding_agency' => 'NSF',
                'requested_amount' => 1250000.00,
                'awarded_amount' => 1250000.00,
                'status' => 'Awarded',
                'submission_deadline' => '2025-10-15',
                'award_date' => '2026-01-10',
                'project_start_date' => '2026-01-15',
                'project_end_date' => '2027-12-31',
                'budget_breakdown' => [
                    'Personnel' => 650000,
                    'Equipment' => 300000,
                    'Travel' => 50000,
                    'Indirect' => 250000,
                ],
                'milestones' => [
                    ['milestone' => 'Dataset harmonisation across 4 clinics', 'due_date' => '2026-06-30', 'completed' => true],
                    ['milestone' => 'Federated baseline validation', 'due_date' => '2026-12-31', 'completed' => false],
                ],
                'total_expended' => 280000.00,
                'finance_officer_id' => $finance->id,
                'financial_notes' => 'Initial tranche disbursed on schedule. Next financial audit set for Q3 2026.',
            ]
        );

        // 7. Seed News and Events
        NewsArticle::updateOrCreate(
            ['slug' => 'nyu-awarded-major-nsf-grant-for-ai-health'],
            [
                'title' => 'NYU Secures $1.25M NSF Grant for Next-Generation Medical AI Research',
                'content' => 'The Office of Research is proud to announce that Dr. Jane Smith has been awarded a major grant from the National Science Foundation to advance privacy-preserving diagnostic models.',
                'summary' => 'Major federal investment will support breakthroughs in medical machine learning across NYU labs.',
                'author' => 'Research Communications Bureau',
                'is_published' => true,
                'published_at' => now()->subDays(5),
            ]
        );

        Event::updateOrCreate(
            ['slug' => 'annual-research-symposium-2026'],
            [
                'title' => 'Annual University Research Symposium & Innovation Showcase',
                'description' => 'Join faculty, doctoral candidates, and undergraduate researchers for two days of interdisciplinary lectures, poster presentations, and award announcements.',
                'location' => 'Kimmel Center for University Life, Rosenthal Pavilion',
                'start_time' => now()->addDays(20),
                'end_time' => now()->addDays(21),
                'is_virtual' => false,
            ]
        );

        AuditLog::log('demo_database_seeded', 'System', null, [
            'message' => 'Development test data and mock accounts seeded for local environment testing'
        ]);
    }
}
