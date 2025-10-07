<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class JobStatus extends Model
{
    use HasUuids;

    protected $table = 'job_statuses';

    protected $fillable = [
        'job_id',
        'job_type',
        'status',
        'progress',
        'message',
        'data',
        'started_at',
        'completed_at',
        'failed_at'
    ];

    protected $casts = [
        'data' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'failed_at' => 'datetime'
    ];

    // Job status constants
    const STATUS_PENDING = 'pending';
    const STATUS_RUNNING = 'running';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';
    const STATUS_CANCELLED = 'cancelled';

    // Job type constants
    const TYPE_SCREENING = 'screening';
    const TYPE_EXCEL_GENERATION = 'excel_generation';

    /**
     * Get the job status by job ID
     */
    public static function getByJobId($jobId)
    {
        return static::where('job_id', $jobId)->first();
    }

    /**
     * Create or update job status
     */
    public static function updateStatus($jobId, $jobType, $status, $progress = null, $message = null, $data = null)
    {
        return static::updateOrCreate(
            ['job_id' => $jobId],
            [
                'job_type' => $jobType,
                'status' => $status,
                'progress' => $progress,
                'message' => $message,
                'data' => $data,
                'started_at' => $status === self::STATUS_RUNNING ? Carbon::now() : null,
                'completed_at' => $status === self::STATUS_COMPLETED ? Carbon::now() : null,
                'failed_at' => $status === self::STATUS_FAILED ? Carbon::now() : null,
            ]
        );
    }

    /**
     * Mark job as completed
     */
    public function markCompleted($message = null, $data = null)
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'message' => $message,
            'data' => $data,
            'completed_at' => Carbon::now()
        ]);
    }

    /**
     * Mark job as failed
     */
    public function markFailed($message = null, $data = null)
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'message' => $message,
            'data' => $data,
            'failed_at' => Carbon::now()
        ]);
    }

    /**
     * Get duration in seconds
     */
    public function getDurationAttribute()
    {
        if (!$this->started_at) {
            return null;
        }

        $endTime = $this->completed_at ?? $this->failed_at ?? Carbon::now();
        return $this->started_at->diffInSeconds($endTime);
    }

    /**
     * Check if job is running
     */
    public function isRunning()
    {
        return $this->status === self::STATUS_RUNNING;
    }

    /**
     * Check if job is completed
     */
    public function isCompleted()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if job is failed
     */
    public function isFailed()
    {
        return $this->status === self::STATUS_FAILED;
    }
}
