<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class QueueController extends Controller
{
    /**
     * Process one job from the queue
     * GET /api/queue/process
     */
    public function processQueue(Request $request)
    {
        try {
            // Check if there are jobs in the queue
            $exitCode = Artisan::call('queue:work', [
                '--once' => true,
                '--tries' => 3,
                '--timeout' => 300
            ]);

            $output = Artisan::output();

            Log::info("Queue processed via web endpoint. Exit code: {$exitCode}");

            return response()->json([
                'success' => true,
                'message' => 'Queue processed successfully',
                'output' => $output,
                'exit_code' => $exitCode
            ]);
        } catch (\Exception $e) {
            Log::error("Queue processing failed: {$e->getMessage()}");

            return response()->json([
                'success' => false,
                'error' => 'QUEUE_PROCESSING_FAILED',
                'message' => 'Failed to process queue',
                'error_message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check queue status
     * GET /api/queue/status
     */
    public function getQueueStatus(Request $request)
    {
        try {
            // Get pending jobs count
            $pendingJobs = DB::table('jobs')->count();
            $failedJobs = DB::table('failed_jobs')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'pending_jobs' => $pendingJobs,
                    'failed_jobs' => $failedJobs,
                    'queue_driver' => config('queue.default'),
                    'last_processed' => Carbon::now()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'QUEUE_STATUS_FAILED',
                'message' => 'Failed to get queue status'
            ], 500);
        }
    }
}
