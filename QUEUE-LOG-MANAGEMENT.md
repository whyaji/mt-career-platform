# Queue Worker Log Management Guide

This guide explains how queue logs work and how to manage them to prevent disk space issues.

## 📊 Understanding Log Files

### Log Files Created

| File                   | Purpose               | Growth Rate | Size After 1 Month |
| ---------------------- | --------------------- | ----------- | ------------------ |
| `queue-worker.log`     | Combined worker logs  | ~5MB/day    | ~150MB             |
| `queue-reports.log`    | Reports queue logs    | ~2MB/day    | ~60MB              |
| `queue-processing.log` | Processing queue logs | ~3MB/day    | ~90MB              |
| `queue-status.log`     | Monitor status        | ~500KB/day  | ~15MB              |
| `queue-alerts.log`     | Alert messages        | ~100KB/day  | ~3MB               |
| `lumen-YYYY-MM-DD.log` | Laravel/Lumen logs    | ~1-5MB/day  | Daily rotation ✅  |

### Current Behavior

**Queue worker logs (`.sh` scripts):**

```bash
>> $LOG_FILE  # Appends forever, NO automatic rotation ❌
```

**Lumen application logs:**

```php
// Daily rotation built-in ✅
storage/logs/lumen-2025-10-14.log
storage/logs/lumen-2025-10-15.log
```

## ⚠️ The Problem: Logs Grow Forever

Without management:

```
Week 1:   Total ~35MB
Month 1:  Total ~300MB
Month 3:  Total ~900MB  ⚠️
Month 6:  Total ~1.8GB  ❌ (Disk space issues!)
```

## ✅ Solutions Implemented

### Solution 1: Automatic Rotation (queue-monitor.sh)

**Already configured!** The `queue-monitor.sh` script now:

-   ✅ Runs every 5 minutes (via cron)
-   ✅ Checks if logs are larger than 10MB
-   ✅ Automatically keeps last 5000 lines
-   ✅ Prevents logs from exceeding ~10MB

**How it works:**

```bash
# Every 5 minutes:
if log > 10MB:
    Keep last 5000 lines
    Delete the rest
    Log rotation message added
```

**Result:** Logs automatically stay under 10MB! 🎉

### Solution 2: Manual Cleanup Script

Run `cleanup-logs.sh` to clean logs manually:

```bash
# Clean all logs (keep last 5000 lines)
./cleanup-logs.sh

# Keep different amount (e.g., 10000 lines)
./cleanup-logs.sh 10000

# Keep only 1000 lines (aggressive cleanup)
./cleanup-logs.sh 1000
```

**Features:**

-   ✅ Shows current log sizes
-   ✅ Creates backups before cleanup
-   ✅ Removes old Lumen logs (>30 days)
-   ✅ Removes old backups (>7 days)

### Solution 3: Scheduled Cleanup (Recommended)

Add to cron for automatic weekly cleanup:

```cron
# Clean logs every Sunday at 2 AM
0 2 * * 0 /path/to/project/cleanup-logs.sh 5000 > /dev/null 2>&1
```

## 📋 Log Rotation Strategies

### Strategy 1: Auto-Rotation by Size (Current) ⭐

**When:** Log exceeds 10MB  
**Action:** Keep last 5000 lines  
**Via:** `queue-monitor.sh` (every 5 minutes)

```bash
# Configured in queue-monitor.sh
if log > 10MB:
    tail -5000 log > log.tmp && mv log.tmp log
```

**Pros:**

-   ✅ Automatic
-   ✅ No manual intervention
-   ✅ Prevents large files
-   ✅ Runs frequently

**Cons:**

-   ❌ May lose older history
-   ❌ Size-based (not time-based)

### Strategy 2: Daily/Weekly Cleanup

**When:** Every week  
**Action:** Keep last 10000 lines  
**Via:** Cron + `cleanup-logs.sh`

```cron
# Every Sunday at 2 AM
0 2 * * 0 /path/to/cleanup-logs.sh 10000
```

**Pros:**

-   ✅ More history retained
-   ✅ Predictable schedule
-   ✅ Creates backups

**Cons:**

-   ❌ Logs can grow between cleanups
-   ❌ Requires cron setup

### Strategy 3: Archive Old Logs

Keep archives for historical analysis:

```bash
#!/bin/bash
# Archive logs monthly
DATE=$(date +%Y-%m)
tar -czf "logs-archive-$DATE.tar.gz" storage/logs/*.log
# Then clean current logs
./cleanup-logs.sh 1000
```

## 🔧 Configuration Options

### Adjust Rotation Size (queue-monitor.sh)

Edit line 68 in `queue-monitor.sh`:

```bash
# Current: Rotate when > 10MB
if [ $(stat ...) -gt 10485760 ]; then

# Change to 5MB:
if [ $(stat ...) -gt 5242880 ]; then

# Change to 20MB:
if [ $(stat ...) -gt 20971520 ]; then
```

**Common sizes:**

-   5MB = 5242880 bytes
-   10MB = 10485760 bytes
-   20MB = 20971520 bytes
-   50MB = 52428800 bytes

### Adjust Lines Kept

Edit line 69 in `queue-monitor.sh`:

```bash
# Current: Keep 5000 lines
tail -5000 "$log" > "$log.tmp"

# Keep more history (10000 lines):
tail -10000 "$log" > "$log.tmp"

# Keep less (1000 lines):
tail -1000 "$log" > "$log.tmp"
```

**Estimate:**

-   1000 lines ≈ 100KB - 500KB
-   5000 lines ≈ 500KB - 2MB
-   10000 lines ≈ 1MB - 5MB

## 📊 Monitoring Log Growth

### Check Current Log Sizes

```bash
# Size of all queue logs
du -h storage/logs/queue-*.log

# Detailed list
ls -lh storage/logs/queue-*.log

# Total size of logs directory
du -sh storage/logs/
```

### Watch Log Growth Over Time

```bash
# Create a monitoring script
cat > monitor-log-size.sh << 'EOF'
#!/bin/bash
echo "$(date '+%Y-%m-%d %H:%M:%S') - Log Sizes:"
du -h storage/logs/queue-*.log
echo "---"
EOF

# Run hourly via cron
0 * * * * /path/to/monitor-log-size.sh >> /tmp/log-size-history.txt
```

### Alert on Large Logs

Add to `queue-monitor.sh`:

```bash
# Check total logs size
TOTAL_SIZE=$(du -sm storage/logs/queue-*.log | awk '{sum+=$1} END {print sum}')

if [ "$TOTAL_SIZE" -gt 100 ]; then
    echo "[$(date)] ⚠️ WARNING: Queue logs exceed 100MB total!" >> $ALERT_LOG
fi
```

## 🗑️ Manual Cleanup Commands

### Quick Cleanups

```bash
# Clear specific log completely
> storage/logs/queue-worker.log

# Keep last 100 lines only
tail -100 storage/logs/queue-worker.log > temp.log && mv temp.log storage/logs/queue-worker.log

# Delete all queue logs (nuclear option)
rm storage/logs/queue-*.log

# Delete old Lumen logs
find storage/logs -name "lumen-*.log" -mtime +30 -delete
```

### Backup Before Cleanup

```bash
# Backup all logs
tar -czf logs-backup-$(date +%Y%m%d).tar.gz storage/logs/

# Then clean
./cleanup-logs.sh
```

### View Large Files

```bash
# Find logs larger than 10MB
find storage/logs -name "*.log" -size +10M

# Show top 5 largest logs
du -h storage/logs/*.log | sort -rh | head -5
```

## 📈 Best Practices

### For Shared Hosting

1. ✅ **Use automatic rotation** (Solution 1 - already set!)
2. ✅ **Monitor disk usage** weekly
3. ✅ **Keep 5000-10000 lines** (2-5 days of history)
4. ✅ **Run cleanup monthly** manually
5. ✅ **Archive important logs** before cleanup

```bash
# Weekly monitoring
du -sh storage/logs/

# Monthly cleanup
./cleanup-logs.sh 5000

# Archive before cleanup
tar -czf logs-$(date +%Y%m).tar.gz storage/logs/queue-*.log
```

### For VPS/Dedicated

1. ✅ **Keep more history** (10000-20000 lines)
2. ✅ **Use logrotate** (system tool)
3. ✅ **Archive monthly**
4. ✅ **Monitor with alerts**

**Using logrotate:**

```bash
# /etc/logrotate.d/queue-worker
/path/to/storage/logs/queue-*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
    create 644 www-data www-data
}
```

## 📝 Log Retention Recommendations

| Environment    | Lines to Keep | Rotation Frequency | Retention         |
| -------------- | ------------- | ------------------ | ----------------- |
| Development    | 1000-2000     | Daily              | 3 days            |
| Shared Hosting | 5000          | When > 10MB        | 5-7 days          |
| VPS/Production | 10000-20000   | Daily              | 30 days           |
| Enterprise     | 50000+        | Daily              | 90 days + Archive |

## 🚨 Troubleshooting

### Problem: "No space left on device"

**Immediate action:**

```bash
# 1. Check disk usage
df -h

# 2. Find large logs
du -h storage/logs/*.log | sort -rh

# 3. Emergency cleanup (keep only 500 lines)
./cleanup-logs.sh 500

# 4. Delete old logs
find storage/logs -name "*.log" -mtime +7 -delete
```

### Problem: Log rotation not working

**Check:**

```bash
# 1. Is queue-monitor.sh running?
ps aux | grep queue-monitor

# 2. Is cron job active?
crontab -l | grep queue-monitor

# 3. Are logs writable?
ls -la storage/logs/

# 4. Test manually
./queue-monitor.sh
```

### Problem: Logs still growing despite rotation

**Possible causes:**

1. ❌ `queue-monitor.sh` not in cron
2. ❌ Cron not running
3. ❌ Rotation threshold too high
4. ❌ Multiple workers creating many logs

**Fix:**

```bash
# Add to cron if missing
*/5 * * * * /path/to/queue-monitor.sh

# Lower threshold in queue-monitor.sh
# Change 10485760 (10MB) to 5242880 (5MB)

# Or run cleanup more frequently
*/15 * * * * /path/to/cleanup-logs.sh 3000
```

## ✅ Current Setup Summary

Your queue logs are now configured with:

-   ✅ **Automatic rotation** at 10MB (via `queue-monitor.sh`)
-   ✅ **Keeps last 5000 lines** (~2-5 days history)
-   ✅ **Runs every 5 minutes** (prevents runaway growth)
-   ✅ **Manual cleanup available** (`cleanup-logs.sh`)
-   ✅ **Max log size: ~10MB** per file

**Expected stable state:**

```
queue-worker.log      →  ~8-10MB (rotates at 10MB)
queue-reports.log     →  ~8-10MB (rotates at 10MB)
queue-processing.log  →  ~8-10MB (rotates at 10MB)
queue-status.log      →  <1MB (rotates at 1000 lines)
queue-alerts.log      →  <500KB (rotates at 500 lines)

Total: ~30MB maximum (self-managing!)
```

## 📖 Quick Reference

### Check Log Sizes

```bash
du -h storage/logs/queue-*.log
```

### Manual Cleanup

```bash
./cleanup-logs.sh 5000
```

### View Recent Logs

```bash
tail -100 storage/logs/queue-worker.log
```

### Clear Specific Log

```bash
> storage/logs/queue-worker.log
```

### Backup Logs

```bash
tar -czf logs-backup.tar.gz storage/logs/
```

---

**Your logs are now self-managing! 🎉**

They'll automatically rotate when they reach 10MB, keeping your disk space safe.
