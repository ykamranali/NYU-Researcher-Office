<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('research_projects', function (Blueprint $table) {
            if (!Schema::hasColumn('research_projects', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('research_projects', 'co_investigators')) {
                $table->json('co_investigators')->nullable()->after('contact_person');
            }
            if (!Schema::hasColumn('research_projects', 'ethics_status')) {
                $table->string('ethics_status')->default('Not Required')->after('status');
            }
            if (!Schema::hasColumn('research_projects', 'milestones')) {
                $table->json('milestones')->nullable()->after('co_investigators');
            }
            if (!Schema::hasColumn('research_projects', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('milestones');
            }
        });
    }

    public function down(): void
    {
        Schema::table('research_projects', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn(['co_investigators', 'ethics_status', 'milestones', 'rejection_reason']);
        });
    }
};
