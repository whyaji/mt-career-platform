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
        Schema::table('applicant_data', function (Blueprint $table) {
            $table->tinyInteger('screening_status')->default(1)->after('batch_id')->comment('1: pending, 2: stop, 3: not yet, 4: process, 5: done');
            $table->string('screening_remark', 255)->nullable()->after('screening_status');
            $table->tinyInteger('review_status')->default(1)->after('screening_remark')->comment('1: pending, 2: stop, 3: unreviewed, 4: rejected, 5: accepted');
            $table->string('review_remark', 255)->nullable()->after('review_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applicant_data', function (Blueprint $table) {
            $table->dropColumn(['screening_status', 'screening_remark', 'review_status', 'review_remark']);
        });
    }
};
