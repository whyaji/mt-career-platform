#!/bin/bash

# =====================================================
# Log Cleanup Script
# =====================================================
# Cleans up old queue worker logs to prevent disk space issues
# Can be run manually or via cron
# =====================================================

# Set project directory (CHANGE THIS to your actual path)
PROJECT_DIR="/Applications/MAMP/htdocs/mt-career-platform"
LOGS_DIR="$PROJECT_DIR/storage/logs"

# Navigate to project directory
cd $PROJECT_DIR || exit 1

echo "========================================"
echo "Queue Worker Log Cleanup"
echo "========================================"
echo ""

# Define log files to clean
LOG_FILES=(
    "$LOGS_DIR/queue-worker.log"
    "$LOGS_DIR/queue-reports.log"
    "$LOGS_DIR/queue-processing.log"
    "$LOGS_DIR/queue-status.log"
    "$LOGS_DIR/queue-alerts.log"
)

# Option 1: Keep last N lines (default: 5000)
KEEP_LINES=${1:-5000}

echo "Cleaning logs (keeping last $KEEP_LINES lines)..."
echo ""

for log in "${LOG_FILES[@]}"; do
    if [ -f "$log" ]; then
        # Get current size
        SIZE=$(stat -f%z "$log" 2>/dev/null || stat -c%s "$log" 2>/dev/null || echo 0)
        SIZE_MB=$((SIZE / 1048576))

        # Count lines
        LINES=$(wc -l < "$log")

        echo "Processing: $(basename $log)"
        echo "  Current size: ${SIZE_MB}MB ($LINES lines)"

        if [ $LINES -gt $KEEP_LINES ]; then
            # Backup old log
            cp "$log" "$log.old"

            # Keep only last N lines
            tail -$KEEP_LINES "$log" > "$log.tmp" && mv "$log.tmp" "$log"

            # Get new size
            NEW_SIZE=$(stat -f%z "$log" 2>/dev/null || stat -c%s "$log" 2>/dev/null || echo 0)
            NEW_SIZE_MB=$((NEW_SIZE / 1048576))

            echo "  ✅ Cleaned! New size: ${NEW_SIZE_MB}MB ($KEEP_LINES lines)"
            echo "  📦 Backup saved: $(basename $log).old"
        else
            echo "  ✓ No cleanup needed"
        fi
        echo ""
    fi
done

# Optional: Remove old Lumen logs (older than 30 days)
echo "Checking for old Lumen logs..."
find "$LOGS_DIR" -name "lumen-*.log" -type f -mtime +30 -delete 2>/dev/null
echo "✅ Removed Lumen logs older than 30 days"
echo ""

# Optional: Remove old backup logs (older than 7 days)
echo "Checking for old backup logs..."
find "$LOGS_DIR" -name "*.log.old" -type f -mtime +7 -delete 2>/dev/null
echo "✅ Removed backup logs older than 7 days"
echo ""

echo "========================================"
echo "Cleanup Complete!"
echo "========================================"

exit 0

