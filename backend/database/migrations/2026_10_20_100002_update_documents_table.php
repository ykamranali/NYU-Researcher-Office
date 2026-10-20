<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            if (!Schema::hasColumn('documents', 'documentable_type')) {
                $table->nullableMorphs('documentable');
            }
            if (!Schema::hasColumn('documents', 'category')) {
                $table->string('category')->default('General')->after('title');
            }
            if (!Schema::hasColumn('documents', 'original_name')) {
                $table->string('original_name')->nullable()->after('file_path');
            }
            if (!Schema::hasColumn('documents', 'file_size')) {
                $table->unsignedBigInteger('file_size')->default(0)->after('original_name');
            }
            if (!Schema::hasColumn('documents', 'mime_type')) {
                $table->string('mime_type')->nullable()->after('file_size');
            }
            if (!Schema::hasColumn('documents', 'version')) {
                $table->unsignedInteger('version')->default(1)->after('mime_type');
            }
            if (!Schema::hasColumn('documents', 'is_confidential')) {
                $table->boolean('is_confidential')->default(true)->after('is_public');
            }
            if (!Schema::hasColumn('documents', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropMorphs('documentable');
            $table->dropColumn(['category', 'original_name', 'file_size', 'mime_type', 'version', 'is_confidential', 'deleted_at']);
        });
    }
};
