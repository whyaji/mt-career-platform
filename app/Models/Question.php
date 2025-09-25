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
     * Get validation rules as JSON array
     */
    public function getValidationRulesAttribute($value)
    {
        // Ensure validation_rules is always returned as an array
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : [];
        }

        return is_array($value) ? $value : [];
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
            [
                'rule' => 'in',
                'value' => '1,2,3',
                'message' => 'Value must be in list',
                'description' => 'List validation'
            ],
            [
                'rule' => 'not_in',
                'value' => '1,2,3',
                'message' => 'Value must not be in list',
                'description' => 'List validation'
            ]
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

    /**
     * Get conditional logic configuration for this question
     */
    public function getConditionalLogicConfig()
    {
        $conditionalLogic = $this->conditional_logic;

        if (!$conditionalLogic) {
            return null;
        }

        return [
            'enabled' => $conditionalLogic['enabled'] ?? false,
            'operator' => $conditionalLogic['operator'] ?? 'AND', // AND or OR
            'conditions' => $conditionalLogic['conditions'] ?? [],
        ];
    }

    /**
     * Check if this question should be visible based on form data
     *
     * @param array $formData The current form data (field_code => value)
     * @return bool True if question should be visible, false otherwise
     */
    public function shouldBeVisible($formData = [])
    {
        $config = $this->getConditionalLogicConfig();

        // If no conditional logic is configured, always show the question
        if (!$config || !$config['enabled']) {
            return true;
        }

        $conditions = $config['conditions'];
        $operator = $config['operator'];

        if (empty($conditions)) {
            return true;
        }

        $results = [];

        foreach ($conditions as $condition) {
            $fieldCode = $condition['field'] ?? null;
            $expectedValues = $condition['values'] ?? [];
            $operator = $condition['operator'] ?? 'in';

            if (!$fieldCode || empty($expectedValues)) {
                continue;
            }

            $fieldValue = $formData[$fieldCode] ?? null;
            $result = $this->evaluateConditionalLogic($fieldValue, $expectedValues, $operator);
            $results[] = $result;
        }

        // Apply the logical operator (AND/OR) to all condition results
        if ($operator === 'OR') {
            return in_array(true, $results, true);
        } else { // AND (default)
            return !in_array(false, $results, true) && !empty($results);
        }
    }

    /**
     * Evaluate a single conditional logic condition
     *
     * @param mixed $fieldValue The current value of the watched field
     * @param array $expectedValues The expected values that should trigger visibility
     * @param string $operator The comparison operator
     * @return bool True if condition is met
     */
    private function evaluateConditionalLogic($fieldValue, $expectedValues, $operator = 'in')
    {
        switch ($operator) {
            case 'in':
                // Field value must be one of the expected values
                return in_array($fieldValue, $expectedValues, true);

            case 'not_in':
                // Field value must NOT be any of the expected values
                return !in_array($fieldValue, $expectedValues, true);

            case 'contains':
                // Field value must contain any of the expected values (for string fields)
                if (!is_string($fieldValue)) {
                    return false;
                }
                foreach ($expectedValues as $expectedValue) {
                    if (strpos($fieldValue, $expectedValue) !== false) {
                        return true;
                    }
                }
                return false;

            case 'not_contains':
                // Field value must NOT contain any of the expected values
                if (!is_string($fieldValue)) {
                    return true;
                }
                foreach ($expectedValues as $expectedValue) {
                    if (strpos($fieldValue, $expectedValue) !== false) {
                        return false;
                    }
                }
                return true;

            case 'equals':
                // Field value must equal any of the expected values
                foreach ($expectedValues as $expectedValue) {
                    if ($fieldValue == $expectedValue) {
                        return true;
                    }
                }
                return false;

            case 'not_equals':
                // Field value must NOT equal any of the expected values
                foreach ($expectedValues as $expectedValue) {
                    if ($fieldValue == $expectedValue) {
                        return false;
                    }
                }
                return true;

            case 'empty':
                // Field value must be empty
                return empty($fieldValue);

            case 'not_empty':
                // Field value must NOT be empty
                return !empty($fieldValue);

            case 'greater_than':
                // Field value must be greater than any of the expected values
                if (!is_numeric($fieldValue)) {
                    return false;
                }
                foreach ($expectedValues as $expectedValue) {
                    if (is_numeric($expectedValue) && $fieldValue > $expectedValue) {
                        return true;
                    }
                }
                return false;

            case 'less_than':
                // Field value must be less than any of the expected values
                if (!is_numeric($fieldValue)) {
                    return false;
                }
                foreach ($expectedValues as $expectedValue) {
                    if (is_numeric($expectedValue) && $fieldValue < $expectedValue) {
                        return true;
                    }
                }
                return false;

            default:
                return false;
        }
    }

    /**
     * Get all questions that depend on this question (questions that watch this question)
     *
     * @param string $batchId Optional batch ID to filter by
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getDependentQuestions($batchId = null)
    {
        $query = self::whereJsonContains('conditional_logic->conditions', [
            'field' => $this->code
        ]);

        if ($batchId) {
            $query->whereHas('batches', function ($q) use ($batchId) {
                $q->where('batch_id', $batchId);
            });
        }

        return $query->get();
    }

    /**
     * Get all field codes that this question watches
     *
     * @return array Array of field codes
     */
    public function getWatchedFields()
    {
        $config = $this->getConditionalLogicConfig();

        if (!$config || empty($config['conditions'])) {
            return [];
        }

        $watchedFields = [];
        foreach ($config['conditions'] as $condition) {
            if (isset($condition['field'])) {
                $watchedFields[] = $condition['field'];
            }
        }

        return array_unique($watchedFields);
    }

    /**
     * Check if this question watches a specific field
     *
     * @param string $fieldCode The field code to check
     * @return bool True if this question watches the field
     */
    public function watchesField($fieldCode)
    {
        return in_array($fieldCode, $this->getWatchedFields());
    }

    /**
     * Get available conditional logic operators
     */
    public static function getConditionalLogicOperators()
    {
        return [
            'in' => 'Is one of',
            'not_in' => 'Is not one of',
            'equals' => 'Equals',
            'not_equals' => 'Does not equal',
            'contains' => 'Contains',
            'not_contains' => 'Does not contain',
            'empty' => 'Is empty',
            'not_empty' => 'Is not empty',
            'greater_than' => 'Greater than',
            'less_than' => 'Less than',
        ];
    }

    /**
     * Get conditional logic configuration template
     */
    public static function getConditionalLogicTemplate()
    {
        return [
            'enabled' => false,
            'operator' => 'AND', // AND or OR
            'conditions' => [
                [
                    'field' => '', // Field code to watch
                    'operator' => 'in', // Comparison operator
                    'values' => [], // Array of values to match
                ]
            ]
        ];
    }

    /**
     * Validate conditional logic configuration
     *
     * @param array $conditionalLogic The conditional logic configuration to validate
     * @return array Array of validation errors (empty if valid)
     */
    public static function validateConditionalLogic($conditionalLogic)
    {
        $errors = [];

        if (!is_array($conditionalLogic)) {
            return ['Invalid conditional logic format'];
        }

        if (!isset($conditionalLogic['enabled'])) {
            $errors[] = 'Missing "enabled" field';
        }

        if (isset($conditionalLogic['operator']) && !in_array($conditionalLogic['operator'], ['AND', 'OR'])) {
            $errors[] = 'Operator must be "AND" or "OR"';
        }

        if (isset($conditionalLogic['conditions']) && is_array($conditionalLogic['conditions'])) {
            foreach ($conditionalLogic['conditions'] as $index => $condition) {
                if (!isset($condition['field']) || empty($condition['field'])) {
                    $errors[] = "Condition {$index}: Missing or empty field";
                }

                if (!isset($condition['operator']) || empty($condition['operator'])) {
                    $errors[] = "Condition {$index}: Missing or empty operator";
                } elseif (!array_key_exists($condition['operator'], self::getConditionalLogicOperators())) {
                    $errors[] = "Condition {$index}: Invalid operator '{$condition['operator']}'";
                }

                if (!isset($condition['values']) || !is_array($condition['values'])) {
                    $errors[] = "Condition {$index}: Missing or invalid values array";
                }
            }
        }

        return $errors;
    }
}
