# Lumen Queue Management Commands

Lumen is a micro-framework that doesn't include all Laravel features. Here are Lumen-compatible ways to manage and monitor queues.

## 🔍 Checking Queue Status

### Count Jobs in Queue

Since Lumen doesn't have `tinker`, use direct PHP execution:

```bash
# Count all jobs
php -r "require 'vendor/autoload.php'; \$app = require 'bootstrap/app.php'; echo \$app->make('db')->table('jobs')->count();"

# Count jobs in reports queue
php -r "require 'vendor/autoload.php'; \$app = require 'bootstrap/app.php'; echo \$app->make('db')->table('jobs')->where('queue', 'reports')->count();"

# Count jobs in processing queue
php -r "require 'vendor/autoload.php'; \$app = require 'bootstrap/app.php'; echo \$app->make('db')->table('jobs')->where('queue', 'processing')->count();"

# Count failed jobs
php -r "require 'vendor/autoload.php'; \$app = require 'bootstrap/app.php'; echo \$app->make('db')->table('failed_jobs')->count();"
```

### View Jobs in Queue

```bash
# View all jobs
php -r "require 'vendor/autoload.php'; \$app = require 'bootstrap/app.php'; \$jobs = \$app->make('db')->table('jobs')->get(); foreach(\$jobs as \$job) { echo 'Queue: ' . \$job->queue . ' | Attempts: ' . \$job->attempts . PHP_EOL; }"

# View jobs by queue
php -r "require 'vendor/autoload.php'; \$app = require 'bootstrap/app.php'; \$jobs = \$app->make('db')->table('jobs')->where('queue', 'reports')->get(); foreach(\$jobs as \$job) { echo 'ID: ' . \$job->id . ' | Attempts: ' . \$job->attempts . PHP_EOL; }"
```

## 🔧 Queue Worker Commands

These commands work the same in Lumen:

```bash
# Run queue worker
php artisan queue:work

# Run worker with specific queue
php artisan queue:work --queue=reports,processing

# Process one job and exit
php artisan queue:work --once

# Stop when queue is empty
php artisan queue:work --stop-when-empty

# Set maximum execution time
php artisan queue:work --max-time=50

# Set sleep time between checks
php artisan queue:work --sleep=3

# Set maximum retry attempts
php artisan queue:work --tries=3
```

## ❌ Failed Jobs Management

```bash
# List failed jobs
php artisan queue:failed

# Retry a specific failed job
php artisan queue:retry {job-id}

# Retry all failed jobs
php artisan queue:retry all

# Delete a failed job
php artisan queue:forget {job-id}

# Flush all failed jobs
php artisan queue:flush
```

## 📊 Monitoring Scripts for Lumen

### Simple Queue Check Script

Create `check-queue.php`:

```php
<?php
require __DIR__.'/vendor/autoload.php';

$app = require __DIR__.'/bootstrap/app.php';
$db = $app->make('db');

echo "=== Queue Status ===\n";
echo "Reports Queue: " . $db->table('jobs')->where('queue', 'reports')->count() . " jobs\n";
echo "Processing Queue: " . $db->table('jobs')->where('queue', 'processing')->count() . " jobs\n";
echo "Failed Jobs: " . $db->table('failed_jobs')->count() . " jobs\n";
echo "==================\n";
```

Run it:

```bash
php check-queue.php
```

### Detailed Queue Monitor Script

Create `monitor-queue.php`:

```php
<?php
require __DIR__.'/vendor/autoload.php';

$app = require __DIR__.'/bootstrap/app.php';
$db = $app->make('db');

// Get counts
$reportsCount = $db->table('jobs')->where('queue', 'reports')->count();
$processingCount = $db->table('jobs')->where('queue', 'processing')->count();
$failedCount = $db->table('failed_jobs')->count();

// Display status
echo "\n" . date('Y-m-d H:i:s') . " - Queue Status:\n";
echo "  Reports:    " . str_pad($reportsCount, 5, ' ', STR_PAD_LEFT) . " jobs\n";
echo "  Processing: " . str_pad($processingCount, 5, ' ', STR_PAD_LEFT) . " jobs\n";
echo "  Failed:     " . str_pad($failedCount, 5, ' ', STR_PAD_LEFT) . " jobs\n";

// Check for alerts
if ($reportsCount > 50) {
    echo "⚠️  WARNING: Reports queue is backed up!\n";
}

if ($processingCount > 200) {
    echo "⚠️  WARNING: Processing queue is backed up!\n";
}

if ($failedCount > 10) {
    echo "❌ ERROR: Too many failed jobs!\n";
}

echo "\n";
```

Run it:

```bash
php monitor-queue.php
```

## 🧪 Testing Queue in Lumen

### Dispatch Test Job

Create `test-queue.php`:

```php
<?php
require __DIR__.'/vendor/autoload.php';

$app = require __DIR__.'/bootstrap/app.php';

// Dispatch a test job
dispatch(new \App\Jobs\ApplicantScreeningJob(1));

echo "Test job dispatched!\n";
echo "Check queue status with: php check-queue.php\n";
```

Run it:

```bash
php test-queue.php
```

### Manual Job Processing

```bash
# Process exactly one job
php artisan queue:work --once

# Process jobs for 10 seconds then exit
php artisan queue:work --max-time=10 --stop-when-empty
```

## 🔄 Alternative: Use MySQL/Database Directly

If PHP commands don't work, query the database directly:

```bash
# Using mysql command line
mysql -u username -p database_name -e "SELECT queue, COUNT(*) as count FROM jobs GROUP BY queue;"

# Count all jobs
mysql -u username -p database_name -e "SELECT COUNT(*) FROM jobs;"

# View recent failed jobs
mysql -u username -p database_name -e "SELECT id, connection, queue, exception FROM failed_jobs ORDER BY failed_at DESC LIMIT 10;"
```

## 📝 Cron-Compatible Check Script

For monitoring via cron, create `queue-check-cron.php`:

```php
<?php
require __DIR__.'/vendor/autoload.php';

$app = require __DIR__.'/bootstrap/app.php';
$db = $app->make('db');

$logFile = __DIR__.'/storage/logs/queue-status.log';

$reports = $db->table('jobs')->where('queue', 'reports')->count();
$processing = $db->table('jobs')->where('queue', 'processing')->count();
$failed = $db->table('failed_jobs')->count();

$message = sprintf(
    "[%s] Reports: %d | Processing: %d | Failed: %d\n",
    date('Y-m-d H:i:s'),
    $reports,
    $processing,
    $failed
);

file_put_contents($logFile, $message, FILE_APPEND);

// Alert if thresholds exceeded
if ($reports > 50 || $processing > 200 || $failed > 10) {
    $alertFile = __DIR__.'/storage/logs/queue-alerts.log';
    file_put_contents($alertFile, $message, FILE_APPEND);
}
```

Add to cron:

```cron
*/5 * * * * cd /path/to/project && php queue-check-cron.php
```

## 🎯 Quick Reference

| Task         | Laravel Command               | Lumen Alternative                           |
| ------------ | ----------------------------- | ------------------------------------------- |
| Count jobs   | `php artisan tinker`          | `php -r "require 'vendor/autoload.php'..."` |
| Check queue  | `php artisan tinker`          | `php check-queue.php`                       |
| Run worker   | `php artisan queue:work`      | ✅ Same                                     |
| Failed jobs  | `php artisan queue:failed`    | ✅ Same                                     |
| Retry failed | `php artisan queue:retry all` | ✅ Same                                     |

## 💡 Tips for Lumen

1. **No Tinker:** Use direct PHP scripts or database queries
2. **Same Worker Commands:** All `queue:work` commands work identically
3. **Create Helper Scripts:** Make PHP scripts for common tasks
4. **Use Cron:** Works the same way as Laravel
5. **Database Access:** Direct queries work when commands don't

## 🚀 Recommended Workflow

1. **Use queue-worker scripts** (they work in Lumen!)
2. **Create PHP monitoring scripts** instead of using tinker
3. **Set up cron jobs** exactly as documented
4. **Monitor via logs** or custom PHP scripts

## ✅ Everything Still Works!

The good news: **All the queue worker scripts work perfectly in Lumen!**

-   ✅ `queue-worker.sh` - Works!
-   ✅ `queue-worker-reports.sh` - Works!
-   ✅ `queue-worker-processing.sh` - Works!
-   ✅ `queue-monitor.sh` - **Now fixed for Lumen!**
-   ✅ Cron jobs - Work exactly the same!

The **only difference** is how you manually check queue status outside of the automated scripts.

## 📖 See Also

-   `SHARED-HOSTING-SETUP.md` - Full setup guide (works for Lumen!)
-   `docs/QUEUE-PRIORITY.md` - Queue priority concepts
-   `docs/QUEUE-SHARED-HOSTING.md` - Detailed shared hosting guide
