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
        Schema::create('applicant_data', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nama_lengkap', 64);
            $table->string('jenis_kelamin', 1); // L or P
            $table->string('tempat_lahir', 64);
            $table->date('tanggal_lahir');
            $table->integer('usia');
            $table->string('daerah_lahir', 64);
            $table->string('provinsi_lahir', 64);
            $table->integer('tinggi_badan');
            $table->integer('berat_badan');
            $table->string('nik', 16);
            $table->string('daerah_domisili', 64);
            $table->string('provinsi_domisili', 64);
            $table->string('kota_domisili', 64);
            $table->string('alamat_domisili', 255);
            $table->string('program_terpilih', 64);
            $table->uuid('batch_id');
            $table->timestamps();
            $table->timestamp('deleted_at')->nullable();
            
            $table->foreign('batch_id')->references('id')->on('batch');
            $table->index('batch_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applicant_data');
    }
};
