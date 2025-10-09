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
            $table->tinyInteger('graduation_status')->default(1)->after('screening_remark')->comment('1: pending, 2: error, 3: not found, 4: dropout, 5: active, 6: not match, 7: graduated');
            $table->string('graduation_remark', 255)->nullable()->after('graduation_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applicant_data', function (Blueprint $table) {
            $table->dropColumn(['graduation_status', 'graduation_remark']);
        });
    }
};
