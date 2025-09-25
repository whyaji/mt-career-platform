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

    // Enum for bulk operation types
    const BULK_BQ_INFO = [
        'CREATE' => 'create',
        'UPDATE' => 'update',
        'DELETE' => 'delete'
    ];

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
                ->select('id', 'code', 'label', 'type', 'group', 'display_order', 'required')
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

    public function bulkBatchQuestionOperations(Request $request, $batchId)
    {
        try {
            $batch = Batch::find($batchId);

            if (!$batch) {
                return response()->json([
                    'success' => false,
                    'error' => 'BATCH_NOT_FOUND',
                    'message' => 'Batch not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'questions' => 'required|array|min:1',
                'questions.*.question_id' => 'required|exists:questions,id',
                'questions.*.info' => 'required|in:create,update,delete',
                'questions.*.display_order' => 'nullable|integer|min:0',
                'questions.*.is_required' => 'nullable|boolean',
                'questions.*.is_active' => 'nullable|boolean',
                'questions.*.batch_specific_options' => 'nullable|array',
                'questions.*.batch_specific_validation' => 'nullable|array',
                'questions.*.batch_specific_scoring' => 'nullable|array'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            $questions = $request->input('questions');
            $results = [
                'created' => [],
                'updated' => [],
                'deleted' => [],
                'errors' => []
            ];

            DB::transaction(function () use ($batchId, $questions, &$results) {
                foreach ($questions as $index => $questionData) {
                    try {
                        $questionId = $questionData['question_id'];
                        $operation = $questionData['info'];

                        switch ($operation) {
                            case self::BULK_BQ_INFO['CREATE']:
                                $this->handleCreateOperation($batchId, $questionData, $results);
                                break;

                            case self::BULK_BQ_INFO['UPDATE']:
                                $this->handleUpdateOperation($batchId, $questionData, $results);
                                break;

                            case self::BULK_BQ_INFO['DELETE']:
                                $this->handleDeleteOperation($batchId, $questionId, $results);
                                break;
                        }
                    } catch (\Exception $e) {
                        $results['errors'][] = [
                            'index' => $index,
                            'question_id' => $questionData['question_id'] ?? null,
                            'operation' => $questionData['info'] ?? null,
                            'error' => $e->getMessage()
                        ];
                    }
                }
            });

            $totalProcessed = count($results['created']) + count($results['updated']) + count($results['deleted']);
            $hasErrors = !empty($results['errors']);

            return response()->json([
                'success' => !$hasErrors,
                'data' => [
                    'batch_id' => $batchId,
                    'total_processed' => $totalProcessed,
                    'created_count' => count($results['created']),
                    'updated_count' => count($results['updated']),
                    'deleted_count' => count($results['deleted']),
                    'error_count' => count($results['errors']),
                    'created_questions' => $results['created'],
                    'updated_questions' => $results['updated'],
                    'deleted_questions' => $results['deleted'],
                    'errors' => $results['errors']
                ],
                'message' => $hasErrors
                    ? "Bulk operation completed with {$totalProcessed} successful operations and " . count($results['errors']) . " errors"
                    : "Bulk operation completed successfully with {$totalProcessed} operations"
            ], $hasErrors ? 207 : 200); // 207 Multi-Status for partial success

        } catch (\Exception $e) {
            Log::error("Error in bulk batch question operations: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Failed to process bulk operations'
            ], 500);
        }
    }

    private function handleCreateOperation($batchId, $questionData, &$results)
    {
        $questionId = $questionData['question_id'];

        // Check if question is already assigned to this batch
        $existingAssignment = BatchQuestion::where('batch_id', $batchId)
            ->where('question_id', $questionId)
            ->first();

        if ($existingAssignment) {
            throw new \Exception("Question {$questionId} is already assigned to this batch");
        }

        // Get the next display order if not provided
        $displayOrder = $questionData['display_order'] ?? null;
        if ($displayOrder === null) {
            $maxOrder = BatchQuestion::where('batch_id', $batchId)->max('display_order');
            $displayOrder = ($maxOrder ?? 0) + 1;
        }

        $batchQuestion = BatchQuestion::create([
            'batch_id' => $batchId,
            'question_id' => $questionId,
            'display_order' => $displayOrder,
            'is_required' => $questionData['is_required'] ?? false,
            'is_active' => $questionData['is_active'] ?? true,
            'batch_specific_options' => $questionData['batch_specific_options'] ?? null,
            'batch_specific_validation' => $questionData['batch_specific_validation'] ?? null,
            'batch_specific_scoring' => $questionData['batch_specific_scoring'] ?? null
        ]);

        $batchQuestion->load('question');
        $results['created'][] = $batchQuestion;
    }

    private function handleUpdateOperation($batchId, $questionData, &$results)
    {
        $questionId = $questionData['question_id'];

        $batchQuestion = BatchQuestion::where('batch_id', $batchId)
            ->where('question_id', $questionId)
            ->first();

        if (!$batchQuestion) {
            throw new \Exception("Batch question not found for question {$questionId}");
        }

        $updateData = array_filter([
            'display_order' => $questionData['display_order'] ?? null,
            'is_required' => $questionData['is_required'] ?? null,
            'is_active' => $questionData['is_active'] ?? null,
            'batch_specific_options' => $questionData['batch_specific_options'] ?? null,
            'batch_specific_validation' => $questionData['batch_specific_validation'] ?? null,
            'batch_specific_scoring' => $questionData['batch_specific_scoring'] ?? null
        ], function ($value) {
            return $value !== null;
        });

        $batchQuestion->update($updateData);
        $batchQuestion->load('question');
        $results['updated'][] = $batchQuestion;
    }

    private function handleDeleteOperation($batchId, $questionId, &$results)
    {
        $batchQuestion = BatchQuestion::where('batch_id', $batchId)
            ->where('question_id', $questionId)
            ->first();

        if (!$batchQuestion) {
            throw new \Exception("Batch question not found for question {$questionId}");
        }

        $batchQuestion->delete();
        $results['deleted'][] = [
            'question_id' => $questionId,
            'batch_id' => $batchId
        ];
    }
}
