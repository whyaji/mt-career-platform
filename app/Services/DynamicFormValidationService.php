<?php

namespace App\Services;

use App\Models\BatchQuestion;
use App\Models\Question;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class DynamicFormValidationService
{
    /**
     * Validate dynamic form submission
     */
    public function validateFormSubmission(array $data, string $batchId): array
    {
        // Get batch questions with merged configuration
        $batchQuestions = BatchQuestion::where('batch_id', $batchId)
            ->where('is_active', true)
            ->with('question')
            ->get();

        if ($batchQuestions->isEmpty()) {
            return [
                'valid' => false,
                'errors' => ['No active questions found for this batch']
            ];
        }

        // Build validation rules based on visible questions
        $validationRules = $this->buildValidationRules($batchQuestions, $data);

        // Add common validation rules
        $validationRules = array_merge($validationRules, [
            'batch_id' => 'required|uuid|exists:batch,id',
            'agreement1' => 'required|string|in:agree',
            'agreement2' => 'required|string|in:agree',
            'agreement3' => 'required|string|in:agree',
            'turnstileToken' => 'required|string|min:1',
            'answers' => 'required|array|min:1',
            'answers.*.question_id' => 'required|string',
            'answers.*.question_code' => 'required|string',
            'answers.*.answer' => 'required',
        ]);

        $customMessages = [
            'agreement1.in' => 'Agreement 1 must be set to "agree"',
            'agreement2.in' => 'Agreement 2 must be set to "agree"',
            'agreement3.in' => 'Agreement 3 must be set to "agree"',
        ];

        $validator = Validator::make($data, $validationRules, $customMessages);

        if ($validator->fails()) {
            return [
                'valid' => false,
                'errors' => $validator->errors()->toArray()
            ];
        }

        // Validate agreement values
        $agreementValidation = $this->validateAgreements($data);
        if (!$agreementValidation['valid']) {
            return $agreementValidation;
        }

        // Validate answers against question requirements
        $answerValidation = $this->validateAnswers($data['answers'], $batchQuestions, $data);

        if (!$answerValidation['valid']) {
            return $answerValidation;
        }

        return [
            'valid' => true,
            'errors' => []
        ];
    }

    /**
     * Build validation rules from batch questions
     */
    private function buildValidationRules($batchQuestions, array $formData): array
    {
        $rules = [];

        foreach ($batchQuestions as $batchQuestion) {
            $config = $batchQuestion->getMergedConfig(false);

            if (!$config || !$config['is_active']) {
                continue;
            }

            // Check if question should be visible based on conditional logic
            if (!$this->shouldQuestionBeVisible($config, $formData)) {
                continue;
            }

            $fieldRules = $this->buildFieldValidationRules($config);
            $rules["answers.*.answer"] = array_merge(
                $rules["answers.*.answer"] ?? [],
                $fieldRules
            );
        }

        return $rules;
    }

    /**
     * Build validation rules for a specific field
     */
    private function buildFieldValidationRules(array $config): array
    {
        $rules = [];
        $validationRules = $config['validation_rules'] ?? [];

        foreach ($validationRules as $rule) {
            switch ($rule['rule']) {
                case 'required':
                    $rules[] = 'required';
                    break;
                case 'min_length':
                    if (is_numeric($rule['value'])) {
                        $rules[] = 'min:' . $rule['value'];
                    }
                    break;
                case 'max_length':
                    if (is_numeric($rule['value'])) {
                        $rules[] = 'max:' . $rule['value'];
                    }
                    break;
                case 'min_value':
                    if (is_numeric($rule['value'])) {
                        $rules[] = 'min:' . $rule['value'];
                    }
                    break;
                case 'max_value':
                    if (is_numeric($rule['value'])) {
                        $rules[] = 'max:' . $rule['value'];
                    }
                    break;
                case 'email':
                    $rules[] = 'email';
                    break;
                case 'numeric':
                    $rules[] = 'numeric';
                    break;
                case 'in':
                    if (!empty($rule['value'])) {
                        $values = explode(',', $rule['value']);
                        $rules[] = 'in:' . implode(',', $values);
                    }
                    break;
                case 'regex':
                    if (!empty($rule['value'])) {
                        $rules[] = 'regex:' . $rule['value'];
                    }
                    break;
            }
        }

        // Add type-specific rules
        switch ($config['type']) {
            case 'email':
                $rules[] = 'email';
                break;
            case 'number':
                $rules[] = 'numeric';
                break;
            case 'date':
                $rules[] = 'date';
                break;
            case 'checkbox':
            case 'multiselect':
                $rules[] = 'array';
                break;
        }

        return $rules;
    }

    /**
     * Check if question should be visible based on conditional logic
     */
    private function shouldQuestionBeVisible(array $config, array $formData): bool
    {
        $conditionalLogic = $config['conditional_logic'] ?? null;

        if (!$conditionalLogic || !($conditionalLogic['enabled'] ?? false)) {
            return true;
        }

        $conditions = $conditionalLogic['conditions'] ?? [];
        $operator = $conditionalLogic['operator'] ?? 'AND';

        if (empty($conditions)) {
            return true;
        }

        $results = [];
        foreach ($conditions as $condition) {
            $fieldValue = $this->getFieldValueFromFormData($condition['field'], $formData);
            $result = $this->evaluateCondition($fieldValue, $condition);
            $results[] = $result;
        }

        return $operator === 'OR'
            ? in_array(true, $results, true)
            : !in_array(false, $results, true) && !empty($results);
    }

    /**
     * Get field value from form data, checking both direct access and answers array
     */
    private function getFieldValueFromFormData(string $fieldName, array $formData)
    {
        // First check if field exists directly in form data
        if (isset($formData[$fieldName])) {
            return $formData[$fieldName];
        }

        // If not found, look in answers array
        if (isset($formData['answers']) && is_array($formData['answers'])) {
            foreach ($formData['answers'] as $answer) {
                if (isset($answer['question_code']) && $answer['question_code'] === $fieldName) {
                    return $answer['answer'] ?? null;
                }
            }
        }

        return null;
    }

    /**
     * Evaluate a single conditional logic condition
     */
    private function evaluateCondition($fieldValue, array $condition): bool
    {
        $operator = $condition['operator'] ?? 'in';
        $expectedValues = $condition['values'] ?? [];

        switch ($operator) {
            case 'in':
                return in_array($fieldValue, $expectedValues, true);
            case 'not_in':
                return !in_array($fieldValue, $expectedValues, true);
            case 'equals':
                return in_array($fieldValue, $expectedValues, true);
            case 'not_equals':
                return !in_array($fieldValue, $expectedValues, true);
            case 'contains':
                if (!is_string($fieldValue)) return false;
                foreach ($expectedValues as $expectedValue) {
                    if (strpos($fieldValue, $expectedValue) !== false) {
                        return true;
                    }
                }
                return false;
            case 'not_contains':
                if (!is_string($fieldValue)) return true;
                foreach ($expectedValues as $expectedValue) {
                    if (strpos($fieldValue, $expectedValue) !== false) {
                        return false;
                    }
                }
                return true;
            case 'empty':
                return empty($fieldValue);
            case 'not_empty':
                return !empty($fieldValue);
            case 'greater_than':
                if (!is_numeric($fieldValue)) return false;
                foreach ($expectedValues as $expectedValue) {
                    if (is_numeric($expectedValue) && $fieldValue > $expectedValue) {
                        return true;
                    }
                }
                return false;
            case 'less_than':
                if (!is_numeric($fieldValue)) return false;
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
     * Validate answers against question requirements
     */
    private function validateAnswers(array $answers, $batchQuestions, array $formData): array
    {
        $errors = [];
        $answerCodes = array_column($answers, 'question_code');

        // Get visible questions
        $visibleQuestions = [];
        foreach ($batchQuestions as $batchQuestion) {
            $config = $batchQuestion->getMergedConfig(false);
            if ($config && $config['is_active'] && $this->shouldQuestionBeVisible($config, $formData)) {
                $visibleQuestions[$config['code']] = $config;
            }
        }

        // Check if all required visible questions are answered
        foreach ($visibleQuestions as $code => $config) {
            if ($config['required'] && !in_array($code, $answerCodes)) {
                $errors[] = "Required question '{$config['label']}' is missing";
            }
        }

        // Validate each answer
        foreach ($answers as $index => $answer) {
            $questionCode = $answer['question_code'];

            if (!isset($visibleQuestions[$questionCode])) {
                $errors[] = "Question '{$questionCode}' is not visible or active";
                continue;
            }

            $config = $visibleQuestions[$questionCode];
            $answerValue = $answer['answer'];

            // Validate answer value
            $fieldErrors = $this->validateAnswerValue($answerValue, $config);
            if (!empty($fieldErrors)) {
                foreach ($fieldErrors as $error) {
                    $errors[] = "Answer {$index}: {$error}";
                }
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Validate a single answer value
     */
    private function validateAnswerValue($value, array $config): array
    {
        $errors = [];
        $validationRules = $config['validation_rules'] ?? [];

        foreach ($validationRules as $rule) {
            switch ($rule['rule']) {
                case 'required':
                    if (empty($value)) {
                        $errors[] = $rule['message'] ?? 'This field is required';
                    }
                    break;
                case 'min_length':
                    if (is_string($value) && strlen($value) < (int)$rule['value']) {
                        $errors[] = $rule['message'] ?? "Minimum length is {$rule['value']}";
                    }
                    break;
                case 'max_length':
                    if (is_string($value) && strlen($value) > (int)$rule['value']) {
                        $errors[] = $rule['message'] ?? "Maximum length is {$rule['value']}";
                    }
                    break;
                case 'min_value':
                    if (is_numeric($value) && $value < (float)$rule['value']) {
                        $errors[] = $rule['message'] ?? "Minimum value is {$rule['value']}";
                    }
                    break;
                case 'max_value':
                    if (is_numeric($value) && $value > (float)$rule['value']) {
                        $errors[] = $rule['message'] ?? "Maximum value is {$rule['value']}";
                    }
                    break;
                case 'email':
                    if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                        $errors[] = $rule['message'] ?? 'Invalid email format';
                    }
                    break;
                case 'in':
                    $allowedValues = explode(',', $rule['value']);
                    if (!in_array($value, $allowedValues)) {
                        $errors[] = $rule['message'] ?? 'Invalid value';
                    }
                    break;
            }
        }

        return $errors;
    }

    /**
     * Validate agreement values
     */
    private function validateAgreements(array $data): array
    {
        $errors = [];
        $agreementFields = ['agreement1', 'agreement2', 'agreement3'];

        foreach ($agreementFields as $field) {
            if (!isset($data[$field])) {
                $errors[] = "Missing required field: {$field}";
                continue;
            }

            $value = $data[$field];

            // Check if value is exactly "agree"
            if ($value !== 'agree') {
                $errors[] = "The {$field} must be exactly 'agree', got: '{$value}'";
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
}
