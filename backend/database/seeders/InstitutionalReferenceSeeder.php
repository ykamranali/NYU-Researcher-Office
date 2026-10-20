<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\ResearchCategory;
use App\Models\SystemSetting;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class InstitutionalReferenceSeeder extends Seeder
{
    /**
     * Seed fundamental institutional reference data.
     * Safe for all environments, including production.
     * Contains NO accounts, passwords, or mock identities.
     */
    public function run(): void
    {
        // 1. Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 2. Define canonical system permissions
        $permissions = [
            'projects.view-any',
            'projects.view-own',
            'projects.create',
            'projects.update-own',
            'projects.update-any',
            'projects.delete',
            'projects.submit',
            'projects.review',
            'projects.approve',
            'documents.upload',
            'documents.download-own',
            'documents.download-any',
            'documents.delete',
            'publications.create',
            'publications.manage',
            'opportunities.manage',
            'opportunities.apply',
            'ethics.submit',
            'ethics.review',
            'grants.submit',
            'grants.manage-finances',
            'people.manage',
            'content.manage',
            'system.manage',
            'reports.view',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // 3. Define Roles & Assign Permissions
        $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        $superAdminRole->syncPermissions(Permission::all());

        $officeAdminRole = Role::firstOrCreate(['name' => 'Office Admin', 'guard_name' => 'web']);
        $officeAdminRole->syncPermissions([
            'projects.view-any', 'projects.update-any', 'projects.review', 'projects.approve',
            'documents.upload', 'documents.download-any', 'documents.delete',
            'publications.manage', 'opportunities.manage',
            'ethics.review', 'grants.manage-finances', 'people.manage',
            'content.manage', 'system.manage', 'reports.view'
        ]);

        $professorRole = Role::firstOrCreate(['name' => 'Professor', 'guard_name' => 'web']);
        $professorRole->syncPermissions([
            'projects.view-own', 'projects.create', 'projects.update-own', 'projects.submit',
            'documents.upload', 'documents.download-own',
            'publications.create', 'ethics.submit', 'grants.submit', 'reports.view'
        ]);

        $reviewerRole = Role::firstOrCreate(['name' => 'Reviewer', 'guard_name' => 'web']);
        $reviewerRole->syncPermissions([
            'projects.view-any', 'projects.review', 'ethics.review', 'documents.download-any'
        ]);

        $financeRole = Role::firstOrCreate(['name' => 'Finance Officer', 'guard_name' => 'web']);
        $financeRole->syncPermissions([
            'projects.view-any', 'grants.manage-finances', 'reports.view', 'documents.download-any'
        ]);

        $studentRole = Role::firstOrCreate(['name' => 'Student', 'guard_name' => 'web']);
        $studentRole->syncPermissions([
            'opportunities.apply', 'documents.upload', 'documents.download-own'
        ]);

        // 4. Canonical System Settings
        SystemSetting::setVal('university_name', 'New York University', 'general', 'string', 'Official Institution Name');
        SystemSetting::setVal('support_email', 'research-support@nyu.edu', 'general', 'string', 'Office of Research Support Email');
        SystemSetting::setVal('maintenance_mode', 'false', 'general', 'boolean', 'System maintenance mode toggle');
        SystemSetting::setVal('allowed_file_types', 'pdf,docx,xlsx,csv,png,jpg', 'security', 'string', 'Permitted file extensions for uploads');
        SystemSetting::setVal('max_upload_size_mb', '15', 'security', 'integer', 'Maximum file size in Megabytes');
        SystemSetting::setVal('require_ethics_for_human_subjects', 'true', 'compliance', 'boolean', 'Require IRB protocol approval prior to project start');

        // 5. Faculties & Departments
        $tandon = Faculty::firstOrCreate(
            ['slug' => 'tandon-engineering'],
            ['name' => 'Tandon School of Engineering', 'description' => 'Engineering, Applied Sciences and Technology']
        );
        $cas = Faculty::firstOrCreate(
            ['slug' => 'college-arts-science'],
            ['name' => 'College of Arts and Science', 'description' => 'Humanities, Natural Sciences and Social Sciences']
        );
        $med = Faculty::firstOrCreate(
            ['slug' => 'grossman-medicine'],
            ['name' => 'Grossman School of Medicine', 'description' => 'Clinical Medicine, Immunology and Translational Science']
        );

        Department::firstOrCreate(
            ['slug' => 'computer-science'],
            ['name' => 'Computer Science & Engineering', 'faculty_id' => $tandon->id, 'description' => 'AI, Cybersecurity, and Data Systems']
        );
        Department::firstOrCreate(
            ['slug' => 'biomedical-engineering'],
            ['name' => 'Biomedical Engineering', 'faculty_id' => $tandon->id, 'description' => 'Biomechanics, Neural Engineering, and Biomaterials']
        );
        Department::firstOrCreate(
            ['slug' => 'biology'],
            ['name' => 'Department of Biology', 'faculty_id' => $cas->id, 'description' => 'Genomics, Molecular Biology and Ecology']
        );

        // 6. Strategic Research Categories
        ResearchCategory::firstOrCreate(
            ['slug' => 'data-science-ai'],
            ['name' => 'Data Science & Artificial Intelligence', 'description' => 'Machine learning, robotics, and computational theory']
        );
        ResearchCategory::firstOrCreate(
            ['slug' => 'health-life-sciences'],
            ['name' => 'Health & Life Sciences', 'description' => 'Biomedicine, clinical diagnostics, and cellular biology']
        );
        ResearchCategory::firstOrCreate(
            ['slug' => 'sustainability-clean-tech'],
            ['name' => 'Sustainability & Clean Tech', 'description' => 'Renewable energy, climate resilience, and green materials']
        );

        AuditLog::log('institutional_reference_seeded', 'System', null, [
            'message' => 'Institutional reference data (roles, permissions, faculties, departments) seeded'
        ]);
    }
}
