<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role;

class BootstrapAdminCommand extends Command
{
    protected $signature = 'research:bootstrap-admin 
                            {--email= : Admin email} 
                            {--name= : Admin name} 
                            {--password= : Admin password}';

    protected $description = 'Bootstrap the initial Super Administrator safely and lock the process';

    public function handle(): int
    {
        $isBootstrapped = SystemSetting::getVal('admin_bootstrap_completed', false);
        $superAdminExists = User::role('Super Admin')->exists();

        if ($isBootstrapped && $superAdminExists) {
            $this->error('Initial administrator bootstrap has already been completed and is permanently locked.');
            return Command::FAILURE;
        }

        $email = $this->option('email') ?: $this->ask('Enter Super Admin Email:');
        $name = $this->option('name') ?: $this->ask('Enter Super Admin Name:', 'Super Admin');
        $password = $this->option('password') ?: $this->secret('Enter Super Admin Password (min 10 characters):');

        $validator = Validator::make([
            'email' => $email,
            'name' => $name,
            'password' => $password,
        ], [
            'email' => 'required|email|max:255',
            'name' => 'required|string|max:255',
            'password' => 'required|string|min:10',
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }
            return Command::FAILURE;
        }

        // Ensure Super Admin role exists
        $role = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ]
        );

        $user->syncRoles([$role]);

        SystemSetting::setVal('admin_bootstrap_completed', 'true', 'security', 'boolean', 'Flags whether initial super admin was bootstrapped');

        AuditLog::log('bootstrap_super_admin', 'User', $user->id, [
            'email' => $email,
            'message' => 'Initial Super Admin bootstrapped via console command'
        ], $user->id);

        $this->info("Initial Super Administrator '{$email}' bootstrapped successfully! Bootstrap is now locked.");
        return Command::SUCCESS;
    }
}
