<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

class ApplicantData extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'applicant_data';

    protected $fillable = [
        'nama_lengkap',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'usia',
        'daerah_lahir',
        'provinsi_lahir',
        'tinggi_badan',
        'berat_badan',
        'nik',
        'daerah_domisili',
        'provinsi_domisili',
        'kota_domisili',
        'alamat_domisili',
        'program_terpilih',
        'jurusan_pendidikan',
        'jenjang_pendidikan',
        'instansi_pendidikan',
        'nim',
        'status_ijazah',
        'nomor_whatsapp',
        'email',
        'status_perkawinan',
        'melanjutkan_pendidikan',
        'ukuran_baju',
        'riwayat_penyakit',
        'batch_id',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'usia' => 'integer',
        'tinggi_badan' => 'integer',
        'berat_badan' => 'integer',
    ];

    public function batch()
    {
        return $this->belongsTo(Batch::class, 'batch_id');
    }
}
