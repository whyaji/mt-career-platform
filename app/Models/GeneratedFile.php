<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class GeneratedFile extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'type',
        'model_type',
        'model_id',
        'ext',
        'path',
        'request_at',
    ];

    protected $casts = [
        'request_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Str::uuid();
            }
        });

        static::deleted(function ($model) {
            // Delete the actual file when the model is deleted (soft or hard)
            if ($model->path && file_exists(public_path($model->path))) {
                unlink(public_path($model->path));
            }
        });
    }

    /**
     * Get the model that owns the generated file
     */
    public function model()
    {
        if ($this->model_type && $this->model_id) {
            $modelClass = 'App\\Models\\' . ucfirst($this->model_type);
            if (class_exists($modelClass)) {
                return $modelClass::find($this->model_id);
            }
        }
        return null;
    }

    /**
     * Get the full file path
     */
    public function getFullPathAttribute()
    {
        return public_path($this->path);
    }

    /**
     * Get the download URL
     */
    public function getDownloadUrlAttribute()
    {
        return url($this->path);
    }

    /**
     * Check if file exists
     */
    public function fileExists()
    {
        return $this->path && file_exists($this->getFullPathAttribute());
    }
}
