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
        Schema::create('batch_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('batch_id');
            $table->uuid('question_id');
            $table->integer('display_order')->default(0); // Order within the batch
            $table->boolean('is_required')->default(false); // Override question required status for this batch
            $table->boolean('is_active')->default(true); // Enable/disable for this batch
            $table->json('batch_specific_options')->nullable(); // Override options for this batch
            $table->json('batch_specific_validation')->nullable(); // Override validation for this batch
            $table->json('batch_specific_scoring')->nullable(); // Override scoring for this batch
            $table->timestamps();
            $table->timestamp('deleted_at')->nullable();

            $table->foreign('batch_id')->references('id')->on('batch')->onDelete('cascade');
            $table->foreign('question_id')->references('id')->on('questions')->onDelete('cascade');

            $table->unique(['batch_id', 'question_id']); // Prevent duplicate assignments
            $table->index(['batch_id', 'display_order']);
            $table->index(['question_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batch_questions');
    }
};
