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
        Schema::create('questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 50)->unique(); // Unique identifier for the question
            $table->string('label', 255); // Display label (e.g., "NAMA LENGKAP")
            $table->string('placeholder', 255)->nullable(); // Placeholder text
            $table->text('description')->nullable(); // Help text/description
            $table->enum('type', [
                'text',
                'textarea',
                'number',
                'email',
                'tel',
                'url',
                'password',
                'select',
                'multiselect',
                'radio',
                'checkbox',
                'date',
                'time',
                'datetime',
                'file',
                'hidden'
            ]); // Input type
            $table->json('options')->nullable(); // For select, radio, checkbox options
            $table->json('validation_rules')->nullable(); // Laravel validation rules
            $table->json('scoring_rules')->nullable(); // Scoring configuration
            $table->integer('display_order')->default(0); // Display order
            $table->boolean('required')->default(false); // Required field
            $table->boolean('readonly')->default(false); // Readonly field
            $table->boolean('disabled')->default(false); // Disabled field
            $table->string('icon', 50)->nullable(); // Icon class/name
            $table->string('group', 100)->nullable(); // Group/section name
            $table->json('conditional_logic')->nullable(); // Show/hide based on other fields
            $table->json('default_value')->nullable(); // Default value
            $table->boolean('has_custom_other_input')->default(false); // Allow custom "Other" input option
            $table->boolean('is_active')->default(true); // Active status
            $table->timestamps();
            $table->timestamp('deleted_at')->nullable();

            $table->index(['code', 'is_active']);
            $table->index(['group', 'display_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
