<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\BatchQuestion;
use App\Models\Question;
use App\Traits\PaginationTrait;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class BatchQuestionController extends Controller
{
    use PaginationTrait;

    public function __construct()
    {
        $this->middleware('jwt.auth');
    }

    public function getBatchQuestions(Request $request, $batchId)
    {
        try {
            $batch = Batch::find($batchId);

            if (!$batch) {
                return response()->json([
                    'success' => false,
                    'error' => 'BATCH_NOT_FOUND'
                ], 404);
            }

            // Get pagination parameters
            $paginationParams = $this->getPaginationParams($request);

            // Define searchable fields
            $searchableFields = ['questions.label', 'questions.code', 'questions.description'];

            // Build query with relationship
            $query = BatchQuestion::with(['question'])
                ->where('batch_id', $batchId)
                ->select(
                    'id',
                    'batch_id',
                    'question_id',
                    'display_order',
                    'is_required',
                    'is_active',
                    'batch_specific_options',
                    'batch_specific_validation',
                    'batch_specific_scoring',
                    'created_at',
                    'updated_at'
                );

            // Apply pagination with search
            $result = $this->paginateQuery($query, $paginationParams, $searchableFields);

            return $this->paginatedResponse($result, 'Batch questions retrieved successfully');
        } catch (\Exception $e) {
            Log::error("Error getting batch questions: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function getBatchQuestionById($batchId, $questionId)
    {
        try {
            $batchQuestion = BatchQuestion::where('batch_id', $batchId)
                ->where('question_id', $questionId)
                ->with(['question'])
                ->first();

            if (!$batchQuestion) {
                return response()->json([
                    'success' => false,
                    'error' => 'BATCH_QUESTION_NOT_FOUND'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $batchQuestion
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting batch question by ID: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function assignQuestionToBatch(Request $request, $batchId)
    {
        try {
            $batch = Batch::find($batchId);

            if (!$batch) {
                return response()->json([
                    'success' => false,
                    'error' => 'BATCH_NOT_FOUND'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'question_id' => 'required|exists:questions,id',
                'display_order' => 'nullable|integer|min:0',
                'is_required' => 'nullable|boolean',
                'is_active' => 'nullable|boolean',
                'batch_specific_options' => 'nullable|array',
                'batch_specific_validation' => 'nullable|array',
                'batch_specific_scoring' => 'nullable|array'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            $questionId = $request->input('question_id');

            // Check if question is already assigned to this batch
            $existingAssignment = BatchQuestion::where('batch_id', $batchId)
                ->where('question_id', $questionId)
                ->first();

            if ($existingAssignment) {
                return response()->json([
                    'success' => false,
                    'error' => 'QUESTION_ALREADY_ASSIGNED',
                    'message' => 'This question is already assigned to this batch'
                ], 400);
            }

            // Get the next display order if not provided
            $displayOrder = $request->input('display_order');
            if ($displayOrder === null) {
                $maxOrder = BatchQuestion::where('batch_id', $batchId)->max('display_order');
                $displayOrder = ($maxOrder ?? 0) + 1;
            }

            $batchQuestion = BatchQuestion::create([
                'batch_id' => $batchId,
                'question_id' => $questionId,
                'display_order' => $displayOrder,
                'is_required' => $request->input('is_required'),
                'is_active' => $request->input('is_active', true),
                'batch_specific_options' => $request->input('batch_specific_options'),
                'batch_specific_validation' => $request->input('batch_specific_validation'),
                'batch_specific_scoring' => $request->input('batch_specific_scoring')
            ]);

            $batchQuestion->load('question');

            return response()->json([
                'success' => true,
                'data' => $batchQuestion,
                'message' => 'Question assigned to batch successfully'
            ], 201);
        } catch (\Exception $e) {
            Log::error("Error assigning question to batch: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function updateBatchQuestion(Request $request, $batchId, $questionId)
    {
        try {
            $batchQuestion = BatchQuestion::where('batch_id', $batchId)
                ->where('question_id', $questionId)
                ->first();

            if (!$batchQuestion) {
                return response()->json([
                    'success' => false,
                    'error' => 'BATCH_QUESTION_NOT_FOUND'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'display_order' => 'nullable|integer|min:0',
                'is_required' => 'nullable|boolean',
                'is_active' => 'nullable|boolean',
                'batch_specific_options' => 'nullable|array',
                'batch_specific_validation' => 'nullable|array',
                'batch_specific_scoring' => 'nullable|array'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            $batchQuestion->update($request->all());
            $batchQuestion->load('question');

            return response()->json([
                'success' => true,
                'data' => $batchQuestion,
                'message' => 'Batch question updated successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error updating batch question: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function removeQuestionFromBatch($batchId, $questionId)
    {
        try {
            $batchQuestion = BatchQuestion::where('batch_id', $batchId)
                ->where('question_id', $questionId)
                ->first();

            if (!$batchQuestion) {
                return response()->json([
                    'success' => false,
                    'error' => 'BATCH_QUESTION_NOT_FOUND'
                ], 404);
            }

            $batchQuestion->delete();

            return response()->json([
                'success' => true,
                'message' => 'Question removed from batch successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error removing question from batch: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function reorderBatchQuestions(Request $request, $batchId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'question_orders' => 'required|array',
                'question_orders.*.question_id' => 'required|exists:questions,id',
                'question_orders.*.display_order' => 'required|integer|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            $questionOrders = $request->input('question_orders');

            DB::transaction(function () use ($batchId, $questionOrders) {
                foreach ($questionOrders as $order) {
                    BatchQuestion::where('batch_id', $batchId)
                        ->where('question_id', $order['question_id'])
                        ->update(['display_order' => $order['display_order']]);
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Question order updated successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error reordering batch questions: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function getAvailableQuestionsForBatch($batchId)
    {
        try {
            $batch = Batch::find($batchId);

            if (!$batch) {
                return response()->json([
                    'success' => false,
                    'error' => 'BATCH_NOT_FOUND'
                ], 404);
            }

            // Get questions that are not yet assigned to this batch
            $assignedQuestionIds = BatchQuestion::where('batch_id', $batchId)
                ->pluck('question_id')
                ->toArray();

            $availableQuestions = Question::active()
                ->whereNotIn('id', $assignedQuestionIds)
                ->select('id', 'code', 'label', 'type', 'group', 'display_order')
                ->orderBy('group')
                ->orderBy('display_order')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $availableQuestions
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting available questions for batch: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function bulkAssignQuestions(Request $request, $batchId)
    {
        try {
            $batch = Batch::find($batchId);

            if (!$batch) {
                return response()->json([
                    'success' => false,
                    'error' => 'BATCH_NOT_FOUND'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'question_ids' => 'required|array|min:1',
                'question_ids.*' => 'exists:questions,id',
                'default_is_required' => 'nullable|boolean',
                'default_is_active' => 'nullable|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            $questionIds = $request->input('question_ids');
            $defaultIsRequired = $request->input('default_is_required', false);
            $defaultIsActive = $request->input('default_is_active', true);

            // Check which questions are already assigned
            $assignedQuestionIds = BatchQuestion::where('batch_id', $batchId)
                ->whereIn('question_id', $questionIds)
                ->pluck('question_id')
                ->toArray();

            $newQuestionIds = array_diff($questionIds, $assignedQuestionIds);

            if (empty($newQuestionIds)) {
                return response()->json([
                    'success' => false,
                    'error' => 'NO_NEW_QUESTIONS',
                    'message' => 'All selected questions are already assigned to this batch'
                ], 400);
            }

            // Get the current max display order
            $maxOrder = BatchQuestion::where('batch_id', $batchId)->max('display_order');
            $currentOrder = $maxOrder ?? 0;

            $batchQuestions = [];
            foreach ($newQuestionIds as $index => $questionId) {
                $batchQuestions[] = [
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'batch_id' => $batchId,
                    'question_id' => $questionId,
                    'display_order' => $currentOrder + $index + 1,
                    'is_required' => $defaultIsRequired,
                    'is_active' => $defaultIsActive,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now()
                ];
            }

            BatchQuestion::insert($batchQuestions);

            return response()->json([
                'success' => true,
                'data' => [
                    'assigned_count' => count($newQuestionIds),
                    'skipped_count' => count($assignedQuestionIds),
                    'assigned_questions' => $newQuestionIds,
                    'skipped_questions' => $assignedQuestionIds
                ],
                'message' => 'Questions assigned to batch successfully'
            ], 201);
        } catch (\Exception $e) {
            Log::error("Error bulk assigning questions: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    public function getBatchFormConfiguration($batchId)
    {
        try {
            $batch = Batch::find($batchId);

            if (!$batch) {
                return response()->json([
                    'success' => false,
                    'error' => 'BATCH_NOT_FOUND'
                ], 404);
            }

            $batchQuestions = BatchQuestion::with(['question'])
                ->where('batch_id', $batchId)
                ->where('is_active', true)
                ->orderBy('display_order')
                ->get();

            $formConfiguration = $batchQuestions->map(function ($batchQuestion) {
                return $batchQuestion->getMergedConfig();
            })->filter(); // Remove null values

            return response()->json([
                'success' => true,
                'data' => [
                    'batch_id' => $batchId,
                    'batch_info' => [
                        'number' => $batch->number,
                        'location' => $batch->location,
                        'year' => $batch->year
                    ],
                    'questions' => $formConfiguration,
                    'total_questions' => $formConfiguration->count()
                ]
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting batch form configuration: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }
}
