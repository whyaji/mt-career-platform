<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

enum ApplicantDataScreeningStatus: int
{
    case PENDING = 1;
    case STOP = 2;
    case NOT_YET = 3;
    case PROCESS = 4;
    case DONE = 5;

    public function getLabel(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::STOP => 'Stop',
            self::NOT_YET => 'Not Yet',
            self::PROCESS => 'Process',
            self::DONE => 'Done',
        };
    }

    public static function getLabelByValue(int $value): string
    {
        return match ($value) {
            self::PENDING->value => 'Pending',
            self::STOP->value => 'Stop',
            self::NOT_YET->value => 'Not Yet',
            self::PROCESS->value => 'Process',
            self::DONE->value => 'Done',
            default => 'Unknown',
        };
    }
}

enum ApplicantDataReviewStatus: int
{
    case PENDING = 1;
    case STOP = 2;
    case UNREVIEWED = 3;
    case REJECTED = 4;
    case ACCEPTED = 5;

    public function getLabel(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::STOP => 'Stop',
            self::UNREVIEWED => 'Unreviewed',
            self::REJECTED => 'Rejected',
            self::ACCEPTED => 'Accepted',
        };
    }

    public static function getLabelByValue(int $value): string
    {
        return match ($value) {
            self::PENDING->value => 'Pending',
            self::STOP->value => 'Stop',
            self::UNREVIEWED->value => 'Unreviewed',
            self::REJECTED->value => 'Rejected',
            self::ACCEPTED->value => 'Accepted',
            default => 'Unknown',
        };
    }
}

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
        'screening_status',
        'screening_remark',
        'review_status',
        'review_remark',
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
