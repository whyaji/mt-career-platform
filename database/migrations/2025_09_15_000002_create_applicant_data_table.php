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
            $table->enum('jenis_kelamin', ['L', 'P']);
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
            $table->enum('program_terpilih', ['pkpp-estate', 'pkpp-ktu', 'pkpp-mill']);

            $table->string('jurusan_pendidikan', 64);
            $table->enum('jenjang_pendidikan', ['D3', 'D4', 'S1', 'S2']);
            $table->string('instansi_pendidikan', 64);
            $table->string('nim', 32)->nullable();
            $table->enum('status_ijazah', ['Ada', 'Surat Keterangan Lulus', 'Tidak Ada']);
            $table->string('nomor_whatsapp', 24);
            $table->string('email', 64);
            $table->enum('status_perkawinan', ['Lajang', 'Kawin', 'Cerai']);
            $table->enum('melanjutkan_pendidikan', ['Ya', 'Tidak']);
            $table->enum('ukuran_baju', ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL']);
            $table->string('riwayat_penyakit', 255);

            $table->uuid('batch_id');
            $table->timestamps();
            $table->timestamp('deleted_at')->nullable();

            $table->foreign('batch_id')->references('id')->on('batch');
            $table->index('batch_id');
            $table->index('program_terpilih');
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
