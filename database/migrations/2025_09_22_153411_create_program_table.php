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
        Schema::create('program', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('name');
            $table->uuid('program_category_id');
            $table->foreign('program_category_id')->references('id')->on('program_category');
            $table->text('description')->nullable();
            $table->string('min_education')->default('D3');
            $table->json('majors');
            $table->decimal('min_gpa', 3, 2)->default(2.75);
            $table->string('marital_status')->default('single');
            $table->string('placement');
            $table->integer('training_duration')->default(3);
            $table->integer('ojt_duration')->default(6);
            $table->integer('contract_duration')->nullable();
            $table->integer('status')->default(1);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('program');
    }
};
