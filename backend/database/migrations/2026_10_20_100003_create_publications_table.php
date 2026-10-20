<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('publications', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('authors');
            $table->string('author_affiliations')->nullable();
            $table->string('journal_conference');
            $table->integer('publication_year')->nullable();
            $table->date('publication_date')->nullable();
            $table->string('doi')->nullable()->index();
            $table->string('url')->nullable();
            $table->string('publication_type')->default('Journal Article'); // Journal Article, Conference Paper, Book Chapter, Pre-print, Patent
            $table->text('abstract')->nullable();
            $table->string('keywords')->nullable();
            $table->string('verification_status')->default('Pending'); // Verified, Pending, Flagged
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('research_project_id')->nullable()->constrained('research_projects')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('publications');
    }
};
