#!/usr/bin/env bash
set -euo pipefail

BASE_URL="http://localhost:3000/api"
CURL_OPTS=(--max-time 10 -s -S -w "\nHTTP_STATUS:%{http_code}\n")

echo "1) Health check"
curl "${CURL_OPTS[@]}" -i "${BASE_URL}/health" || true

echo "\n2) Create user"
resp_user=$(curl "${CURL_OPTS[@]}" -s -X POST "${BASE_URL}/users" \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke+user1@example.com","name":"Smoke User","password":"P@ssw0rd"}') || true
echo "$resp_user"

# Try to extract user id with python, fall back to empty
id_user=$(python3 -c 'import sys,json
try:
  j=json.load(sys.stdin)
  print(j.get("id", ""))
except Exception:
  print("")' <<<"${resp_user}" ) || id_user=""

echo "\n3) List users"
curl "${CURL_OPTS[@]}" -i "${BASE_URL}/users" || true


echo "\n4) Create course"
resp_course=$(curl "${CURL_OPTS[@]}" -s -X POST "${BASE_URL}/courses" \
  -H "Content-Type: application/json" \
  -d '{"title":"Intro to Smoke Testing","description":"A short test course","slug":"intro-to-smoke-testing"}') || true
echo "$resp_course"

id_course=$(python3 -c 'import sys,json
try:
  j=json.load(sys.stdin)
  print(j.get("id", ""))
except Exception:
  print("")' <<<"${resp_course}" ) || id_course=""

echo "\n5) List courses"
curl "${CURL_OPTS[@]}" -i "${BASE_URL}/courses" || true


echo "\n6) Create lesson"
# Use the created course id if available, otherwise default to 1
use_course_id=${id_course:-1}
resp_lesson=$(curl "${CURL_OPTS[@]}" -s -X POST "${BASE_URL}/lessons" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Lesson 1\",\"content\":\"Lesson content\",\"courseId\":${use_course_id}}") || true
echo "$resp_lesson"

id_lesson=$(python3 -c 'import sys,json
try:
  j=json.load(sys.stdin)
  print(j.get("id", ""))
except Exception:
  print("")' <<<"${resp_lesson}" ) || id_lesson=""


echo "\n7) List lessons"
curl "${CURL_OPTS[@]}" -i "${BASE_URL}/lessons" || true


echo "\nSmoke test complete."
