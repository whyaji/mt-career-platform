<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

class Program extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'program';

    protected $fillable = [
        'code',
        'name',
        'program_category_id',
        'description',
        'min_education',
        'majors',
        'min_gpa',
        'marital_status',
        'placement',
        'training_duration',
        'ojt_duration',
        'contract_duration',
        'status',
    ];

    protected $casts = [
        'majors' => 'array',
        'min_gpa' => 'decimal:2',
        'status' => 'integer',
        'training_duration' => 'integer',
        'ojt_duration' => 'integer',
        'contract_duration' => 'integer',
    ];

    const STATUS_INACTIVE = 0;
    const STATUS_ACTIVE = 1;

    const MARITAL_STATUS_SINGLE = 'single';
    const MARITAL_STATUS_ANY = 'any';

    const MIN_EDUCATION_D3 = 'D3';
    const MIN_EDUCATION_D4 = 'D4';
    const MIN_EDUCATION_S1 = 'S1';
    const MIN_EDUCATION_S2 = 'S2';

    public function programCategory()
    {
        return $this->belongsTo(ProgramCategory::class, 'program_category_id');
    }

    public function batches()
    {
        return $this->belongsToMany(Batch::class, 'batch_program', 'program_id', 'batch_id');
    }

    public function scopeActive($query)
    {
        return $query->where(array('status' => self::STATUS_ACTIVE, 'deleted_at' => null));
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('program_category_id', $categoryId);
    }
}
