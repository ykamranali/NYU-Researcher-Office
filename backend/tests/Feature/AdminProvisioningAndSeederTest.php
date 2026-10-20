<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\SystemSetting;
use App\Models\User;
use Database\Seeders\DevelopmentDemoSeeder;
use Database\Seeders\InstitutionalReferenceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminProvisioningAndSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed institutional reference structures
        $this->seed(InstitutionalReferenceSeeder::class);
    }

    public function test_production_seed_does_not_create_demo_administrators(): void
    {
        // InstitutionalReferenceSeeder must seed reference data, but zero users
        $userCount = User::count();
        $this->assertEquals(0, $userCount, 'InstitutionalReferenceSeeder must not create any accounts');
        $this->assertDatabaseMissing('users', ['email' => 'admin@nyu.edu']);
        $this->assertDatabaseMissing('users', ['email' => 'office@nyu.edu']);
    }

    public function test_development_demo_seeder_throws_exception_in_production(): void
    {
        $this->app->detectEnvironment(fn() => 'production');

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('DevelopmentDemoSeeder cannot be executed in production environments');

        (new DevelopmentDemoSeeder())->run();
    }

    public function test_initial_administrator_can_be_bootstrapped_via_cli(): void
    {
        $exitCode = Artisan::call('research:bootstrap-admin', [
            '--email' => 'provost.admin@nyu.edu',
            '--name' => 'Provost Administrator',
            '--password' => 'Str0ng!Adm1nP@ss2026',
        ]);

        $this->assertEquals(0, $exitCode);

        $admin = User::where('email', 'provost.admin@nyu.edu')->first();
        $this->assertNotNull($admin);
        $this->assertTrue($admin->hasRole('Super Admin'));
        $this->assertEquals('true', SystemSetting::getVal('admin_bootstrap_completed'));
    }

    public function test_bootstrap_refuses_when_super_admin_already_exists(): void
    {
        // First bootstrap
        Artisan::call('research:bootstrap-admin', [
            '--email' => 'initial.admin@nyu.edu',
            '--name' => 'Initial Admin',
            '--password' => 'Str0ng!Adm1nP@ss2026',
        ]);

        // Second bootstrap attempt with different email must be rejected
        $exitCode = Artisan::call('research:bootstrap-admin', [
            '--email' => 'second.attempt@nyu.edu',
            '--name' => 'Second Attempt',
            '--password' => 'Str0ng!Adm1nP@ss2026',
        ]);

        $this->assertEquals(1, $exitCode);
        $this->assertDatabaseMissing('users', ['email' => 'second.attempt@nyu.edu']);
    }

    public function test_bootstrap_refuses_to_overwrite_or_hijack_existing_user(): void
    {
        // Create standard researcher user first
        $existing = User::create([
            'name' => 'Existing Faculty',
            'email' => 'existing.faculty@nyu.edu',
            'password' => bcrypt('SomePass123!'),
        ]);
        $existing->assignRole('Professor');

        // Reset bootstrap setting to test email conflict specifically
        SystemSetting::where('key', 'admin_bootstrap_completed')->delete();

        $exitCode = Artisan::call('research:bootstrap-admin', [
            '--email' => 'existing.faculty@nyu.edu',
            '--name' => 'Imposter Admin',
            '--password' => 'Str0ng!Adm1nP@ss2026',
        ]);

        $this->assertEquals(1, $exitCode);
        // Existing user should NOT have Super Admin role
        $existing->refresh();
        $this->assertFalse($existing->hasRole('Super Admin'));
    }

    public function test_bootstrap_rejects_weak_passwords(): void
    {
        $exitCode = Artisan::call('research:bootstrap-admin', [
            '--email' => 'weak.admin@nyu.edu',
            '--name' => 'Weak Admin',
            '--password' => 'short',
        ]);

        $this->assertEquals(1, $exitCode);
        $this->assertDatabaseMissing('users', ['email' => 'weak.admin@nyu.edu']);
    }
}
