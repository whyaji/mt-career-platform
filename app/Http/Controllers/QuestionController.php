<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Traits\PaginationTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class QuestionController extends Controller
{
    use PaginationTrait;

    public function __construct()
    {
        $this->middleware('jwt.auth', ['except' => ['getActive']]);
    }

    public function getActive(Request $request)
    {
        try {
            $questions = Question::active()
                ->select(
                    'id',
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
                    'has_custom_other_input'
                )
                ->orderBy('display_order')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $questions
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting active questions: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function getQuestions(Request $request)
    {
        try {
            // Get pagination parameters
            $paginationParams = $this->getPaginationParams($request);

            // Define searchable fields
            $searchableFields = ['code', 'label', 'description', 'group'];

            // Build query
            $query = Question::select(
                'id',
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
                'created_at',
                'updated_at'
            );

            // Apply pagination with search
            $result = $this->paginateQuery($query, $paginationParams, $searchableFields);

            return $this->paginatedResponse($result, 'Questions retrieved successfully');
        } catch (\Exception $e) {
            Log::error("Error getting all questions: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function getQuestionById($id)
    {
        try {
            $question = Question::find($id);

            if (!$question) {
                return response()->json([
                    'success' => false,
                    'error' => 'QUESTION_NOT_FOUND'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $question
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting question by ID: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function getQuestionByCode($code)
    {
        try {
            $question = Question::where('code', $code)->first();

            if (!$question) {
                return response()->json([
                    'success' => false,
                    'error' => 'QUESTION_NOT_FOUND'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $question
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting question by code: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function createQuestion(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => 'required|string|max:50|unique:questions,code',
                'label' => 'required|string|max:255',
                'placeholder' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'type' => 'required|string|in:text,textarea,number,email,tel,url,password,select,multiselect,radio,checkbox,date,time,datetime,file,hidden',
                'options' => 'nullable|array',
                'options.*' => 'required|string|max:255',
                'validation_rules' => 'nullable|array',
                'scoring_rules' => 'nullable|array',
                'display_order' => 'nullable|integer|min:0',
                'required' => 'nullable|boolean',
                'readonly' => 'nullable|boolean',
                'disabled' => 'nullable|boolean',
                'icon' => 'nullable|string|max:50',
                'group' => 'nullable|string|max:100',
                'conditional_logic' => 'nullable|array',
                'default_value' => 'nullable',
                'has_custom_other_input' => 'nullable|boolean',
                'is_active' => 'nullable|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            // Validate options for select/radio/checkbox types
            $type = $request->input('type');
            if (in_array($type, ['select', 'multiselect', 'radio', 'checkbox']) && empty($request->input('options'))) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => 'Options are required for select, multiselect, radio, and checkbox types'
                ], 400);
            }

            $question = Question::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $question,
                'message' => 'Question created successfully'
            ], 201);
        } catch (\Exception $e) {
            Log::error("Error creating question: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function updateQuestion(Request $request, $id)
    {
        try {
            $question = Question::find($id);

            if (!$question) {
                return response()->json([
                    'success' => false,
                    'error' => 'QUESTION_NOT_FOUND'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'code' => 'sometimes|required|string|max:50|unique:questions,code,' . $id,
                'label' => 'sometimes|required|string|max:255',
                'placeholder' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'type' => 'sometimes|required|string|in:text,textarea,number,email,tel,url,password,select,multiselect,radio,checkbox,date,time,datetime,file,hidden',
                'options' => 'nullable|array',
                'options.*' => 'required|string|max:255',
                'validation_rules' => 'nullable|array',
                'scoring_rules' => 'nullable|array',
                'display_order' => 'nullable|integer|min:0',
                'required' => 'nullable|boolean',
                'readonly' => 'nullable|boolean',
                'disabled' => 'nullable|boolean',
                'icon' => 'nullable|string|max:50',
                'group' => 'nullable|string|max:100',
                'conditional_logic' => 'nullable|array',
                'default_value' => 'nullable',
                'has_custom_other_input' => 'nullable|boolean',
                'is_active' => 'nullable|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            // Validate options for select/radio/checkbox types
            $type = $request->input('type', $question->type);
            if (in_array($type, ['select', 'multiselect', 'radio', 'checkbox'])) {
                $options = $request->input('options', $question->options);
                if (empty($options)) {
                    return response()->json([
                        'success' => false,
                        'error' => 'VALIDATION_ERROR',
                        'message' => 'Options are required for select, multiselect, radio, and checkbox types'
                    ], 400);
                }
            }

            $question->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $question,
                'message' => 'Question updated successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error updating question: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function deleteQuestion($id)
    {
        try {
            $question = Question::find($id);

            if (!$question) {
                return response()->json([
                    'success' => false,
                    'error' => 'QUESTION_NOT_FOUND'
                ], 404);
            }

            // Check if question is being used in any batches
            $batchCount = $question->batchQuestions()->count();
            if ($batchCount > 0) {
                return response()->json([
                    'success' => false,
                    'error' => 'QUESTION_IN_USE',
                    'message' => 'Cannot delete question as it is being used in ' . $batchCount . ' batch(es)'
                ], 400);
            }

            $question->delete();

            return response()->json([
                'success' => true,
                'message' => 'Question deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error deleting question: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function getQuestionTypes()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => Question::getAvailableTypes()
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting question types: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function getValidationRules()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => Question::getAvailableValidationRules()
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting validation rules: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function getCommonValidationRules()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => Question::getCommonValidationRules()
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting common validation rules: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function getIcons()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => Question::getAvailableIcons()
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting icons: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function getQuestionsByGroup($group)
    {
        try {
            $questions = Question::byGroup($group)
                ->active()
                ->orderBy('display_order')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $questions
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting questions by group: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function duplicateQuestion(Request $request, $id)
    {
        try {
            $originalQuestion = Question::find($id);

            if (!$originalQuestion) {
                return response()->json([
                    'success' => false,
                    'error' => 'QUESTION_NOT_FOUND'
                ], 404);
            }

            $newCode = $request->input('code');
            if (!$newCode) {
                $newCode = $originalQuestion->code . '_copy_' . time();
            }

            // Check if new code already exists
            if (Question::where('code', $newCode)->exists()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => 'Question code already exists'
                ], 400);
            }

            $newQuestion = Question::create([
                'code' => $newCode,
                'label' => $originalQuestion->label . ' (Copy)',
                'placeholder' => $originalQuestion->placeholder,
                'description' => $originalQuestion->description,
                'type' => $originalQuestion->type,
                'options' => $originalQuestion->options,
                'validation_rules' => $originalQuestion->validation_rules,
                'scoring_rules' => $originalQuestion->scoring_rules,
                'display_order' => $originalQuestion->display_order + 1,
                'required' => $originalQuestion->required,
                'readonly' => $originalQuestion->readonly,
                'disabled' => $originalQuestion->disabled,
                'icon' => $originalQuestion->icon,
                'group' => $originalQuestion->group,
                'conditional_logic' => $originalQuestion->conditional_logic,
                'default_value' => $originalQuestion->default_value,
                'is_active' => false // Start as inactive
            ]);

            return response()->json([
                'success' => true,
                'data' => $newQuestion,
                'message' => 'Question duplicated successfully'
            ], 201);
        } catch (\Exception $e) {
            Log::error("Error duplicating question: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }
}
