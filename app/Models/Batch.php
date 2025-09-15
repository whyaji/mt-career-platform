<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

class Batch extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'batch';
    
    protected $fillable = [
        'number',
        'number_code',
        'location',
        'location_code',
        'year',
        'status',
    ];

    protected $casts = [
        'number' => 'integer',
        'year' => 'integer',
        'status' => 'integer',
    ];

    const STATUS_INACTIVE = 0;
    const STATUS_ACTIVE = 1;

    public function applicantData()
    {
        return $this->hasMany(ApplicantData::class, 'batch_id');
    }

    public function scopeActive($query)
    {
        return $query->where(array('status' => self::STATUS_ACTIVE, 'deleted_at' => null));
    }

    public static function isPathValid($location, $number)
    {
        return self::select('id', 'number', 'number_code', 'location', 'location_code', 'year')->where(array('location_code' => strtoupper($location), 'number_code' => strtoupper($number)))->first();
    }
}
