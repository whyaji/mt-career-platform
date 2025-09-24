<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProgramCategory extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'program_category';

    protected $fillable = [
        'code',
        'name',
        'description',
        'status',
    ];

    protected $casts = [
        'status' => 'integer',
    ];

    const STATUS_INACTIVE = 0;
    const STATUS_ACTIVE = 1;

    public function programs()
    {
        return $this->hasMany(Program::class, 'program_category_id');
    }

    public function scopeActive($query)
    {
        return $query->where(array('status' => self::STATUS_ACTIVE, 'deleted_at' => null));
    }
}
