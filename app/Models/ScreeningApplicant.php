<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScreeningApplicant extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'screening_applicant';

    protected $fillable = [
        'batch_id',
        'answers',
        'scoring',
        'total_score',
        'max_score',
        'marking',
        'total_marking',
        'ai_scoring',
        'total_ai_scoring',
        'status',
        'user_agent',
        'ip_address',
    ];

    protected $casts = [
        'answers' => 'array',
        'scoring' => 'array',
        'marking' => 'array',
        'ai_scoring' => 'array',
        'total_score' => 'integer',
        'max_score' => 'integer',
        'total_marking' => 'integer',
        'total_ai_scoring' => 'integer',
        'status' => 'integer',
    ];

    const STATUS_PENDING = 0;
    const STATUS_SCORED = 1;
    const STATUS_APPROVED = 2;
    const STATUS_REJECTED = 3;

    /**
     * Get the batch that owns this screening applicant
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class, 'batch_id');
    }

    /**
     * Get answers by question code
     */
    public function getAnswerByCode(string $questionCode): mixed
    {
        foreach ($this->answers as $answer) {
            if ($answer['question_code'] === $questionCode) {
                return $answer['answer'];
            }
        }
        return null;
    }

    /**
     * Get answers by question id
     */
    public function getAnswerById(string $questionId): mixed
    {
        foreach ($this->answers as $answer) {
            if ($answer['question_id'] === $questionId) {
                return $answer['answer'];
            }
        }
        return null;
    }

    /**
     * Get all answers as key-value pairs (question_code => answer)
     */
    public function getAnswersAsKeyValue(): array
    {
        $keyValueAnswers = [];
        foreach ($this->answers as $answer) {
            $keyValueAnswers[$answer['question_code']] = $answer['answer'];
        }
        return $keyValueAnswers;
    }

    /**
     * Calculate total score from individual question scores
     */
    public function calculateTotalScore(): int
    {
        if (!$this->scoring || !is_array($this->scoring)) {
            return 0;
        }

        return array_sum(array_column($this->scoring, 'score'));
    }

    /**
     * Get scoring percentage
     */
    public function getScoringPercentage(): float
    {
        if ($this->max_score <= 0) {
            return 0;
        }

        return ($this->total_score / $this->max_score) * 100;
    }

    /**
     * Scope for pending applicants
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope for scored applicants
     */
    public function scopeScored($query)
    {
        return $query->where('status', self::STATUS_SCORED);
    }

    /**
     * Scope for approved applicants
     */
    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    /**
     * Scope for rejected applicants
     */
    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_PENDING => 'Pending',
            self::STATUS_SCORED => 'Scored',
            self::STATUS_APPROVED => 'Approved',
            self::STATUS_REJECTED => 'Rejected',
            default => 'Unknown',
        };
    }

    /**
     * Get formatted IP address
     */
    public function getFormattedIpAddressAttribute(): string
    {
        return $this->ip_address ?? 'Unknown';
    }

    /**
     * Get browser information from user agent
     */
    public function getBrowserInfoAttribute(): array
    {
        if (!$this->user_agent) {
            return ['browser' => 'Unknown', 'os' => 'Unknown'];
        }

        $userAgent = $this->user_agent;

        // Simple browser detection
        $browser = 'Unknown';
        if (strpos($userAgent, 'Chrome') !== false) {
            $browser = 'Chrome';
        } elseif (strpos($userAgent, 'Firefox') !== false) {
            $browser = 'Firefox';
        } elseif (strpos($userAgent, 'Safari') !== false) {
            $browser = 'Safari';
        } elseif (strpos($userAgent, 'Edge') !== false) {
            $browser = 'Edge';
        }

        // Simple OS detection
        $os = 'Unknown';
        if (strpos($userAgent, 'Windows') !== false) {
            $os = 'Windows';
        } elseif (strpos($userAgent, 'Mac') !== false) {
            $os = 'macOS';
        } elseif (strpos($userAgent, 'Linux') !== false) {
            $os = 'Linux';
        } elseif (strpos($userAgent, 'Android') !== false) {
            $os = 'Android';
        } elseif (strpos($userAgent, 'iOS') !== false) {
            $os = 'iOS';
        }

        return [
            'browser' => $browser,
            'os' => $os,
            'user_agent' => $userAgent
        ];
    }

    /**
     * Scope for filtering by IP address
     */
    public function scopeByIpAddress($query, string $ipAddress)
    {
        return $query->where('ip_address', $ipAddress);
    }

    /**
     * Scope for filtering by user agent
     */
    public function scopeByUserAgent($query, string $userAgent)
    {
        return $query->where('user_agent', 'like', "%{$userAgent}%");
    }
}
