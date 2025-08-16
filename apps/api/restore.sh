#!/usr/bin/env bash
set -euo pipefail

# restore.sh
# Restore an archive created by backup.sh
# Usage:
#   S3_BUCKET=my-bucket S3_ENDPOINT=https://s3.example.com ./restore.sh education-api-backup-...tar.gz

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$REPO_DIR/apps/api"
S3_BUCKET=${S3_BUCKET:-}
S3_ENDPOINT=${S3_ENDPOINT:-}
ARCHIVE_NAME=${1:-}

if [[ -z "$S3_BUCKET" || -z "$ARCHIVE_NAME" ]]; then
  echo "Usage: S3_BUCKET=my-bucket [S3_ENDPOINT=...] $0 <archive-name>"
  exit 2
fi

TMP_DIR=$(mktemp -d)
ARCHIVE_PATH="$TMP_DIR/$ARCHIVE_NAME"

AWS_CMD=(aws s3 cp "s3://$S3_BUCKET/$ARCHIVE_NAME" "$ARCHIVE_PATH")
if [[ -n "$S3_ENDPOINT" ]]; then
  AWS_CMD=(aws s3 cp "s3://$S3_BUCKET/$ARCHIVE_NAME" "$ARCHIVE_PATH" --endpoint-url "$S3_ENDPOINT")
fi

echo "Downloading s3://$S3_BUCKET/$ARCHIVE_NAME to $ARCHIVE_PATH"
"${AWS_CMD[@]}"

# Extract archive
echo "Extracting archive"
mkdir -p "$TMP_DIR/extracted"
tar -xzf "$ARCHIVE_PATH" -C "$TMP_DIR/extracted"

# Restore apps/api
if [[ -d "$TMP_DIR/extracted/apps/api" ]]; then
  echo "Restoring apps/api to $REPO_DIR/apps/api"
  # Backup existing app dir
  mv "$REPO_DIR/apps/api" "$REPO_DIR/apps/api.bak.$(date -u +%Y%m%dT%H%M%SZ)" || true
  mv "$TMP_DIR/extracted/apps/api" "$REPO_DIR/apps/api"
else
  echo "Archive does not contain apps/api — aborting"
  exit 3
fi

# Restore PM2 dump if present
if [[ -d "$TMP_DIR/extracted/pm2" && -f "$TMP_DIR/extracted/pm2/dump.pm2" ]]; then
  echo "Restoring PM2 dump"
  mkdir -p "$HOME/.pm2"
  cp "$TMP_DIR/extracted/pm2/dump.pm2" "$HOME/.pm2/dump.pm2"
  echo "Resurrecting PM2 processes"
  pm2 resurrect || true
fi

echo "Restore complete. Review files and restart pm2/nginx as needed."
