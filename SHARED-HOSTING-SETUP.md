# Shared Hosting Queue Setup Guide

Quick setup guide for running queue workers on shared hosting (cPanel/Plesk).

## 📋 Prerequisites

-   ✅ Access to cPanel or hosting control panel
-   ✅ SSH access (optional but helpful)
-   ✅ PHP 7.4+ installed
-   ✅ Laravel or Lumen project deployed
-   ✅ Database configured

## 🚀 Quick Setup (5 Steps)

### Step 1: Make Scripts Executable

If you have SSH access:

```bash
cd /home/username/public_html/mt-career-platform

chmod +x queue-worker.sh
chmod +x queue-worker-reports.sh
chmod +x queue-worker-processing.sh
chmod +x queue-monitor.sh
```

If no SSH, use File Manager in cPanel:

1. Navigate to project directory
2. Right-click each `.sh` file
3. Click "Change Permissions"
4. Set to `755` (rwxr-xr-x)

### Step 2: Update Script Paths

Edit each `.sh` file and change this line:

```bash
PROJECT_DIR="/Applications/MAMP/htdocs/mt-career-platform"
```

To your actual path:

```bash
PROJECT_DIR="/home/username/public_html/mt-career-platform"
# or
PROJECT_DIR="/home/username/domains/yourdomain.com/public_html"
```

### Step 3: Find Your PHP Path

SSH method:

```bash
which php
# Output example: /usr/local/bin/php
```

cPanel method:

1. Open "Terminal" in cPanel
2. Type: `which php`
3. Copy the path

If `php` works in command line, you can skip this step. Otherwise, update scripts to use full path:

```bash
# Change this:
php artisan queue:work ...

# To this:
/usr/local/bin/php artisan queue:work ...
```

### Step 4: Setup Cron Jobs in cPanel

#### Option A: Simple Setup (1 Combined Worker)

**For beginners or low traffic:**

1. Login to cPanel
2. Go to **Advanced → Cron Jobs**
3. Under "Add New Cron Job":
    - **Common Settings:** Every minute (**\***)
    - **Command:**
        ```
        /home/username/public_html/mt-career-platform/queue-worker.sh > /dev/null 2>&1
        ```
4. Click **Add New Cron Job**

**Result:** 1 worker processing both queues every minute

#### Option B: Recommended Setup (5 Workers with Priority)

**For production or medium traffic:**

Add these 5 cron jobs:

```cron
# Reports Queue - 2 workers (high priority)
* * * * * /home/username/public_html/mt-career-platform/queue-worker-reports.sh > /dev/null 2>&1
* * * * * sleep 30 && /home/username/public_html/mt-career-platform/queue-worker-reports.sh > /dev/null 2>&1

# Processing Queue - 3 workers (background)
* * * * * sleep 15 && /home/username/public_html/mt-career-platform/queue-worker-processing.sh > /dev/null 2>&1
* * * * * sleep 35 && /home/username/public_html/mt-career-platform/queue-worker-processing.sh > /dev/null 2>&1
* * * * * sleep 55 && /home/username/public_html/mt-career-platform/queue-worker-processing.sh > /dev/null 2>&1
```

**How to add in cPanel:**

For each cron job:

1. **Minute:** `*`
2. **Hour:** `*`
3. **Day:** `*`
4. **Month:** `*`
5. **Weekday:** `*`
6. **Command:** (paste the command without the `* * * * *` prefix)

    Example for first job:

    ```
    /home/username/public_html/mt-career-platform/queue-worker-reports.sh > /dev/null 2>&1
    ```

    Example for second job (with sleep):

    ```
    sleep 30 && /home/username/public_html/mt-career-platform/queue-worker-reports.sh > /dev/null 2>&1
    ```

7. Click **Add New Cron Job**
8. Repeat for all 5 cron jobs

**Result:** 5 staggered workers (2 for reports, 3 for processing)

#### Option C: Add Monitoring (Recommended)

Add one more cron job to monitor queue health:

**Run every 5 minutes:**

```cron
*/5 * * * * /home/username/public_html/mt-career-platform/queue-monitor.sh > /dev/null 2>&1
```

**In cPanel:**

1. **Minute:** `*/5`
2. **Hour:** `*`
3. **Day:** `*`
4. **Month:** `*`
5. **Weekday:** `*`
6. **Command:**
    ```
    /home/username/public_html/mt-career-platform/queue-monitor.sh > /dev/null 2>&1
    ```

### Step 5: Test the Setup

#### Via SSH:

```bash
# Test manually
cd /home/username/public_html/mt-career-platform
./queue-worker.sh

# Check logs
tail -f storage/logs/queue-worker.log
```

#### Via cPanel:

1. Wait 1-2 minutes after adding cron jobs
2. Use File Manager to check: `storage/logs/`
3. Look for:
    - `queue-worker.log` or
    - `queue-reports.log`
    - `queue-processing.log`
4. Open log files to verify workers are running

#### Dispatch a test job:

```php
// Via Laravel Tinker or API
dispatch(new \App\Jobs\ApplicantScreeningJob(1));
```

Check if it processes within 60 seconds.

## 📊 Monitoring

### View Queue Status

```bash
# Check current queue
cd /home/username/public_html/mt-career-platform
php artisan queue:failed

# Or use tinker
php artisan tinker
>>> DB::table('jobs')->count()
>>> DB::table('jobs')->where('queue', 'reports')->count()
>>> DB::table('jobs')->where('queue', 'processing')->count()
```

### Check Logs

**Via SSH:**

```bash
# Real-time monitoring
tail -f storage/logs/queue-worker.log

# Last 50 lines
tail -50 storage/logs/queue-status.log

# Check for alerts
cat storage/logs/queue-alerts.log
```

**Via cPanel File Manager:**

1. Navigate to `storage/logs/`
2. Right-click log file → View
3. Look for errors or warnings

## ⚙️ Configuration Options

### Adjust Worker Count

**Low Traffic (1-10 jobs/hour):**

```cron
# 1 worker
* * * * * /path/to/queue-worker.sh
```

**Medium Traffic (10-100 jobs/hour):**

```cron
# 3 workers
* * * * * /path/to/queue-worker.sh
* * * * * sleep 20 && /path/to/queue-worker.sh
* * * * * sleep 40 && /path/to/queue-worker.sh
```

**High Traffic (100+ jobs/hour):**

```cron
# 6 workers (Option B configuration)
Use separate reports and processing workers
```

### Adjust Processing Time

Edit `.sh` files and change:

```bash
# Faster processing (more aggressive)
--max-time=55 --sleep=1

# Slower processing (less server load)
--max-time=45 --sleep=5
```

### Change Alert Thresholds

Edit `queue-monitor.sh`:

```bash
# Current defaults
REPORTS_THRESHOLD=50
PROCESSING_THRESHOLD=200
FAILED_THRESHOLD=10

# For high-traffic site
REPORTS_THRESHOLD=100
PROCESSING_THRESHOLD=500
FAILED_THRESHOLD=20
```

## 🔧 Troubleshooting

### Problem: "Permission denied"

**Solution:**

```bash
chmod +x queue-worker.sh
chmod +x queue-worker-reports.sh
chmod +x queue-worker-processing.sh
chmod +x queue-monitor.sh
```

### Problem: "Command not found: php"

**Solution:** Find PHP path and use full path in scripts:

```bash
# Find PHP
which php
# or try
/usr/local/bin/php -v
/usr/bin/php -v

# Update scripts to use full path
/usr/local/bin/php artisan queue:work ...
```

### Problem: Jobs not processing

**Check 1:** Verify cron is running:

```bash
# In cPanel, check: Metrics → Resource Usage → Cron Jobs
# Should show recent executions
```

**Check 2:** Test script manually:

```bash
cd /home/username/public_html/mt-career-platform
php artisan queue:work --once --verbose
```

**Check 3:** Check logs:

```bash
cat storage/logs/queue-worker.log
cat storage/logs/lumen.log
```

**Check 4:** Verify job exists:

```bash
# For Lumen (no tinker)
php check-queue.php

# Or manually check
php -r "require 'vendor/autoload.php'; \$app = require 'bootstrap/app.php'; echo \$app->make('db')->table('jobs')->count();"
```

### Problem: "Script taking too long"

If host kills processes, reduce processing time:

```bash
# In .sh files, change:
--max-time=50

# To:
--max-time=30
```

### Problem: High resource usage warning

**Solution 1:** Reduce workers:

```cron
# Use only 2-3 workers instead of 5
```

**Solution 2:** Add more sleep time:

```bash
--sleep=5  # instead of --sleep=3
```

**Solution 3:** Run less frequently:

```cron
# Every 2 minutes instead of every minute
*/2 * * * * /path/to/queue-worker.sh
```

## 📝 Maintenance Tasks

### Weekly Tasks

1. **Check failed jobs:**

    ```bash
    php artisan queue:failed
    ```

2. **Retry failed jobs:**

    ```bash
    php artisan queue:retry all
    ```

3. **Clear old logs:**
    ```bash
    cd storage/logs
    > queue-worker.log  # Clear but keep file
    ```

### Monthly Tasks

1. **Review queue performance:**

    ```bash
    # Check average queue times
    cat storage/logs/queue-status.log | grep -c "Reports: 0"
    ```

2. **Clean up old failed jobs:**

    ```bash
    php artisan queue:flush
    ```

3. **Update worker count if needed**

## 🎯 Performance Benchmarks

| Setup        | Workers | Throughput     | Delay |
| ------------ | ------- | -------------- | ----- |
| Simple       | 1       | ~60 jobs/hour  | 0-60s |
| Recommended  | 5       | ~300 jobs/hour | 0-20s |
| High-Traffic | 6       | ~360 jobs/hour | 0-10s |

## 💡 Tips

1. **Start Simple:** Begin with Option A (1 worker), then scale up if needed
2. **Monitor First Week:** Check logs daily to understand your traffic patterns
3. **Adjust Gradually:** Change one thing at a time (workers, sleep time, etc.)
4. **Keep Logs Clean:** Rotate logs monthly to prevent disk space issues
5. **Document Changes:** Note any customizations you make

## 🆘 Need Help?

### Check Documentation

-   See: `docs/QUEUE-SHARED-HOSTING.md` for detailed information
-   See: `docs/QUEUE-PRIORITY.md` for queue priority concepts

### Common Questions

**Q: How many workers should I use?**  
A: Start with 1-3, monitor queue length, increase if jobs wait more than 5 minutes.

**Q: Can I use Supervisor on shared hosting?**  
A: No, shared hosting doesn't allow Supervisor. Use cron jobs instead.

**Q: Will this work on all shared hosts?**  
A: Yes, if they support cron jobs (99% do). Some hosts may have execution time limits.

**Q: What if my host doesn't support cron jobs?**  
A: Very rare, but consider using external cron services like cron-job.org or upgrading to VPS.

## ✅ Success Checklist

-   [ ] Scripts are executable (`chmod +x`)
-   [ ] Project path is correct in all scripts
-   [ ] PHP path is correct (if needed)
-   [ ] Cron jobs added in cPanel
-   [ ] Logs directory exists: `storage/logs/`
-   [ ] Test job dispatched and processed
-   [ ] Logs showing activity
-   [ ] Monitoring cron job added
-   [ ] No resource usage warnings from host

## 🎉 You're Done!

Your queue workers are now running on shared hosting. Jobs will be processed automatically every minute.

**Next Steps:**

1. Monitor logs for first 24 hours
2. Adjust worker count based on actual load
3. Set up alerts for failed jobs
4. Consider upgrading to VPS if you outgrow shared hosting

For questions or issues, check the detailed documentation in `docs/QUEUE-SHARED-HOSTING.md`.
