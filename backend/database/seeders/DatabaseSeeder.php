<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * In production: ONLY seeds institutional reference structures (roles, permissions, settings, faculties).
     * In local / testing: Seeds development mock accounts and test projects for QA.
     */
    public function run(): void
    {
        // 1. Institutional reference data (always seeded)
        $this->call(InstitutionalReferenceSeeder::class);

        // 2. Demo test accounts & sample records (STRICTLY local and testing only)
        if (app()->environment('local', 'testing')) {
            $this->call(DevelopmentDemoSeeder::class);
        }
    }
}
