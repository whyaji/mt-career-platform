# Queue Worker Timeout Configuration

## Current Configuration

All queue workers are configured with a **5-minute (300 seconds)** timeout:

```bash
php artisan queue:work --max-time=300
```

This allows long-running jobs (like PDDIKTI API calls in ApplicantScreeningJob) to complete without timing out.

## Why 5 Minutes?

### Jobs That Need More Time:

-   **ApplicantScreeningJob**: Makes external API calls to PDDIKTI service
-   **GenerateScreeningApplicantsExcelJob**: Generates Excel files with large datasets
-   **Complex screening logic**: Multiple checks and validations

### Typical Job Durations:

| Job Type              | Average Time  | Maximum Time |
| --------------------- | ------------- | ------------ |
| ApplicantScreeningJob | 30-60 seconds | 2-3 minutes  |
| GenerateExcelJob      | 10-30 seconds | 1-2 minutes  |
| Simple jobs           | 1-5 seconds   | 10 seconds   |

## Shared Hosting Considerations

### ⚠️ Important Notes for Shared Hosting:

1. **Process Timeout Limits**

    - Most shared hosts allow 5-minute PHP execution
    - Some may kill processes after 2-3 minutes
    - If workers are killed, reduce timeout to 180 seconds (3 minutes)

2. **Cron Job Frequency**

    - With 5-minute timeout, workers run longer per execution
    - Consider running cron every 1-2 minutes instead of every minute
    - Reduces overlapping processes

3. **Resource Usage**
    - Longer-running processes use more resources
    - Monitor hosting resource usage
    - If host warns, reduce timeout or worker count

### Recommended Configurations by Hosting Type:

#### Standard Shared Hosting (Most Common)

```bash
--max-time=300  # 5 minutes
Cron: */1 * * * *  # Every minute
Workers: 3-5 total
```

#### Restrictive Shared Hosting (Low Limits)

```bash
--max-time=180  # 3 minutes
Cron: */1 * * * *  # Every minute
Workers: 2-3 total
```

#### VPS / Dedicated Server (No Limits)

```bash
--max-time=3600  # 1 hour (or use Supervisor instead)
Persistent workers with Supervisor
Workers: 10+ concurrent
```

## Adjusting Timeout

### To Change Timeout:

Edit these files and change `--max-time=300` to your desired value:

-   `queue-worker.sh`
-   `queue-worker-reports.sh`
-   `queue-worker-processing.sh`

### Common Values:

```bash
--max-time=60   # 1 minute (very short jobs only)
--max-time=120  # 2 minutes (short jobs)
--max-time=180  # 3 minutes (moderate jobs, restrictive hosts)
--max-time=300  # 5 minutes (current, good for most jobs)
--max-time=600  # 10 minutes (long jobs, VPS only)
```

## Timeout vs Cron Frequency

### Current Setup (5-minute timeout, 1-minute cron):

```
Minute 0:00 ──────────────────────── 5:00 ──────────────────────── 10:00
Worker 1 ────────────────────────────────┤
Worker 2 ──────────────────────────────────────┤
Worker 3 ────────────────────────────────────────────┤
```

**Issue:** Workers overlap significantly

### Recommended Adjustments:

#### Option A: Keep 5-min timeout, Reduce workers

```cron
# Only 2 workers instead of 5
* * * * * /path/to/queue-worker-reports.sh
* * * * * /path/to/queue-worker-processing.sh
```

#### Option B: Keep workers, Run cron less frequently

```cron
# Every 2 minutes instead of every minute
*/2 * * * * /path/to/queue-worker-reports.sh
*/2 * * * * sleep 60 && /path/to/queue-worker-processing.sh
```

#### Option C: Stagger starts more (Recommended)

```cron
# 5 workers with better spacing
* * * * * /path/to/queue-worker-reports.sh                    # 0s
*/2 * * * * /path/to/queue-worker-processing.sh               # 0s every 2 min
* * * * * sleep 120 && /path/to/queue-worker-reports.sh       # 120s
*/3 * * * * /path/to/queue-worker-processing.sh               # 0s every 3 min
```

## Individual Job Timeouts

You can also set per-job timeouts in your job classes:

### ApplicantScreeningJob.php

```php
class ApplicantScreeningJob implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    // Set job timeout to 5 minutes
    public $timeout = 300;

    // Set how many times to retry
    public $tries = 3;

    // Set backoff time between retries
    public $backoff = 60; // Wait 1 minute before retry
```

### Priority: Job Timeout vs Worker Timeout

**If both are set:**

1. Job timeout takes precedence
2. Worker timeout is the maximum time for the entire worker process
3. Job timeout is the maximum time for a single job

**Example:**

```php
// Job timeout: 5 minutes
public $timeout = 300;
```

```bash
# Worker timeout: 10 minutes
--max-time=600
```

Result: Job will timeout after 5 minutes, but worker can process multiple jobs up to 10 minutes total.

## Monitoring Long-Running Jobs

### Check Job Execution Time

Add to your jobs:

```php
public function handle()
{
    $startTime = microtime(true);

    try {
        // Your job logic here

    } finally {
        $executionTime = microtime(true) - $startTime;
        Log::info("Job completed in {$executionTime} seconds");
    }
}
```

### View Execution Times in Logs

```bash
grep "Job completed in" storage/logs/lumen.log | tail -20
```

## Troubleshooting

### Jobs Timing Out

**Symptoms:**

-   Jobs fail with "Maximum execution time exceeded"
-   Jobs stay in queue with increasing attempts
-   Worker logs show incomplete jobs

**Solutions:**

1. Increase timeout: `--max-time=600` (10 minutes)
2. Optimize job code (reduce API calls, use caching)
3. Break job into smaller chunks
4. Add job timeout: `public $timeout = 600;`

### Host Killing Processes

**Symptoms:**

-   Workers stop unexpectedly
-   Logs show incomplete execution
-   Host sends resource usage warnings

**Solutions:**

1. Reduce timeout: `--max-time=180` (3 minutes)
2. Reduce worker count (use 2-3 instead of 5)
3. Run cron less frequently: `*/2 * * * *`
4. Contact host about limits
5. Consider upgrading to VPS

### Workers Overlapping Too Much

**Symptoms:**

-   Multiple workers processing same jobs
-   High resource usage
-   Jobs processed slowly despite many workers

**Solutions:**

1. Stagger cron start times more (use different `sleep` values)
2. Reduce worker count
3. Reduce timeout to prevent long overlaps
4. Run cron every 2-3 minutes instead of every minute

## Best Practices

1. **Start Conservative**: Begin with shorter timeout (180s), increase if needed
2. **Monitor First Week**: Check logs daily, adjust based on actual job times
3. **Optimize Jobs**: Make jobs faster rather than increasing timeout
4. **Use Appropriate Queues**: Put long jobs in `processing`, short jobs in `reports`
5. **Set Job Timeouts**: Define `public $timeout` in job classes
6. **Test Locally**: Run jobs manually to measure actual execution time
7. **Plan for Failures**: Use retries and backoff for external API calls

## Current Configuration Summary

✅ **Timeout:** 300 seconds (5 minutes)  
✅ **Cron Frequency:** Every minute  
✅ **Workers:** 5 (2 reports, 3 processing)  
✅ **Suitable For:** Most jobs including PDDIKTI API calls  
⚠️ **Monitor:** First week for host resource warnings  
⚠️ **Adjust:** If host kills processes or warns about resources

## Questions?

-   See `SHARED-HOSTING-SETUP.md` for general setup
-   See `docs/QUEUE-SHARED-HOSTING.md` for detailed troubleshooting
-   See `docs/QUEUE-PRIORITY.md` for queue priority concepts

---

**Last Updated:** 2025-10-14  
**Timeout Setting:** 300 seconds (5 minutes)
