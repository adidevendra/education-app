#!/usr/bin/env bash
set -euo pipefail

# backup.sh
# Create a tar.gz of the repo's apps/api folder plus PM2 dump and upload to an S3-compatible bucket.
# Requires: aws CLI configured (or AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY env vars set) and pm2 in PATH.
# Usage:
#   S3_BUCKET=my-bucket S3_ENDPOINT=https://s3.example.com ./backup.sh
# Optional env vars:
#   S3_BUCKET (required)
#   S3_ENDPOINT (optional, for S3-compatible)
#   APP_ROOT (optional, default: /home/ubuntu/education-app)
#   KEEP_LOCAL=1 (optional, keep local archive)

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$REPO_DIR/apps/api"
APP_ROOT=${APP_ROOT:-/home/ubuntu/education-app}
S3_BUCKET=${S3_BUCKET:-}
S3_ENDPOINT=${S3_ENDPOINT:-}
KEEP_LOCAL=${KEEP_LOCAL:-0}

if [[ -z "$S3_BUCKET" ]]; then
  echo "ERROR: S3_BUCKET must be set. Example: S3_BUCKET=my-bucket $0"
  exit 2
fi

TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
HOSTNAME=$(hostname -s)
ARCHIVE_NAME="education-api-backup-${HOSTNAME}-${TIMESTAMP}.tar.gz"
TMP_DIR=$(mktemp -d)
ARCHIVE_PATH="$TMP_DIR/$ARCHIVE_NAME"

echo "Creating temporary workspace: $TMP_DIR"

# Ensure pm2 dump exists
if command -v pm2 >/dev/null 2>&1; then
  echo "Saving PM2 process list (dump)"
  pm2 save || true
else
  echo "Warning: pm2 not found in PATH; skipping pm2 dump"
fi

# Copy PM2 dump if present
PM2_DUMP="${HOME}/.pm2/dump.pm2"
if [[ -f "$PM2_DUMP" ]]; then
  mkdir -p "$TMP_DIR/pm2"
  cp "$PM2_DUMP" "$TMP_DIR/pm2/dump.pm2"
  echo "Included PM2 dump"
else
  echo "No PM2 dump found at $PM2_DUMP — continuing without it"
fi

# Create the tar archive containing the apps/api folder and the pm2 dump (if any)
pushd "$REPO_DIR" >/dev/null
  echo "Archiving $APP_DIR into $ARCHIVE_PATH"
  tar -czf "$ARCHIVE_PATH" -C "$REPO_DIR" "apps/api"
  # If pm2 dump was copied, append it at top level inside archive
  if [[ -d "$TMP_DIR/pm2" ]]; then
    tar --append --file="$ARCHIVE_PATH" -C "$TMP_DIR" pm2
    # compressed tar can't be appended; recreate compressed archive including pm2
    # Recreate compressed archive properly
    temp_uncompressed="$TMP_DIR/uncompressed.tar"
    tar -cf "$temp_uncompressed" -C "$REPO_DIR" "apps/api"
    tar -rf "$temp_uncompressed" -C "$TMP_DIR" pm2
    gzip -c "$temp_uncompressed" > "$ARCHIVE_PATH"
    rm -f "$temp_uncompressed"
  fi
popd >/dev/null

echo "Archive created: $ARCHIVE_PATH"

# Upload to S3
AWS_CMD=(aws s3 cp "$ARCHIVE_PATH" "s3://$S3_BUCKET/$ARCHIVE_NAME")
if [[ -n "$S3_ENDPOINT" ]]; then
  AWS_CMD=(aws s3 cp "$ARCHIVE_PATH" "s3://$S3_BUCKET/$ARCHIVE_NAME" --endpoint-url "$S3_ENDPOINT")
fi

echo "Uploading archive to s3://$S3_BUCKET/$ARCHIVE_NAME"
"${AWS_CMD[@]}"

if [[ "$KEEP_LOCAL" != "1" ]]; then
  echo "Removing local temp archive"
  rm -rf "$TMP_DIR"
else
  echo "Keeping local archive at $ARCHIVE_PATH"
fi

echo "Backup uploaded successfully"
