<?php

namespace App\Http\Controllers;

use App\Models\ApplicantData;
use App\Models\JobStatus;
use App\Jobs\ApplicantScreeningJob;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ScreeningController extends Controller
{
    /**
     * Manual trigger screening for specific applicants
     * POST /api/screening/trigger
     * Body: { "applicant_ids": ["uuid1", "uuid2", ...] }
     */
    public function triggerScreening(Request $request)
    {
        try {
            // Validate request data
            $validator = Validator::make($request->all(), [
                'applicant_ids' => 'required|array|min:1',
                'applicant_ids.*' => 'required|uuid|exists:applicant_data,id'
            ], [
                'applicant_ids.required' => 'Applicant IDs are required',
                'applicant_ids.array' => 'Applicant IDs must be an array',
                'applicant_ids.min' => 'At least one applicant ID is required',
                'applicant_ids.*.required' => 'Each applicant ID is required',
                'applicant_ids.*.uuid' => 'Each applicant ID must be a valid UUID',
                'applicant_ids.*.exists' => 'One or more applicant IDs do not exist'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $applicantIds = $request->input('applicant_ids');
            $triggeredCount = 0;
            $errors = [];

            // Process each applicant ID
            foreach ($applicantIds as $applicantId) {
                try {
                    // Check if applicant exists
                    $applicant = ApplicantData::find($applicantId);
                    if (!$applicant) {
                        $errors[] = "Applicant with ID {$applicantId} not found";
                        continue;
                    }

                    // Reset screening status to pending before triggering
                    $applicant->update([
                        'screening_status' => 1, // 1: pending
                        'screening_remark' => 'Manual screening triggered'
                    ]);

                    // Dispatch screening job
                    dispatch(new ApplicantScreeningJob($applicantId));
                    $triggeredCount++;

                    Log::info("Manual screening triggered for applicant ID: {$applicantId}");
                } catch (\Exception $e) {
                    $errorMessage = "Failed to trigger screening for applicant ID {$applicantId}: " . $e->getMessage();
                    $errors[] = $errorMessage;
                    Log::error($errorMessage);
                }
            }

            $response = [
                'success' => true,
                'message' => "Screening triggered for {$triggeredCount} applicant(s)",
                'data' => [
                    'triggered_count' => $triggeredCount,
                    'total_requested' => count($applicantIds),
                    'errors' => $errors
                ]
            ];

            // If there were errors but some succeeded, return partial success
            if (!empty($errors) && $triggeredCount > 0) {
                $response['message'] = "Screening triggered for {$triggeredCount} applicant(s) with some errors";
                return response()->json($response, 207); // 207 Multi-Status
            }

            // If all failed
            if ($triggeredCount === 0) {
                return response()->json([
                    'success' => false,
                    'error' => 'SCREENING_TRIGGER_FAILED',
                    'message' => 'Failed to trigger screening for any applicants',
                    'errors' => $errors
                ], 400);
            }

            return response()->json($response, 200);
        } catch (\Exception $e) {
            Log::error("Error in manual screening trigger: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Internal server error',
                'error_message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Trigger rescreening for all applicants in a batch
     * POST /api/screening/rescreen-all-by-batch/{batchId}
     * Optional body: { "status_filter": [1,2,3,4,5] }
     */
    public function rescreenAllByBatch(Request $request, $batchId)
    {
        try {
            // Validate batch exists
            $batch = \App\Models\Batch::find($batchId);
            if (!$batch) {
                return response()->json([
                    'success' => false,
                    'error' => 'BATCH_NOT_FOUND',
                    'message' => 'Batch not found'
                ], 404);
            }

            // Validate optional filters
            $validator = Validator::make($request->all(), [
                'status_filter' => 'nullable|array',
                'status_filter.*' => 'integer|in:1,2,3,4,5'
            ], [
                'status_filter.array' => 'Status filter must be an array',
                'status_filter.*.integer' => 'Each status filter must be an integer',
                'status_filter.*.in' => 'Each status filter must be 1, 2, 3, 4, or 5'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $statusFilter = $request->input('status_filter');

            // Build query - filter by batch
            $query = ApplicantData::where('batch_id', $batchId);

            // Filter by status if provided
            if ($statusFilter) {
                $query->whereIn('screening_status', $statusFilter);
            }

            // Get applicants to rescreen
            $applicants = $query->get();

            if ($applicants->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'error' => 'NO_APPLICANTS_FOUND',
                    'message' => 'No applicants found matching the criteria'
                ], 404);
            }

            $triggeredCount = 0;
            $errors = [];

            // Process each applicant
            foreach ($applicants as $applicant) {
                try {
                    // Reset screening status to pending before triggering
                    $applicant->update([
                        'screening_status' => 1, // 1: pending
                        'screening_remark' => 'Rescreening triggered for batch'
                    ]);

                    // Dispatch screening job
                    dispatch(new ApplicantScreeningJob($applicant->id));
                    $triggeredCount++;
                } catch (\Exception $e) {
                    $errorMessage = "Failed to trigger rescreening for applicant ID {$applicant->id}: " . $e->getMessage();
                    $errors[] = $errorMessage;
                    Log::error($errorMessage);
                }
            }

            Log::info("Rescreening triggered for {$triggeredCount} applicants in batch {$batchId}");

            $response = [
                'success' => true,
                'message' => "Rescreening triggered for {$triggeredCount} applicant(s)",
                'data' => [
                    'triggered_count' => $triggeredCount,
                    'total_found' => $applicants->count(),
                    'batch_id' => $batchId,
                    'filters' => [
                        'status_filter' => $statusFilter
                    ],
                    'errors' => $errors
                ]
            ];

            // If there were errors but some succeeded, return partial success
            if (!empty($errors) && $triggeredCount > 0) {
                $response['message'] = "Rescreening triggered for {$triggeredCount} applicant(s) with some errors";
                return response()->json($response, 207); // 207 Multi-Status
            }

            // If all failed
            if ($triggeredCount === 0) {
                return response()->json([
                    'success' => false,
                    'error' => 'RESCREENING_TRIGGER_FAILED',
                    'message' => 'Failed to trigger rescreening for any applicants',
                    'errors' => $errors
                ], 400);
            }

            return response()->json($response, 200);
        } catch (\Exception $e) {
            Log::error("Error in rescreen all by batch: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Internal server error',
                'error_message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get screening statistics
     * GET /api/screening/stats
     * Optional query: ?batch_id=uuid
     */
    public function getScreeningStats(Request $request)
    {
        try {
            $batchId = $request->query('batch_id');

            // Build query
            $query = ApplicantData::query();
            if ($batchId) {
                $query->where('batch_id', $batchId);
            }

            // Get statistics
            $total = $query->count();
            $pending = $query->where('screening_status', 1)->count();
            $stopped = $query->where('screening_status', 2)->count();
            $notYet = $query->where('screening_status', 3)->count();
            $processing = $query->where('screening_status', 4)->count();
            $done = $query->where('screening_status', 5)->count();

            $stats = [
                'total_applicants' => $total,
                'screening_status' => [
                    'pending' => $pending,
                    'stopped' => $stopped,
                    'not_yet' => $notYet,
                    'processing' => $processing,
                    'done' => $done
                ],
                'completion_rate' => $total > 0 ? round(($done / $total) * 100, 2) : 0,
                'filters' => [
                    'batch_id' => $batchId
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error("Error getting screening stats: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get job status by job ID
     * GET /api/screening/job-status/{jobId}
     */
    public function getJobStatus(Request $request, string $jobId)
    {
        try {
            $jobStatus = JobStatus::getByJobId($jobId);

            if (!$jobStatus) {
                return response()->json([
                    'success' => false,
                    'error' => 'JOB_NOT_FOUND',
                    'message' => 'Job not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'job_id' => $jobStatus->job_id,
                    'job_type' => $jobStatus->job_type,
                    'status' => $jobStatus->status,
                    'progress' => $jobStatus->progress,
                    'message' => $jobStatus->message,
                    'data' => $jobStatus->data,
                    'started_at' => $jobStatus->started_at,
                    'completed_at' => $jobStatus->completed_at,
                    'failed_at' => $jobStatus->failed_at,
                    'duration' => $jobStatus->duration,
                    'created_at' => $jobStatus->created_at,
                    'updated_at' => $jobStatus->updated_at
                ]
            ]);
        } catch (\Exception $e) {
            Log::error("Error getting job status: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get all job statuses with filtering
     * GET /api/screening/job-statuses
     * Query: ?job_type=screening&status=running&limit=10&offset=0
     */
    public function getJobStatuses(Request $request)
    {
        try {
            // Validate query parameters
            $validator = Validator::make($request->all(), [
                'job_type' => 'nullable|string|in:screening,excel_generation',
                'status' => 'nullable|string|in:pending,running,completed,failed,cancelled',
                'limit' => 'nullable|integer|min:1|max:100',
                'offset' => 'nullable|integer|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $jobType = $request->query('job_type');
            $status = $request->query('status');
            $limit = $request->query('limit', 20);
            $offset = $request->query('offset', 0);

            // Build query
            $query = JobStatus::query();

            if ($jobType) {
                $query->where('job_type', $jobType);
            }

            if ($status) {
                $query->where('status', $status);
            }

            // Get total count
            $total = $query->count();

            // Get paginated results
            $jobStatuses = $query->orderBy('created_at', 'desc')
                ->offset($offset)
                ->limit($limit)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'job_statuses' => $jobStatuses->map(function ($jobStatus) {
                        return [
                            'job_id' => $jobStatus->job_id,
                            'job_type' => $jobStatus->job_type,
                            'status' => $jobStatus->status,
                            'progress' => $jobStatus->progress,
                            'message' => $jobStatus->message,
                            'data' => $jobStatus->data,
                            'started_at' => $jobStatus->started_at,
                            'completed_at' => $jobStatus->completed_at,
                            'failed_at' => $jobStatus->failed_at,
                            'duration' => $jobStatus->duration,
                            'created_at' => $jobStatus->created_at,
                            'updated_at' => $jobStatus->updated_at
                        ];
                    }),
                    'pagination' => [
                        'total' => $total,
                        'limit' => $limit,
                        'offset' => $offset,
                        'has_more' => ($offset + $limit) < $total
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error("Error getting job statuses: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get job status statistics
     * GET /api/screening/job-stats
     * Query: ?job_type=screening&days=7
     */
    public function getJobStats(Request $request)
    {
        try {
            // Validate query parameters
            $validator = Validator::make($request->all(), [
                'job_type' => 'nullable|string|in:screening,excel_generation',
                'days' => 'nullable|integer|min:1|max:365'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'VALIDATION_ERROR',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $jobType = $request->query('job_type');
            $days = $request->query('days', 7);

            // Build query
            $query = JobStatus::query();

            if ($jobType) {
                $query->where('job_type', $jobType);
            }

            // Filter by date range
            $query->where('created_at', '>=', Carbon::now()->subDays($days));

            // Get statistics
            $total = $query->count();
            $pending = $query->where('status', JobStatus::STATUS_PENDING)->count();
            $running = $query->where('status', JobStatus::STATUS_RUNNING)->count();
            $completed = $query->where('status', JobStatus::STATUS_COMPLETED)->count();
            $failed = $query->where('status', JobStatus::STATUS_FAILED)->count();
            $cancelled = $query->where('status', JobStatus::STATUS_CANCELLED)->count();

            // Calculate success rate
            $successRate = ($completed + $failed + $cancelled) > 0
                ? round(($completed / ($completed + $failed + $cancelled)) * 100, 2)
                : 0;

            // Get average duration for completed jobs
            $avgDuration = $query->where('status', JobStatus::STATUS_COMPLETED)
                ->whereNotNull('duration')
                ->avg('duration');

            $stats = [
                'period_days' => $days,
                'job_type' => $jobType,
                'total_jobs' => $total,
                'status_breakdown' => [
                    'pending' => $pending,
                    'running' => $running,
                    'completed' => $completed,
                    'failed' => $failed,
                    'cancelled' => $cancelled
                ],
                'success_rate' => $successRate,
                'average_duration_seconds' => $avgDuration ? round($avgDuration, 2) : null
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error("Error getting job stats: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'error' => 'INTERNAL_SERVER_ERROR',
                'message' => 'Internal server error'
            ], 500);
        }
    }
}
