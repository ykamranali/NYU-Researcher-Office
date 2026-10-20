<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grant_applications', function (Blueprint $table) {
            $table->id();
            $table->string('grant_code')->unique();
            $table->string('title');
            $table->foreignId('opportunity_id')->nullable()->constrained('opportunities')->nullOnDelete();
            $table->foreignId('research_project_id')->nullable()->constrained('research_projects')->nullOnDelete();
            $table->foreignId('applicant_id')->constrained('users')->cascadeOnDelete();
            $table->string('funding_agency'); // NSF, NIH, DOE, Internal, Corporate
            $table->decimal('requested_amount', 15, 2);
            $table->decimal('awarded_amount', 15, 2)->nullable();
            $table->string('status')->default('Draft'); // Draft, Submitted, Under Review, Awarded, Rejected, Closed
            $table->date('submission_deadline')->nullable();
            $table->date('award_date')->nullable();
            $table->date('project_start_date')->nullable();
            $table->date('project_end_date')->nullable();
            $table->json('budget_breakdown')->nullable(); // Equipment, Personnel, Travel, Indirect
            $table->json('milestones')->nullable();
            $table->decimal('total_expended', 15, 2)->default(0.00);
            $table->text('financial_notes')->nullable();
            $table->foreignId('finance_officer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grant_applications');
    }
};
