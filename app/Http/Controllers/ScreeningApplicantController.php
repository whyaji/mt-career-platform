<?php

namespace App\Http\Controllers;

use App\Models\ScreeningApplicant;
use App\Models\Batch;
use App\Traits\PaginationTrait;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ScreeningApplicantController extends Controller
{
    use PaginationTrait;

    public function __construct()
    {
        $this->middleware('jwt.auth');
    }

    /**
     * Get all screening applicants with pagination and search
     */
    public function getScreeningApplicants(Request $request)
    {
        try {
            // Get pagination parameters
            $paginationParams = $this->getPaginationParams($request);

            // Define searchable fields
            $searchableFields = ['batch_id', 'status', 'ip_address', 'user_agent'];

            // Build query
            $query = ScreeningApplicant::select(
                'id',
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
                'created_at',
                'updated_at'
            )->with('batch:id,number,number_code,location,location_code,year');

            // Apply pagination with search
            $result = $this->paginateQuery($query, $paginationParams, $searchableFields);

            return $this->paginatedResponse($result, 'Screening applicants retrieved successfully');
        } catch (\Exception $e) {
            Log::error("Error getting all screening applicants: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Error getting all screening applicants'
            ], 500);
        }
    }

    /**
     * Get screening applicant by ID
     */
    public function getScreeningApplicantById($id)
    {
        try {
            $screeningApplicant = ScreeningApplicant::with([
                'batch:id,number,number_code,location,location_code,year,institutes,program_category_id',
                'batch.programCategory:id,code,name,description'
            ])->find($id);

            if (!$screeningApplicant) {
                return response()->json([
                    'success' => false,
                    'error' => 'SCREENING_APPLICANT_NOT_FOUND',
                    'message' => 'Error getting screening applicant by ID'
                ], 404);
            }

            // Add marking_by_name to marking history
            if ($screeningApplicant->marking && is_array($screeningApplicant->marking)) {
                $markingHistory = collect($screeningApplicant->marking)->map(function ($marking) {
                    if (isset($marking['marking_by'])) {
                        $user = \App\Models\User::find($marking['marking_by']);
                        $marking['marking_by_name'] = $user ? $user->name : 'Unknown User';
                    }
                    return $marking;
                })->toArray();

                $screeningApplicant->marking = $markingHistory;
            }

            return response()->json([
                'success' => true,
                'message' => 'Screening applicant retrieved successfully',
                'data' => $screeningApplicant
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting screening applicant by ID: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'message' => 'Error getting screening applicant by ID',
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    /**
     * Create a new screening applicant
     */
    public function createScreeningApplicant(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'batch_id' => 'required|uuid|exists:batch,id',
                'answers' => 'required|array',
                'answers.*.question_id' => 'required|string',
                'answers.*.answer' => 'required',
                'scoring' => 'nullable|array',
                'scoring.*.question_id' => 'required|string',
                'scoring.*.score' => 'required|integer|min:0',
                'total_score' => 'nullable|integer|min:0',
                'max_score' => 'nullable|integer|min:0',
                'marking' => 'nullable|array',
                'total_marking' => 'nullable|integer|min:0',
                'ai_scoring' => 'nullable|array',
                'total_ai_scoring' => 'nullable|integer|min:0',
                'status' => 'required|integer|in:0,1,2,3',
                'user_agent' => 'nullable|string|max:500',
                'ip_address' => 'nullable|ip'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => 'Error creating screening applicant',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            // Verify batch exists and is active
            $batch = Batch::find($request->batch_id);
            if (!$batch) {
                return response()->json([
                    'success' => false,
                    'error' => 'BATCH_NOT_FOUND',
                    'message' => 'Error creating screening applicant'
                ], 404);
            }

            $screeningApplicant = ScreeningApplicant::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $screeningApplicant->load('batch:id,number,number_code,location,location_code,year'),
                'message' => 'Screening applicant created successfully'
            ], 201);
        } catch (\Exception $e) {
            Log::error("Error creating screening applicant: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Error creating screening applicant'
            ], 500);
        }
    }

    /**
     * Update screening applicant
     */
    public function updateScreeningApplicant(Request $request, $id)
    {
        try {
            $screeningApplicant = ScreeningApplicant::find($id);

            if (!$screeningApplicant) {
                return response()->json([
                    'success' => false,
                    'error' => 'SCREENING_APPLICANT_NOT_FOUND',
                    'message' => 'Error updating screening applicant'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'batch_id' => 'sometimes|required|uuid|exists:batch,id',
                'answers' => 'sometimes|required|array',
                'answers.*.question_id' => 'required|string',
                'answers.*.answer' => 'required',
                'scoring' => 'nullable|array',
                'scoring.*.question_id' => 'required|string',
                'scoring.*.score' => 'required|integer|min:0',
                'total_score' => 'nullable|integer|min:0',
                'max_score' => 'nullable|integer|min:0',
                'marking' => 'nullable|array',
                'total_marking' => 'nullable|integer|min:0',
                'ai_scoring' => 'nullable|array',
                'total_ai_scoring' => 'nullable|integer|min:0',
                'status' => 'sometimes|required|integer|in:0,1,2,3',
                'user_agent' => 'nullable|string|max:500',
                'ip_address' => 'nullable|ip'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            // Verify batch exists if batch_id is being updated
            if ($request->has('batch_id')) {
                $batch = Batch::find($request->batch_id);
                if (!$batch) {
                    return response()->json([
                        'success' => false,
                        'error' => 'BATCH_NOT_FOUND'
                    ], 404);
                }
            }

            $screeningApplicant->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $screeningApplicant->load('batch:id,number,number_code,location,location_code,year'),
                'message' => 'Screening applicant updated successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error updating screening applicant: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Error updating screening applicant'
            ], 500);
        }
    }

    /**
     * Delete screening applicant
     */
    public function deleteScreeningApplicant($id)
    {
        try {
            $screeningApplicant = ScreeningApplicant::with('batch:id,number,number_code,location,location_code,year')->find($id);

            if (!$screeningApplicant) {
                return response()->json([
                    'success' => false,
                    'error' => 'SCREENING_APPLICANT_NOT_FOUND'
                ], 404);
            }

            $screeningApplicant->delete();

            return response()->json([
                'success' => true,
                'message' => 'Screening applicant deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error deleting screening applicant: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    /**
     * Get screening applicants by batch ID
     */
    public function getScreeningApplicantsByBatch(Request $request, $batchId)
    {
        try {
            // Verify batch exists
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
            $searchableFields = ['status', 'ip_address', 'user_agent'];

            // Build query
            $query = ScreeningApplicant::where('batch_id', $batchId)
                ->select(
                    'id',
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
                    'created_at',
                    'updated_at'
                );

            // Apply pagination with search
            $result = $this->paginateQuery($query, $paginationParams, $searchableFields);

            return $this->paginatedResponse($result, 'Screening applicants for batch retrieved successfully');
        } catch (\Exception $e) {
            Log::error("Error getting screening applicants by batch: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    /**
     * Get screening applicants by status
     */
    public function getScreeningApplicantsByStatus(Request $request, $status)
    {
        try {
            // Validate status
            if (!in_array($status, [0, 1, 2, 3])) {
                return response()->json([
                    'success' => false,
                    'error' => 'INVALID_STATUS',
                    'message' => 'Status must be 0 (Pending), 1 (Scored), 2 (Approved), or 3 (Rejected)'
                ], 400);
            }

            // Get pagination parameters
            $paginationParams = $this->getPaginationParams($request);

            // Define searchable fields
            $searchableFields = ['batch_id', 'ip_address', 'user_agent'];

            // Build query
            $query = ScreeningApplicant::where('status', $status)
                ->select(
                    'id',
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
                    'created_at',
                    'updated_at'
                )->with('batch:id,number,number_code,location,location_code,year');

            // Apply pagination with search
            $result = $this->paginateQuery($query, $paginationParams, $searchableFields);

            return $this->paginatedResponse($result, 'Screening applicants by status retrieved successfully');
        } catch (\Exception $e) {
            Log::error("Error getting screening applicants by status: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR'
            ], 500);
        }
    }

    /**
     * Update screening applicant status
     */
    public function updateScreeningApplicantStatus(Request $request, $id)
    {
        try {
            $screeningApplicant = ScreeningApplicant::find($id);

            if (!$screeningApplicant) {
                return response()->json([
                    'success' => false,
                    'error' => 'SCREENING_APPLICANT_NOT_FOUND'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'status' => 'required|integer|in:0,1,2,3'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => $validator->errors()->first()
                ], 400);
            }

            $screeningApplicant->update(['status' => $request->status]);

            return response()->json([
                'success' => true,
                'data' => $screeningApplicant->load('batch:id,number,number_code,location,location_code,year'),
                'message' => 'Screening applicant status updated successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error updating screening applicant status: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Error updating screening applicant status'
            ], 500);
        }
    }

    /**
     * Get screening applicant statistics
     */
    public function getScreeningApplicantStats()
    {
        try {
            $stats = [
                'total_applicants' => ScreeningApplicant::count(),
                'pending_applicants' => ScreeningApplicant::pending()->count(),
                'scored_applicants' => ScreeningApplicant::scored()->count(),
                'approved_applicants' => ScreeningApplicant::approved()->count(),
                'rejected_applicants' => ScreeningApplicant::rejected()->count(),
                'average_score' => ScreeningApplicant::whereNotNull('total_score')->avg('total_score'),
                'average_marking' => ScreeningApplicant::whereNotNull('total_marking')->avg('total_marking'),
                'average_ai_scoring' => ScreeningApplicant::whereNotNull('total_ai_scoring')->avg('total_ai_scoring'),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Screening applicant statistics retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error getting screening applicant statistics: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Error getting screening applicant statistics'
            ], 500);
        }
    }

    public function markingScreeningApplicant(Request $request, $id)
    {
        try {
            $screeningApplicant = ScreeningApplicant::find($id);

            if (!$screeningApplicant) {
                return response()->json([
                    'success' => false,
                    'error' => 'NOT_FOUND',
                    'message' => 'Screening applicant not found'
                ], 404);
            }

            // Validate the incoming request
            $validator = Validator::make($request->all(), [
                'marking' => 'required|array',
                'marking.*.question_id' => 'required|string',
                'marking.*.marking_score' => 'required|numeric|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();

            // Get user id from JWT payload
            $userId = auth()->id(); // or $request->user()->id

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'error' => 'UNAUTHORIZED',
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Get existing marking history or initialize as empty array
            $markingHistory = $screeningApplicant->marking ?? [];
            $currentScoring = $screeningApplicant->scoring ?? [];

            // Create new marking entry
            $newMarking = [
                'marking_by' => $userId,
                'marking_at' => Carbon::now()->format('Y-m-d H:i:s'),
                'marking' => collect($validated['marking'])->map(function ($item) use ($currentScoring) {
                    return [
                        'question_id' => $item['question_id'],
                        'marking_score' => $item['marking_score'],
                        'from_score' => collect($currentScoring)->first(function ($scoring) use ($item) {
                            return $scoring['question_id'] === $item['question_id'];
                        })['score']
                    ];
                })->toArray()
            ];

            // Push new marking to the array
            $markingHistory[] = $newMarking;

            // Update the screening applicant
            $screeningApplicant->marking = $markingHistory;

            // get set of list list marking with unique question code last marking
            $listMarkedScore = [];
            foreach ($markingHistory as $marking) {
                foreach ($marking['marking'] as $question) {
                    // override if question code already exists
                    $listMarkedScore[$question['question_id']] = $question['marking_score'];
                }
            }

            // update scoring
            $totalMarking = 0;
            foreach ($currentScoring as &$scoring) {
                if (isset($listMarkedScore[$scoring['question_id']])) {
                    $totalMarking += $listMarkedScore[$scoring['question_id']] - $scoring['score'];
                    $scoring['score'] = $listMarkedScore[$scoring['question_id']] ?? $scoring['score'];
                }
            }
            $screeningApplicant->total_marking = ($screeningApplicant->total_marking ?? 0) + $totalMarking;

            $screeningApplicant->scoring = $currentScoring;

            // get total score from scoring
            $totalScore = array_sum(array_column($currentScoring, 'score'));
            $screeningApplicant->total_score = $totalScore;


            $screeningApplicant->save();

            return response()->json([
                'success' => true,
                'message' => 'Screening applicant marked successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error marking screening applicant: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Error marking screening applicant'
            ], 500);
        }
    }
}
