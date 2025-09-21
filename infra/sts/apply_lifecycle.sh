#!/usr/bin/env bash
set -euo pipefail

LC_FILE="$(dirname "$0")/lifecycle-ml-buckets.json"
if [ ! -f "$LC_FILE" ]; then
  echo "Lifecycle file not found: $LC_FILE" >&2
  exit 1
fi

if [ $# -lt 1 ]; then
  echo "Usage: $0 <bucket1> [bucket2 ...]" >&2
  exit 1
fi

for b in "$@"; do
  echo "Applying lifecycle to bucket: $b"
  gcloud storage buckets update "$b" --lifecycle-file="$LC_FILE"
  echo "Describe bucket to verify rule:" 
  gcloud storage buckets describe "$b" --format="yaml:lifecycle" || true
done

echo "Done. Objects older than 1 day will be deleted per lifecycle policy."
