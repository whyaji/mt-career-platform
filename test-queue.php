<?php

/**
 * Test Queue Job Dispatcher for Lumen
 *
 * This script dispatches a test job to verify queue is working
 * Run: php test-queue.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';

echo "\n";
echo "╔════════════════════════════════════════════╗\n";
echo "║           QUEUE TEST DISPATCHER            ║\n";
echo "╚════════════════════════════════════════════╝\n";
echo "\n";

// You can change this to test different jobs
$testApplicantId = 1; // Change to a valid applicant ID

echo "📤 Dispatching test job...\n";
echo "   Job: ApplicantScreeningJob\n";
echo "   Applicant ID: {$testApplicantId}\n";
echo "   Queue: processing\n";
echo "\n";

try {
    // Dispatch the job
    dispatch(new \App\Jobs\ApplicantScreeningJob($testApplicantId));

    echo "✅ Test job dispatched successfully!\n";
    echo "\n";
    echo "Next steps:\n";
    echo "  1. Check queue status: php check-queue.php\n";
    echo "  2. View worker logs: tail -f storage/logs/queue-processing.log\n";
    echo "  3. Process manually: php artisan queue:work --once\n";
    echo "\n";
    echo "💡 The job should be processed within 60 seconds by cron workers.\n";
} catch (\Exception $e) {
    echo "❌ Error dispatching job: " . $e->getMessage() . "\n";
    echo "\n";
    echo "Make sure:\n";
    echo "  - Database connection is working\n";
    echo "  - 'jobs' table exists\n";
    echo "  - Applicant ID {$testApplicantId} exists (or change it in this script)\n";
    echo "\n";
}

echo "\n";
