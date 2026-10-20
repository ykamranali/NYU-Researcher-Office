<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('opportunities', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('type'); // Grant, Fellowship, Assistantship, etc.
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('department')->nullable();
            $table->decimal('funding_amount', 12, 2)->nullable();
            $table->date('deadline')->nullable();
            $table->string('application_link')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('opportunities');
    }
};
