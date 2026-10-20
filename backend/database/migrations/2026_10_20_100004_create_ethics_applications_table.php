<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ethics_applications', function (Blueprint $table) {
            $table->id();
            $table->string('protocol_number')->unique();
            $table->string('title');
            $table->foreignId('research_project_id')->nullable()->constrained('research_projects')->nullOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('review_type')->default('Human Subjects'); // Human Subjects, Animal Care (IACUC), Biosafety, Data Privacy
            $table->string('risk_level')->default('Minimal Risk'); // Exempt, Minimal Risk, Full Board Review
            $table->string('status')->default('Draft'); // Draft, Submitted, Under Review, Modifications Required, Approved, Rejected, Expired
            $table->text('summary')->nullable();
            $table->boolean('has_coi')->default(false); // Conflict of interest declared
            $table->text('coi_details')->nullable();
            $table->text('reviewer_notes')->nullable();
            $table->date('submission_date')->nullable();
            $table->date('decision_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ethics_applications');
    }
};
