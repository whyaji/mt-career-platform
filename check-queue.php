<?php

/**
 * Simple Queue Status Checker for Lumen
 *
 * This script checks the current status of all queues
 * Run: php check-queue.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';
$db = $app->make('db');

echo "\n";
echo "╔════════════════════════════════════════════╗\n";
echo "║         QUEUE STATUS - " . date('H:i:s') . "          ║\n";
echo "╚════════════════════════════════════════════╝\n";
echo "\n";

try {
    // Get counts
    $reportsCount = $db->table('jobs')->where('queue', 'reports')->count();
    $processingCount = $db->table('jobs')->where('queue', 'processing')->count();
    $totalPending = $db->table('jobs')->count();
    $failedCount = $db->table('failed_jobs')->count();

    // Display status
    echo "📊 Pending Jobs:\n";
    echo "   Reports Queue:    " . str_pad($reportsCount, 5, ' ', STR_PAD_LEFT) . " jobs\n";
    echo "   Processing Queue: " . str_pad($processingCount, 5, ' ', STR_PAD_LEFT) . " jobs\n";
    echo "   ─────────────────────────────\n";
    echo "   Total:            " . str_pad($totalPending, 5, ' ', STR_PAD_LEFT) . " jobs\n";
    echo "\n";
    echo "❌ Failed Jobs:       " . str_pad($failedCount, 5, ' ', STR_PAD_LEFT) . " jobs\n";
    echo "\n";

    // Status indicators
    if ($totalPending === 0 && $failedCount === 0) {
        echo "✅ All clear! No pending or failed jobs.\n";
    } else {
        // Warnings
        if ($reportsCount > 50) {
            echo "⚠️  WARNING: Reports queue is backed up! (" . $reportsCount . " jobs)\n";
        }

        if ($processingCount > 200) {
            echo "⚠️  WARNING: Processing queue is backed up! (" . $processingCount . " jobs)\n";
        }

        if ($failedCount > 10) {
            echo "❌ ERROR: Too many failed jobs! (" . $failedCount . " jobs)\n";
            echo "   Run: php artisan queue:failed\n";
        } elseif ($failedCount > 0) {
            echo "⚠️  " . $failedCount . " failed job(s) need attention.\n";
        }
    }

    echo "\n";

    // Recent activity (last 5 jobs)
    $recentJobs = $db->table('jobs')
        ->select('queue', 'attempts', 'created_at')
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get();

    if (count($recentJobs) > 0) {
        echo "📋 Recent Jobs:\n";
        foreach ($recentJobs as $job) {
            $createdAt = date('H:i:s', $job->created_at);
            echo "   [{$createdAt}] {$job->queue} queue (attempt: {$job->attempts})\n";
        }
        echo "\n";
    }

    // Next steps
    if ($totalPending > 0) {
        echo "💡 Tip: Make sure queue workers are running!\n";
        echo "   Check logs: tail -f storage/logs/queue-*.log\n";
    }
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "\n";
    echo "Make sure:\n";
    echo "  - Database is configured correctly\n";
    echo "  - 'jobs' table exists (run migrations)\n";
    echo "\n";
}

echo "\n";
