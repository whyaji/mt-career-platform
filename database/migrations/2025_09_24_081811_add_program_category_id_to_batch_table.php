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
        Schema::table('batch', function (Blueprint $table) {
            $table->uuid('program_category_id')->nullable()->after('institutes');
            $table->foreign('program_category_id')->references('id')->on('program_category')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('batch', function (Blueprint $table) {
            $table->dropForeign(['program_category_id']);
            $table->dropColumn('program_category_id');
        });
    }
};
