#!/bin/bash

# =====================================================
# Queue Monitor Script
# =====================================================
# This script monitors queue health and logs statistics
# Designed for shared hosting environments
# Runs via cron job every 5 minutes
# =====================================================

# Set project directory (CHANGE THIS to your actual path)
PROJECT_DIR="/Applications/MAMP/htdocs/mt-career-platform"
STATUS_LOG="$PROJECT_DIR/storage/logs/queue-status.log"
ALERT_LOG="$PROJECT_DIR/storage/logs/queue-alerts.log"

# Navigate to project directory
cd $PROJECT_DIR || exit 1

# Create log directory if it doesn't exist
mkdir -p "$PROJECT_DIR/storage/logs"

# Count jobs in each queue (Lumen compatible)
# Using direct database queries instead of tinker (which isn't available in Lumen)
REPORTS_COUNT=$(php -r "require 'vendor/autoload.php'; \$app = require 'bootstrap/app.php'; echo \$app->make('db')->table('jobs')->where('queue', 'reports')->count();" 2>/dev/null)
PROCESSING_COUNT=$(php -r "require 'vendor/autoload.php'; \$app = require 'bootstrap/app.php'; echo \$app->make('db')->table('jobs')->where('queue', 'processing')->count();" 2>/dev/null)
FAILED_COUNT=$(php -r "require 'vendor/autoload.php'; \$app = require 'bootstrap/app.php'; echo \$app->make('db')->table('failed_jobs')->count();" 2>/dev/null)

# Default to 0 if commands fail
REPORTS_COUNT=${REPORTS_COUNT:-0}
PROCESSING_COUNT=${PROCESSING_COUNT:-0}
FAILED_COUNT=${FAILED_COUNT:-0}

# Log current status
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Reports: $REPORTS_COUNT | Processing: $PROCESSING_COUNT | Failed: $FAILED_COUNT" >> $STATUS_LOG

# Alert thresholds
REPORTS_THRESHOLD=50
PROCESSING_THRESHOLD=200
FAILED_THRESHOLD=10

# Check for alerts
if [ "$REPORTS_COUNT" -gt "$REPORTS_THRESHOLD" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ WARNING: Reports queue has $REPORTS_COUNT jobs (threshold: $REPORTS_THRESHOLD)" >> $ALERT_LOG
fi

if [ "$PROCESSING_COUNT" -gt "$PROCESSING_THRESHOLD" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ WARNING: Processing queue has $PROCESSING_COUNT jobs (threshold: $PROCESSING_THRESHOLD)" >> $ALERT_LOG
fi

if [ "$FAILED_COUNT" -gt "$FAILED_THRESHOLD" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ ERROR: $FAILED_COUNT failed jobs (threshold: $FAILED_THRESHOLD)" >> $ALERT_LOG
fi

# Keep logs manageable (keep last 1000 lines)
tail -1000 $STATUS_LOG > $STATUS_LOG.tmp && mv $STATUS_LOG.tmp $STATUS_LOG
if [ -f "$ALERT_LOG" ]; then
    tail -500 $ALERT_LOG > $ALERT_LOG.tmp && mv $ALERT_LOG.tmp $ALERT_LOG
fi

exit 0

