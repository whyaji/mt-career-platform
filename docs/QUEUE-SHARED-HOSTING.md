# Queue Workers on Shared Hosting

This guide explains how to run Laravel queue workers on shared hosting environments where you don't have access to Supervisor, systemd, or persistent SSH sessions.

## 🚨 Shared Hosting Limitations

Shared hosting typically has these restrictions:

-   ❌ No Supervisor or process managers
-   ❌ No persistent SSH sessions
-   ❌ Limited long-running processes
-   ❌ No root/sudo access
-   ❌ Auto-kill background processes after timeout
-   ✅ Cron jobs available (this is what we'll use!)

## ✅ Solution: Cron Jobs with Queue Worker

### How It Works

Instead of running persistent workers, use cron jobs to:

1. Run queue worker every minute
2. Process jobs for a short time (e.g., 50 seconds)
3. Exit and let cron restart it

This simulates multiple workers through frequent restarts.

### Step 1: Create Queue Worker Command

Create a wrapper script for the queue worker:

**File:** `queue-worker.sh`

```bash
#!/bin/bash

# Navigate to project directory
cd /home/username/public_html/mt-career-platform

# Run queue worker for 5 minutes (300 seconds), then exit
php artisan queue:work --queue=reports,processing --stop-when-empty --max-time=300 --sleep=3 --tries=3 2>&1

# Exit cleanly
exit 0
```

Make it executable:

```bash
chmod +x queue-worker.sh
```

### Step 2: Configure Cron Jobs

Access your shared hosting control panel (cPanel, Plesk, DirectAdmin, etc.) and add these cron jobs:

#### Option A: Single Worker (Basic)

Run every minute:

```cron
* * * * * /home/username/public_html/mt-career-platform/queue-worker.sh > /dev/null 2>&1
```

#### Option B: Multiple Workers (Better Performance)

Simulate 3 concurrent workers by running every minute with slight delays:

```cron
# Worker 1 - starts at 0 seconds
* * * * * /home/username/public_html/mt-career-platform/queue-worker.sh > /dev/null 2>&1

# Worker 2 - starts at 20 seconds
* * * * * sleep 20 && /home/username/public_html/mt-career-platform/queue-worker.sh > /dev/null 2>&1

# Worker 3 - starts at 40 seconds
* * * * * sleep 40 && /home/username/public_html/mt-career-platform/queue-worker.sh > /dev/null 2>&1
```

#### Option C: Priority-Based Workers (Recommended)

Dedicate workers to high-priority queue:

**File:** `queue-worker-reports.sh`

```bash
#!/bin/bash
cd /home/username/public_html/mt-career-platform
php artisan queue:work --queue=reports --stop-when-empty --max-time=300 --sleep=2 --tries=3 2>&1
exit 0
```

**File:** `queue-worker-processing.sh`

```bash
#!/bin/bash
cd /home/username/public_html/mt-career-platform
php artisan queue:work --queue=processing --stop-when-empty --max-time=300 --sleep=3 --tries=3 2>&1
exit 0
```

**Cron Configuration:**

```cron
# Reports queue - 2 workers (high priority)
* * * * * /home/username/public_html/mt-career-platform/queue-worker-reports.sh > /dev/null 2>&1
* * * * * sleep 30 && /home/username/public_html/mt-career-platform/queue-worker-reports.sh > /dev/null 2>&1

# Processing queue - 3 workers (background)
* * * * * sleep 15 && /home/username/public_html/mt-career-platform/queue-worker-processing.sh > /dev/null 2>&1
* * * * * sleep 35 && /home/username/public_html/mt-career-platform/queue-worker-processing.sh > /dev/null 2>&1
* * * * * sleep 55 && /home/username/public_html/mt-career-platform/queue-worker-processing.sh > /dev/null 2>&1
```

### Step 3: Add Logging (Optional but Recommended)

To monitor what's happening:

**File:** `queue-worker-with-log.sh`

```bash
#!/bin/bash

# Set paths
PROJECT_DIR="/home/username/public_html/mt-career-platform"
LOG_DIR="$PROJECT_DIR/storage/logs"
LOG_FILE="$LOG_DIR/queue-worker.log"

# Navigate to project
cd $PROJECT_DIR

# Log start time
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting queue worker..." >> $LOG_FILE

# Run queue worker
php artisan queue:work --queue=reports,processing --stop-when-empty --max-time=300 --sleep=3 --tries=3 >> $LOG_FILE 2>&1

# Log completion
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Queue worker completed." >> $LOG_FILE
echo "---" >> $LOG_FILE

exit 0
```

### Step 4: Configure via cPanel

Most shared hosting uses cPanel. Here's how to add cron jobs:

1. **Login to cPanel**
2. **Navigate to:** Advanced → Cron Jobs
3. **Common Settings:** Select "Every minute (\*\*\*\*)"
4. **Command:** Enter your script path
5. **Click:** Add New Cron Job

**Example Command:**

```bash
/home/username/public_html/mt-career-platform/queue-worker.sh
```

## Important Flags Explained

### `--stop-when-empty`

Exits when no jobs are available. Essential for cron-based workers.

### `--max-time=300`

Runs for maximum 300 seconds (5 minutes) before exiting. Allows long-running jobs like PDDIKTI API calls to complete.

**Note:** If your shared host kills processes before 5 minutes, reduce to `--max-time=180` (3 minutes) or `--max-time=120` (2 minutes).

### `--sleep=3`

Waits 3 seconds between job checks. Reduces server load.

### `--tries=3`

Retries failed jobs 3 times before marking as failed.

## Performance Comparison

### Persistent Workers (VPS/Dedicated)

```
Supervisor → 4 workers running 24/7
Processing time: Immediate
Resource usage: Constant
```

### Cron-Based Workers (Shared Hosting)

```
Cron → 5 workers every minute (5-min runtime each)
Processing time: Up to 60s delay for new jobs
Resource usage: Periodic spikes
Note: Workers exit early if queue is empty (--stop-when-empty)
```

## Optimization Tips

### 1. Adjust Worker Count Based on Load

**Low Traffic:**

```cron
# 1 worker every minute
* * * * * /path/to/queue-worker.sh
```

**Medium Traffic:**

```cron
# 3 workers with staggered starts
* * * * * /path/to/queue-worker.sh
* * * * * sleep 20 && /path/to/queue-worker.sh
* * * * * sleep 40 && /path/to/queue-worker.sh
```

**High Traffic:**

```cron
# 6 workers with 10-second intervals
* * * * * /path/to/queue-worker.sh
* * * * * sleep 10 && /path/to/queue-worker.sh
* * * * * sleep 20 && /path/to/queue-worker.sh
* * * * * sleep 30 && /path/to/queue-worker.sh
* * * * * sleep 40 && /path/to/queue-worker.sh
* * * * * sleep 50 && /path/to/queue-worker.sh
```

### 2. Monitor Resource Usage

Shared hosting has resource limits. If you hit limits:

-   ✅ Reduce number of cron workers
-   ✅ Increase `--sleep` time (from 3 to 5 seconds)
-   ✅ Increase `--max-time` (from 50 to 55 seconds)

### 3. Process High-Priority Jobs More Frequently

```cron
# Reports queue - every minute
* * * * * /path/to/queue-worker-reports.sh

# Processing queue - every 2 minutes
*/2 * * * * /path/to/queue-worker-processing.sh
```

## Alternative Solutions

### Solution 2: Web-Based Queue Runner (Not Recommended)

Create an endpoint that processes one job and call it via external cron:

**routes/web.php:**

```php
$router->get('/queue/run/{secret}', function($secret) {
    if ($secret !== env('QUEUE_SECRET')) {
        abort(403);
    }

    Artisan::call('queue:work', [
        '--queue' => 'reports,processing',
        '--once' => true,
        '--tries' => 3
    ]);

    return 'OK';
});
```

Then use a free external cron service (like cron-job.org):

```
https://yourdomain.com/queue/run/your-secret-key
```

**Limitations:**

-   ❌ Risk of timeout on long jobs
-   ❌ Exposes queue processing endpoint
-   ❌ Depends on external service
-   ❌ Slower than native queue workers

### Solution 3: Hybrid Approach

Use cron for most jobs + sync queue for urgent jobs:

**.env:**

```env
QUEUE_CONNECTION=database  # For most jobs

# In code, override for urgent jobs:
dispatch(new UrgentJob())->onConnection('sync');
```

## Monitoring Queue Health

### Check Queue Status

Add a monitoring cron job:

**File:** `queue-monitor.sh`

```bash
#!/bin/bash
cd /home/username/public_html/mt-career-platform

# Count jobs in each queue
REPORTS_COUNT=$(php artisan tinker --execute="echo DB::table('jobs')->where('queue', 'reports')->count();")
PROCESSING_COUNT=$(php artisan tinker --execute="echo DB::table('jobs')->where('queue', 'processing')->count();")

echo "[$(date)] Reports: $REPORTS_COUNT, Processing: $PROCESSING_COUNT" >> storage/logs/queue-status.log

# Alert if queue is too long (optional)
if [ "$REPORTS_COUNT" -gt 100 ]; then
    echo "WARNING: Reports queue has $REPORTS_COUNT jobs!" >> storage/logs/queue-alerts.log
fi
```

Run every 5 minutes:

```cron
*/5 * * * * /home/username/public_html/mt-career-platform/queue-monitor.sh
```

### Check Failed Jobs

```cron
# Daily report of failed jobs
0 8 * * * cd /home/username/public_html/mt-career-platform && php artisan queue:failed > /dev/null
```

## Troubleshooting

### Problem: Jobs Not Processing

**Check 1:** Verify cron is running

```bash
# Check cron logs (path varies by hosting)
tail -f /var/log/cron
# or
tail -f ~/logs/cron.log
```

**Check 2:** Test script manually

```bash
cd /home/username/public_html/mt-career-platform
php artisan queue:work --once --verbose
```

**Check 3:** Check PHP version

```bash
php -v  # Should be 7.4+
```

### Problem: "Command not found"

Use full PHP path:

```bash
# Find PHP path
which php
# or
whereis php

# Update script
/usr/local/bin/php artisan queue:work ...
```

### Problem: Permission Denied

```bash
# Make scripts executable
chmod +x queue-worker.sh
chmod +x queue-worker-reports.sh
chmod +x queue-worker-processing.sh

# Check ownership
chown username:username queue-worker.sh
```

### Problem: High Resource Usage

Your host may suspend your account. Solutions:

1. **Reduce workers:** Use fewer cron jobs
2. **Increase intervals:** Run every 2-5 minutes instead of every minute
3. **Add delays:** Use more `sleep` between jobs
4. **Optimize jobs:** Make individual jobs faster
5. **Consider upgrading:** To VPS if growth continues

## Complete Example Setup

Here's a complete, production-ready setup:

### Directory Structure

```
/home/username/public_html/mt-career-platform/
├── queue-worker-reports.sh      (high priority)
├── queue-worker-processing.sh   (standard priority)
├── queue-monitor.sh             (monitoring)
└── storage/
    └── logs/
        ├── queue-worker.log
        ├── queue-status.log
        └── queue-alerts.log
```

### queue-worker-reports.sh

```bash
#!/bin/bash
PROJECT_DIR="/home/username/public_html/mt-career-platform"
LOG_FILE="$PROJECT_DIR/storage/logs/queue-reports.log"

cd $PROJECT_DIR

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Processing reports queue..." >> $LOG_FILE

/usr/local/bin/php artisan queue:work \
    --queue=reports \
    --stop-when-empty \
    --max-time=300 \
    --sleep=2 \
    --tries=3 \
    >> $LOG_FILE 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Reports queue completed." >> $LOG_FILE
exit 0
```

### queue-worker-processing.sh

```bash
#!/bin/bash
PROJECT_DIR="/home/username/public_html/mt-career-platform"
LOG_FILE="$PROJECT_DIR/storage/logs/queue-processing.log"

cd $PROJECT_DIR

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Processing background queue..." >> $LOG_FILE

/usr/local/bin/php artisan queue:work \
    --queue=processing \
    --stop-when-empty \
    --max-time=300 \
    --sleep=3 \
    --tries=3 \
    >> $LOG_FILE 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Background queue completed." >> $LOG_FILE
exit 0
```

### Cron Configuration (in cPanel)

```cron
# Reports queue - 2 workers (high priority)
* * * * * /home/username/public_html/mt-career-platform/queue-worker-reports.sh > /dev/null 2>&1
* * * * * sleep 30 && /home/username/public_html/mt-career-platform/queue-worker-reports.sh > /dev/null 2>&1

# Processing queue - 3 workers (standard priority)
* * * * * sleep 15 && /home/username/public_html/mt-career-platform/queue-worker-processing.sh > /dev/null 2>&1
* * * * * sleep 35 && /home/username/public_html/mt-career-platform/queue-worker-processing.sh > /dev/null 2>&1
* * * * * sleep 55 && /home/username/public_html/mt-career-platform/queue-worker-processing.sh > /dev/null 2>&1

# Monitor queue health every 5 minutes
*/5 * * * * /home/username/public_html/mt-career-platform/queue-monitor.sh > /dev/null 2>&1
```

## Security Considerations

### 1. Protect Queue Scripts

Add to `.htaccess` in project root:

```apache
<Files "queue-*.sh">
    Order Allow,Deny
    Deny from all
</Files>
```

### 2. Limit Exposed Endpoints

Don't expose web-based queue runners if using cron-based approach.

### 3. Monitor Failed Jobs

Regularly check for failed jobs that might contain sensitive data:

```bash
php artisan queue:failed
```

## Comparison: Shared Hosting vs VPS

| Feature            | Shared Hosting (Cron)  | VPS (Supervisor)    |
| ------------------ | ---------------------- | ------------------- |
| **Setup**          | Easy (cPanel UI)       | Complex (CLI)       |
| **Reliability**    | Good (99%+)            | Excellent (99.9%+)  |
| **Performance**    | Moderate (60s delay)   | Excellent (instant) |
| **Resource Usage** | Periodic spikes        | Constant low usage  |
| **Scalability**    | Limited (5-10 workers) | High (50+ workers)  |
| **Cost**           | Low ($5-20/mo)         | Higher ($10-50/mo)  |
| **Management**     | Simple                 | Requires SSH/Linux  |

## When to Upgrade to VPS

Consider upgrading when:

-   ⚠️ Queue regularly has 100+ jobs waiting
-   ⚠️ Jobs take more than 5 minutes to start processing
-   ⚠️ Shared hosting suspends your account for resource usage
-   ⚠️ You need real-time job processing
-   ⚠️ You need more than 10 concurrent workers

## Summary

**Best Practice for Shared Hosting:**

✅ Use **cron-based workers** with `--stop-when-empty` flag  
✅ Stagger workers with `sleep` for "concurrent" processing  
✅ Monitor queue length and failed jobs  
✅ Keep detailed logs for debugging  
✅ Start with 3-5 workers, adjust based on load

**Not Recommended:**
❌ Web-based queue runners (timeout issues)  
❌ Long-running background processes (will be killed)  
❌ Trying to install Supervisor (no permissions)

With proper cron configuration, you can effectively run queue workers on shared hosting! 🎉
