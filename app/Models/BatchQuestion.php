<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

class BatchQuestion extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'batch_questions';

    protected $fillable = [
        'batch_id',
        'question_id',
        'display_order',
        'is_required',
        'is_active',
        'batch_specific_options',
        'batch_specific_validation',
        'batch_specific_scoring',
    ];

    protected $casts = [
        'batch_specific_options' => 'array',
        'batch_specific_validation' => 'array',
        'batch_specific_scoring' => 'array',
        'is_required' => 'boolean',
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    /**
     * Get the batch that owns this question assignment
     */
    public function batch()
    {
        return $this->belongsTo(Batch::class, 'batch_id');
    }

    /**
     * Get the question that is assigned to this batch
     */
    public function question()
    {
        return $this->belongsTo(Question::class, 'question_id');
    }

    /**
     * Scope for active batch questions
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for required batch questions
     */
    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    /**
     * Get effective options for this batch question
     * Returns batch-specific options if available, otherwise question default options
     */
    public function getEffectiveOptions()
    {
        if ($this->batch_specific_options && !empty($this->batch_specific_options)) {
            return $this->batch_specific_options;
        }

        return $this->question ? $this->question->options : [];
    }

    /**
     * Get effective validation rules for this batch question
     * Returns batch-specific validation if available, otherwise question default validation
     */
    public function getEffectiveValidation()
    {
        if ($this->batch_specific_validation && !empty($this->batch_specific_validation)) {
            return $this->batch_specific_validation;
        }

        return $this->question ? $this->question->validation_rules : [];
    }

    /**
     * Get effective scoring rules for this batch question
     * Returns batch-specific scoring if available, otherwise question default scoring
     */
    public function getEffectiveScoring()
    {
        if ($this->batch_specific_scoring && !empty($this->batch_specific_scoring)) {
            return $this->batch_specific_scoring;
        }

        return $this->question ? $this->question->scoring_rules : [];
    }

    /**
     * Check if this batch question is effectively required
     * Takes into account both batch-specific and question default settings
     */
    public function isEffectivelyRequired()
    {
        if (isset($this->is_required)) {
            return $this->is_required;
        }

        return $this->question ? $this->question->required : false;
    }

    /**
     * Check if this batch question is effectively active
     * Takes into account both batch-specific and question default settings
     */
    public function isEffectivelyActive()
    {
        if (isset($this->is_active)) {
            return $this->is_active;
        }

        return $this->question ? $this->question->is_active : false;
    }

    /**
     * Get the effective display order for this batch question
     */
    public function getEffectiveDisplayOrder()
    {
        if ($this->display_order !== null && $this->display_order > 0) {
            return $this->display_order;
        }

        return $this->question ? $this->question->display_order : 0;
    }

    /**
     * Get merged configuration for this batch question
     * Combines question defaults with batch-specific overrides
     */
    public function getMergedConfig()
    {
        $question = $this->question;

        if (!$question) {
            return null;
        }

        return [
            'id' => $this->id,
            'question_id' => $this->question_id,
            'batch_id' => $this->batch_id,
            'code' => $question->code,
            'label' => $question->label,
            'placeholder' => $question->placeholder,
            'description' => $question->description,
            'type' => $question->type,
            'options' => $this->getEffectiveOptions(),
            'validation_rules' => $this->getEffectiveValidation(),
            'scoring_rules' => $this->getEffectiveScoring(),
            'display_order' => $this->getEffectiveDisplayOrder(),
            'required' => $this->isEffectivelyRequired(),
            'readonly' => $question->readonly,
            'disabled' => $question->disabled,
            'icon' => $question->icon,
            'group' => $question->group,
            'conditional_logic' => $question->conditional_logic,
            'default_value' => $question->default_value,
            'has_custom_other_input' => $question->has_custom_other_input,
            'is_active' => $this->isEffectivelyActive(),
        ];
    }
}
