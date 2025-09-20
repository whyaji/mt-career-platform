<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EducationalInstitution extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'educational_institution';

    protected $fillable = [
        'name',
        'status',
    ];

    protected $casts = [
        'status' => 'integer',
    ];

    /**
     * Set the status attribute.
     */
    public function setStatusAttribute($value)
    {
        $this->attributes['status'] = (int) $value;
    }

    /**
     * Scope a query to only include active institutions.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    /**
     * Scope a query to only include inactive institutions.
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 0);
    }
}
