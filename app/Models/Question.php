<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

class Question extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'questions';

    protected $fillable = [
        'code',
        'label',
        'placeholder',
        'description',
        'type',
        'options',
        'validation_rules',
        'scoring_rules',
        'display_order',
        'required',
        'readonly',
        'disabled',
        'icon',
        'group',
        'conditional_logic',
        'default_value',
        'has_custom_other_input',
        'is_active',
    ];

    protected $casts = [
        'options' => 'array',
        'validation_rules' => 'array',
        'scoring_rules' => 'array',
        'conditional_logic' => 'array',
        'default_value' => 'array',
        'required' => 'boolean',
        'readonly' => 'boolean',
        'disabled' => 'boolean',
        'has_custom_other_input' => 'boolean',
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    const TYPE_TEXT = 'text';
    const TYPE_TEXTAREA = 'textarea';
    const TYPE_NUMBER = 'number';
    const TYPE_EMAIL = 'email';
    const TYPE_TEL = 'tel';
    const TYPE_URL = 'url';
    const TYPE_PASSWORD = 'password';
    const TYPE_SELECT = 'select';
    const TYPE_MULTISELECT = 'multiselect';
    const TYPE_RADIO = 'radio';
    const TYPE_CHECKBOX = 'checkbox';
    const TYPE_DATE = 'date';
    const TYPE_TIME = 'time';
    const TYPE_DATETIME = 'datetime';
    const TYPE_FILE = 'file';
    const TYPE_HIDDEN = 'hidden';

    const STATUS_INACTIVE = false;
    const STATUS_ACTIVE = true;

    /**
     * Get the batches that use this question
     */
    public function batches()
    {
        return $this->belongsToMany(Batch::class, 'batch_questions', 'question_id', 'batch_id')
            ->withPivot(['display_order', 'is_required', 'is_active', 'batch_specific_options', 'batch_specific_validation', 'batch_specific_scoring'])
            ->withTimestamps();
    }

    /**
     * Get batch questions pivot records
     */
    public function batchQuestions()
    {
        return $this->hasMany(BatchQuestion::class, 'question_id');
    }

    /**
     * Scope for active questions
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', self::STATUS_ACTIVE);
    }

    /**
     * Scope for questions by group
     */
    public function scopeByGroup($query, $group)
    {
        return $query->where('group', $group);
    }

    /**
     * Scope for questions by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Get validation rules as Laravel validation string
     */
    public function getValidationRulesAttribute($value)
    {
        $rules = is_array($value) ? $value : json_decode($value, true);

        if (!$rules) {
            return [];
        }

        $validationString = [];

        if ($this->required) {
            $validationString[] = 'required';
        } else {
            $validationString[] = 'nullable';
        }

        foreach ($rules as $rule => $value) {
            if (is_bool($value) && $value) {
                $validationString[] = $rule;
            } elseif (!is_bool($value)) {
                $validationString[] = $rule . ':' . $value;
            }
        }

        return $validationString;
    }

    /**
     * Get all available question types
     */
    public static function getAvailableTypes()
    {
        return [
            self::TYPE_TEXT => 'Text Input',
            self::TYPE_TEXTAREA => 'Text Area',
            self::TYPE_NUMBER => 'Number Input',
            self::TYPE_EMAIL => 'Email Input',
            self::TYPE_TEL => 'Telephone Input',
            self::TYPE_URL => 'URL Input',
            self::TYPE_PASSWORD => 'Password Input',
            self::TYPE_SELECT => 'Select Dropdown',
            self::TYPE_MULTISELECT => 'Multi Select',
            self::TYPE_RADIO => 'Radio Buttons',
            self::TYPE_CHECKBOX => 'Checkboxes',
            self::TYPE_DATE => 'Date Input',
            self::TYPE_TIME => 'Time Input',
            self::TYPE_DATETIME => 'DateTime Input',
            self::TYPE_FILE => 'File Upload',
            self::TYPE_HIDDEN => 'Hidden Field',
        ];
    }

    /**
     * Get all available validation rules
     */
    public static function getAvailableValidationRules()
    {
        return [
            'string' => 'String',
            'integer' => 'Integer',
            'numeric' => 'Numeric',
            'email' => 'Valid Email',
            'url' => 'Valid URL',
            'min' => 'Minimum Value/Length',
            'max' => 'Maximum Value/Length',
            'size' => 'Exact Size',
            'between' => 'Between Range',
            'in' => 'Must Be In List',
            'not_in' => 'Must Not Be In List',
            'regex' => 'Regular Expression',
            'alpha' => 'Only Letters',
            'alpha_num' => 'Letters and Numbers',
            'alpha_dash' => 'Letters, Numbers, Dashes, Underscores',
            'unique' => 'Unique Value',
            'exists' => 'Must Exist',
            'date' => 'Valid Date',
            'before' => 'Date Before',
            'after' => 'Date After',
            'confirmed' => 'Must Match Confirmation',
        ];
    }

    /**
     * Get common validation rule templates
     */
    public static function getCommonValidationRules()
    {
        return [
            [
                'rule' => 'min_length',
                'value' => '3',
                'message' => 'Minimum 3 characters required',
                'description' => 'Ensures minimum character length'
            ],
            [
                'rule' => 'max_length',
                'value' => '50',
                'message' => 'Maximum 50 characters allowed',
                'description' => 'Ensures maximum character length'
            ],
            [
                'rule' => 'required',
                'value' => '',
                'message' => 'This field is required',
                'description' => 'Makes field mandatory'
            ],
            [
                'rule' => 'email',
                'value' => '',
                'message' => 'Please enter a valid email address',
                'description' => 'Validates email format'
            ],
            [
                'rule' => 'numeric',
                'value' => '',
                'message' => 'Only numbers are allowed',
                'description' => 'Accepts only numeric values'
            ],
            [
                'rule' => 'alpha',
                'value' => '',
                'message' => 'Only letters are allowed',
                'description' => 'Accepts only alphabetic characters'
            ],
            [
                'rule' => 'alpha_numeric',
                'value' => '',
                'message' => 'Only letters and numbers are allowed',
                'description' => 'Accepts letters and numbers only'
            ],
            [
                'rule' => 'no_symbols',
                'value' => '',
                'message' => 'Symbols are not allowed',
                'description' => 'Prevents special symbols'
            ],
            [
                'rule' => 'min_value',
                'value' => '0',
                'message' => 'Minimum value is 0',
                'description' => 'Sets minimum numeric value'
            ],
            [
                'rule' => 'max_value',
                'value' => '100',
                'message' => 'Maximum value is 100',
                'description' => 'Sets maximum numeric value'
            ],
            [
                'rule' => 'regex',
                'value' => '^[A-Za-z\\s]+$',
                'message' => 'Only letters and spaces allowed',
                'description' => 'Custom regex pattern validation'
            ],
            [
                'rule' => 'phone',
                'value' => '',
                'message' => 'Please enter a valid phone number',
                'description' => 'Validates phone number format'
            ],
            [
                'rule' => 'url',
                'value' => '',
                'message' => 'Please enter a valid URL',
                'description' => 'Validates URL format'
            ],
            [
                'rule' => 'date',
                'value' => '',
                'message' => 'Please enter a valid date',
                'description' => 'Validates date format'
            ],
            [
                'rule' => 'between',
                'value' => '1,100',
                'message' => 'Value must be between 1 and 100',
                'description' => 'Range validation'
            ],
        ];
    }

    /**
     * Get available icons for questions
     */
    public static function getAvailableIcons()
    {
        return [
            'IconUser' => 'User',
            'IconMail' => 'Email',
            'IconPhone' => 'Phone',
            'IconCalendar' => 'Calendar',
            'IconClock' => 'Clock',
            'IconMapPin' => 'Location',
            'IconBuilding' => 'Building',
            'IconSchool' => 'School',
            'IconBriefcase' => 'Work',
            'IconHeart' => 'Heart',
            'IconStar' => 'Star',
            'IconLock' => 'Lock',
            'IconKey' => 'Key',
            'IconCreditCard' => 'Payment',
            'IconGlobe' => 'Website',
            'IconFileText' => 'Document',
            'IconImage' => 'Image',
            'IconDownload' => 'Download',
            'IconUpload' => 'Upload',
            'IconEdit' => 'Edit',
            'IconTrash' => 'Delete',
            'IconCheck' => 'Check',
            'IconX' => 'Close',
            'IconPlus' => 'Add',
            'IconMinus' => 'Remove',
            'IconSearch' => 'Search',
            'IconFilter' => 'Filter',
            'IconSettings' => 'Settings',
            'IconInfo' => 'Info',
            'IconAlert' => 'Alert',
            'IconQuestionMark' => 'Question',
            'IconEye' => 'View',
            'IconEyeOff' => 'Hide',
            'IconShield' => 'Security',
            'IconTarget' => 'Target',
            'IconTrophy' => 'Trophy',
            'IconFlag' => 'Flag',
            'IconHome' => 'Home',
            'IconMenu' => 'Menu',
            'IconArrowRight' => 'Arrow Right',
            'IconArrowLeft' => 'Arrow Left',
            'IconArrowUp' => 'Arrow Up',
            'IconArrowDown' => 'Arrow Down',
        ];
    }

    /**
     * Get scoring configuration for this question
     */
    public function getScoringConfig()
    {
        $scoring = $this->scoring_rules;

        if (!$scoring) {
            return null;
        }

        return [
            'enabled' => $scoring['enabled'] ?? false,
            'points' => $scoring['points'] ?? 0,
            'conditions' => $scoring['conditions'] ?? [],
            'max_score' => $scoring['max_score'] ?? 0,
        ];
    }

    /**
     * Calculate score for a given answer
     */
    public function calculateScore($answer)
    {
        $scoring = $this->getScoringConfig();

        if (!$scoring || !$scoring['enabled']) {
            return 0;
        }

        $score = 0;
        $conditions = $scoring['conditions'] ?? [];

        foreach ($conditions as $condition) {
            if ($this->evaluateCondition($condition, $answer)) {
                $score += $condition['points'] ?? 0;
            }
        }

        return min($score, $scoring['max_score']);
    }

    /**
     * Evaluate a scoring condition
     */
    private function evaluateCondition($condition, $answer)
    {
        $operator = $condition['operator'] ?? 'equals';
        $expected = $condition['value'] ?? null;

        switch ($operator) {
            case 'equals':
                return $answer == $expected;
            case 'not_equals':
                return $answer != $expected;
            case 'contains':
                return strpos($answer, $expected) !== false;
            case 'greater_than':
                return $answer > $expected;
            case 'less_than':
                return $answer < $expected;
            case 'greater_equal':
                return $answer >= $expected;
            case 'less_equal':
                return $answer <= $expected;
            case 'in':
                return in_array($answer, $expected);
            case 'not_in':
                return !in_array($answer, $expected);
            default:
                return false;
        }
    }
}
