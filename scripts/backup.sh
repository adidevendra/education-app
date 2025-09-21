#!/usr/bin/env bash
set -euo pipefail
DATE=$(date +%F)
OUT_DIR=${BACKUP_DIR:-"./backups"}
mkdir -p "$OUT_DIR"
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL not set" >&2; exit 1
fi
pg_dump "$DATABASE_URL" > "$OUT_DIR/db-$DATE.sql"
echo "Backup written to $OUT_DIR/db-$DATE.sql"
