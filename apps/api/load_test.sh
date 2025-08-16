#!/usr/bin/env bash
# Simple load test for /api/health using autocannon via npx
# Hits the target at 100 requests/sec for 10s by default.

set -euo pipefail

TARGET=${1:-${TARGET:-http://localhost:3000/api/health}}
RATE=${2:-100}
DURATION=${3:-10}

echo "Running load test -> target=${TARGET}, rate=${RATE} rps, duration=${DURATION}s"

# Run autocannon via npx so no global install is required.
# This prints a human-friendly summary. If you want machine-readable JSON, run:
#   npx autocannon -R ${RATE} -d ${DURATION} ${TARGET} -j > load_test_result.json

npx autocannon -R ${RATE} -d ${DURATION} "${TARGET}"

exit 0
