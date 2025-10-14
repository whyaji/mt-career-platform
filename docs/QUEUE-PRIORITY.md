# Queue Priority Configuration

This document explains how to configure and run queue workers with priority in the MT Career Platform.

## Overview

The application uses Laravel's queue system with **descriptive priority-based queue names**:

-   **Reports Queue**: `reports` - High priority, user-facing operations (file generation, exports)
-   **Processing Queue**: `processing` - Background operations (screening, data processing)

### Why This Approach?

This hybrid naming strategy provides:

-   ✅ **Clear Priority Hierarchy**: Workers know which queue to process first
-   ✅ **Descriptive Names**: Queue names indicate job purpose and category
-   ✅ **Scalability**: Easy to add new jobs to existing queues
-   ✅ **Easy Management**: Simple worker configuration
-   ✅ **Future-Ready**: Can add similar job types without configuration changes

## Job Queue Assignments

### Reports Queue (High Priority)

-   `GenerateScreeningApplicantsExcelJob` - Excel file generation for screening applicants
-   Future: Report generation jobs
-   Future: User-facing file exports
-   Future: PDF generation jobs

**Characteristics:**

-   User-initiated and waiting for results
-   Quick execution required
-   Direct impact on user experience

### Processing Queue (Standard Priority)

-   `ApplicantScreeningJob` - Applicant screening process
-   Future: Batch data processing jobs
-   Future: Background operations
-   Future: Data synchronization tasks

**Characteristics:**

-   Background operations
-   Can run asynchronously
-   Users don't wait for completion

## Running Queue Workers

### Option 1: Single Worker with Multiple Queues (Recommended)

Run a single worker that processes high-priority jobs first, then standard priority jobs:

```bash
php artisan queue:work --queue=reports,processing
```

This will:

1. Check the `reports` queue first
2. Process all jobs in `reports` queue
3. Only when `reports` is empty, process `processing` queue
4. Repeat the cycle

### Option 2: Multiple Workers

Run separate workers for each queue:

**Terminal 1 - Reports Queue Worker:**

```bash
php artisan queue:work --queue=reports
```

**Terminal 2 - Processing Queue Worker:**

```bash
php artisan queue:work --queue=processing
```

### Option 3: Supervisor Configuration (Production Recommended)

For production environments, use Supervisor to manage queue workers:

Create `/etc/supervisor/conf.d/mt-career-queue.conf`:

```ini
; Reports Queue Worker (High Priority)
[program:mt-career-queue-reports]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan queue:work --queue=reports --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/mt-career-queue-reports.log
stopwaitsecs=3600

; Processing Queue Worker (Standard Priority)
[program:mt-career-queue-processing]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan queue:work --queue=processing --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/log/mt-career-queue-processing.log
stopwaitsecs=3600
```

Then reload Supervisor:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start mt-career-queue-reports:*
sudo supervisorctl start mt-career-queue-processing:*
```

## Development

For local development, use the simple command:

```bash
php artisan queue:work --queue=reports,processing --tries=3
```

Or use the daemon mode (auto-reloads on code changes):

```bash
php artisan queue:listen --queue=reports,processing
```

## Monitoring Queue

### Check Failed Jobs

```bash
php artisan queue:failed
```

### Retry Failed Jobs

```bash
# Retry all failed jobs
php artisan queue:retry all

# Retry specific failed job
php artisan queue:retry {job-id}
```

### Clear Failed Jobs

```bash
php artisan queue:flush
```

### Monitor Queue in Real-time

```bash
# Check database jobs table
php artisan tinker
>>> DB::table('jobs')->where('queue', 'reports')->count()
>>> DB::table('jobs')->where('queue', 'processing')->count()
```

## How Priority Works

When running `--queue=reports,processing`:

1. Worker checks `reports` queue
2. If jobs exist in `reports`, processes them immediately
3. Only when `reports` is empty, worker processes `processing` queue
4. If new jobs arrive in `reports` while processing `processing`, worker finishes current job then switches to `reports`

**This ensures that:**

-   📊 Excel generation jobs (user-facing) are processed immediately
-   🔄 Screening jobs (background) don't delay report generation
-   ✅ All jobs eventually get processed
-   🚀 Better user experience for time-sensitive operations

## Queue Configuration

The queue connection is configured in your `.env` file:

```env
QUEUE_CONNECTION=database
# For better performance, consider using Redis in production:
# QUEUE_CONNECTION=redis
```

Make sure the `jobs` table is created by running:

```bash
php artisan migrate
```

## Testing Queue Priority

To test the priority system:

**Step 1:** Start the queue worker

```bash
php artisan queue:work --queue=reports,processing --verbose
```

**Step 2:** Dispatch a screening job (lower priority)

```php
// Via API or command
dispatch(new ApplicantScreeningJob($applicantId));
```

**Step 3:** Immediately dispatch an Excel generation job (high priority)

```php
// Via API - Generate Excel endpoint
dispatch(new GenerateScreeningApplicantsExcelJob($batchId, $fileId));
```

**Step 4:** Observe the output

-   Excel generation should complete before screening job (if screening hasn't started)
-   Or Excel starts immediately after current screening job finishes

## Adding New Jobs

### To Add a High-Priority Job (User-Facing)

```php
class GenerateReportJob implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    public function __construct($data)
    {
        $this->data = $data;

        // Assign to reports queue (high priority)
        $this->onQueue('reports');
    }

    public function handle()
    {
        // Job logic here
    }
}
```

### To Add a Background Job

```php
class DataSyncJob implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    public function __construct($data)
    {
        $this->data = $data;

        // Assign to processing queue (standard priority)
        $this->onQueue('processing');
    }

    public function handle()
    {
        // Job logic here
    }
}
```

No worker configuration changes needed! ✨

## Performance Tips

### For Development

-   Use single worker: `php artisan queue:work --queue=reports,processing`
-   Monitor with `--verbose` flag to see job execution

### For Production

-   Use **Supervisor** for automatic restart and management
-   Allocate **fewer workers** to `reports` (2 workers) - these jobs are quick
-   Allocate **more workers** to `processing` (4+ workers) - these jobs are longer
-   Consider **Redis** instead of database for better performance
-   Monitor queue length regularly
-   Set up alerts for failed jobs

### Scaling Guidelines

| Queue        | Workers | Reason                                  |
| ------------ | ------- | --------------------------------------- |
| `reports`    | 2       | Quick jobs, user-waiting, less frequent |
| `processing` | 4-8     | Longer jobs, background, more frequent  |

## Alternative Queue Names (Optional)

If you prefer different naming conventions, consider:

**By Priority Level:**

-   `high`, `default`, `low`

**By User Impact:**

-   `user-facing`, `background`

**By Job Type:**

-   `generateExcel`, `applicantScreening` (not recommended - less scalable)

**Current Choice (Recommended):**

-   `reports`, `processing` - Descriptive + Scalable ✅

## Troubleshooting

### Jobs Not Processing

```bash
# Check if queue worker is running
ps aux | grep queue:work

# Check jobs table
php artisan tinker
>>> DB::table('jobs')->get()
```

### Jobs Failing

```bash
# Check failed jobs
php artisan queue:failed

# View logs
tail -f storage/logs/lumen.log
```

### Wrong Priority

```bash
# Check which queue a job is in
php artisan tinker
>>> DB::table('jobs')->select('queue', 'payload')->get()
```

## Notes

-   Each queue worker processes **one job at a time** sequentially
-   Use multiple workers (`numprocs`) to increase **concurrent** job processing
-   High priority queue workers should have **fewer processes** than standard priority (they're faster)
-   Monitor queue length regularly in production to prevent backlog
-   Consider using **Redis** (`QUEUE_CONNECTION=redis`) for better performance with high job volumes
-   Failed jobs are stored in `failed_jobs` table for retry/analysis
-   Use `--timeout=60` to set maximum execution time for jobs
