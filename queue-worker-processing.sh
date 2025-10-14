#!/bin/bash

# =====================================================
# Queue Worker for Processing Queue (Standard Priority)
# =====================================================
# This script processes jobs from the 'processing' queue
# Designed for shared hosting environments
# Runs via cron job every minute
# =====================================================

# Set project directory (CHANGE THIS to your actual path)
PROJECT_DIR="/Applications/MAMP/htdocs/mt-career-platform"
LOG_FILE="$PROJECT_DIR/storage/logs/queue-processing.log"

# Navigate to project directory
cd $PROJECT_DIR || exit 1

# Create log directory if it doesn't exist
mkdir -p "$PROJECT_DIR/storage/logs"

# Log start time
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting processing queue worker..." >> $LOG_FILE

# Run queue worker
# --queue=processing       : Only process processing queue (background jobs)
# --stop-when-empty        : Exit when no jobs available
# --max-time=300           : Run for maximum 300 seconds (5 minutes)
# --sleep=3                : Wait 3 seconds between checks (reduce load)
# --tries=3                : Retry failed jobs 3 times
php artisan queue:work \
    --queue=processing \
    --stop-when-empty \
    --max-time=300 \
    --sleep=3 \
    --tries=3 \
    >> $LOG_FILE 2>&1

# Log completion
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Processing queue worker completed." >> $LOG_FILE
echo "---" >> $LOG_FILE

# Exit cleanly
exit 0

