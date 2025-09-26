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
        Schema::create('screening_applicant', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('batch_id');
            $table->json('answers'); // Array of {question_id, question_code, answer}
            $table->json('scoring')->nullable(); // Individual question scores
            $table->integer('total_score')->default(0);
            $table->integer('max_score')->default(0);
            $table->json('marking')->nullable(); // for manual scoring
            $table->integer('total_marking')->nullable(); // for manual scoring
            $table->json('ai_scoring')->nullable(); // for ai scoring
            $table->integer('total_ai_scoring')->nullable(); // for ai scoring
            $table->tinyInteger('status')->default(0); // 0=pending, 1=scored, 2=approved, 3=rejected
            $table->text('user_agent');
            $table->string('ip_address', 45);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('batch_id')->references('id')->on('batch')->onDelete('cascade');

            $table->index('batch_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('screening_applicant');
    }
};
