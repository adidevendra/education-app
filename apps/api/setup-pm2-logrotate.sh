#!/usr/bin/env bash
set -euo pipefail

# setup-pm2-logrotate.sh
# Installs pm2-logrotate module (if missing) and applies a conservative rotation policy.
# Run this on the server as the user that runs pm2 (e.g., ubuntu):
#   ./setup-pm2-logrotate.sh

echo "Installing pm2-logrotate (if not already installed)..."
pm2 install pm2-logrotate || true

echo "Applying pm2-logrotate settings..."
# Maximum file size before rotation (10 megabytes)
pm2 set pm2-logrotate:max_size 10M

# Number of rotated files to keep (14 days by default)
pm2 set pm2-logrotate:retain 14

# Compress rotated files
pm2 set pm2-logrotate:compress true

# Rotate on a schedule (cron-like). Here: daily at midnight
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'

# Timestamp format appended to rotated files
pm2 set pm2-logrotate:dateFormat 'YYYY-MM-DD_HH-mm-ss'

# Worker interval (seconds) for the logrotate module to check for rotation events
pm2 set pm2-logrotate:workerInterval 3600

echo "pm2-logrotate configured. Run 'pm2 show pm2-logrotate' to inspect module status." 
echo "Check rotated logs in the PM2 log directory (commonly ~/.pm2/logs) or in the app logs path if configured." 
