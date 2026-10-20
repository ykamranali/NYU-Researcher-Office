<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;

class BootstrapAdminCommand extends Command
{
    protected $signature = 'research:bootstrap-admin 
                            {--email= : Admin email} 
                            {--name= : Admin name} 
                            {--password= : Admin password}';

    protected $description = 'Bootstrap the initial Super Administrator safely and lock the process permanently';

    public function handle(): int
    {
        // 1. Double-check lock conditions: refuse if flag is set OR any Super Admin already exists
        $isBootstrapped = SystemSetting::getVal('admin_bootstrap_completed', false);
        $superAdminExists = User::role('Super Admin')->exists();

        if ($isBootstrapped || $superAdminExists) {
            $this->error('CRITICAL: Initial administrator bootstrap has already been completed and is permanently locked.');
            return Command::FAILURE;
        }

        $email = $this->option('email') ?: $this->ask('Enter Super Admin Email:');
        $name = $this->option('name') ?: $this->ask('Enter Super Admin Name:', 'Super Admin');
        $password = $this->option('password') ?: $this->secret('Enter Super Admin Password (min 12 chars, mixed case, numbers, symbols):');

        // 2. Refuse to modify, hijack, or replace ANY existing account
        if (User::where('email', $email)->exists()) {
            $this->error("CRITICAL: A user account with email '{$email}' already exists. Administrator bootstrap strictly refuses to overwrite or hijack existing accounts.");
            return Command::FAILURE;
        }

        // 3. Strict password complexity policy
        $validator = Validator::make([
            'email' => $email,
            'name' => $name,
            'password' => $password,
        ], [
            'email' => 'required|email|max:255',
            'name' => 'required|string|max:255',
            'password' => [
                'required',
                'string',
                Password::min(12)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }
            return Command::FAILURE;
        }

        // 4. Atomic and Concurrency-Safe Transaction
        try {
            DB::transaction(function () use ($email, $name, $password, &$user) {
                // Ensure double-check inside the transaction with lock
                $adminCount = DB::table('model_has_roles')
                    ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
                    ->where('roles.name', 'Super Admin')
                    ->lockForUpdate()
                    ->count();

                if ($adminCount > 0) {
                    throw new \RuntimeException('Concurrent attempt detected: Super Admin already provisioned.');
                }

                $role = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);

                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => Hash::make($password),
                    'email_verified_at' => now(),
                ]);

                $user->assignRole($role);

                SystemSetting::setVal('admin_bootstrap_completed', 'true', 'security', 'boolean', 'Flags whether initial super admin was bootstrapped');

                AuditLog::log('bootstrap_super_admin', 'User', $user->id, [
                    'email' => $email,
                    'action' => 'Initial Super Admin provisioned via secure Artisan CLI',
                ], $user->id);
            });
        } catch (\Throwable $e) {
            $this->error('Bootstrap transaction aborted: ' . $e->getMessage());
            return Command::FAILURE;
        }

        $this->info("Initial Super Administrator '{$email}' provisioned successfully! Administrator bootstrap is now permanently locked.");
        return Command::SUCCESS;
    }
}
