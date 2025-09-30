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
        Schema::create('generated_files', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type'); // e.g., 'screening-applicants-by-batch'
            $table->string('model_type')->nullable(); // e.g., 'batch'
            $table->string('model_id')->nullable(); // e.g., batch ID
            $table->string('ext', 10); // file extension
            $table->string('path'); // public path for download
            $table->timestamp('request_at');
            $table->timestamps();
            $table->softDeletes(); // for soft delete to also delete file

            $table->index(['type', 'model_type', 'model_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('generated_files');
    }
};
