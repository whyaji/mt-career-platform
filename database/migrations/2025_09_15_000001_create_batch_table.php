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
        Schema::create('batch', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->integer('number');
            $table->string('number_code', 64);
            $table->string('location', 64);
            $table->string('location_code', 64);
            $table->integer('year');
            $table->integer('status')->default(1); // 0: inactive, 1: active
            $table->timestamps();
            $table->timestamp('deleted_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batch');
    }
};
