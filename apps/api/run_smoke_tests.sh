#!/usr/bin/env bash
set -euo pipefail

# run_smoke_tests.sh
# Self-contained smoke test runner for the Education API (http://localhost:3000 by default)
# Usage: ./run_smoke_tests.sh

BASE_URL="${BASE_URL:-http://localhost:3000/api}"
CURL="curl"
PYTHON="python3"

# Helpers
ok_count=0
fail_count=0

print_result() {
  local name="$1"
  local ok="$2"
  if [[ "$ok" -eq 0 ]]; then
    printf "[PASS] %s\n" "$name"
    ok_count=$((ok_count+1))
  else
    printf "[FAIL] %s\n" "$name"
    fail_count=$((fail_count+1))
  fi
}

http_status() {
  # $1 = method, $2 = endpoint, $3 = data (optional), $4 = content-type (optional)
  local method="$1" path="$2" data="${3:-}" ctype="${4:-application/json}"
  if [[ -n "$data" ]]; then
    "$CURL" -s -S -o /tmp/resp_body_$$ -w "%{http_code}" -X "$method" "$BASE_URL$path" -H "Content-Type: $ctype" -d "$data"
  else
    "$CURL" -s -S -o /tmp/resp_body_$$ -w "%{http_code}" -X "$method" "$BASE_URL$path"
  fi
}

resp_body() {
  cat /tmp/resp_body_$$ 2>/dev/null || true
}

extract_id() {
  # Attempt to extract 'id' from JSON using python3 if available
  local body
  body=$(resp_body)
  if command -v "$PYTHON" >/dev/null 2>&1; then
    echo "$body" | "$PYTHON" -c 'import sys,json
try:
  j=json.load(sys.stdin)
  if isinstance(j, list):
    print(j[0].get("id", ""))
  else:
    print(j.get("id", ""))
except Exception:
  print("")'
  else
    # fallback: try to grep a numeric id
    echo "$body" | grep -oE '"id"\s*:\s*[0-9]+' | head -1 | grep -oE '[0-9]+' || true
  fi
}

# 1) Health check
printf "\n== 1) Health check ==\n"
status=$(http_status GET "/health") || status=000
if [[ "$status" == "200" ]]; then
  print_result "Health check (GET /health)" 0
else
  printf "Response body:\n%s\n" "$(resp_body)"
  print_result "Health check (GET /health)" 1
fi

# 2) Create user
printf "\n== 2) Create user ==\n"
user_payload='{"email":"smoke+user@example.com","name":"Smoke User","password":"P@ssw0rd"}'
status=$(http_status POST "/users" "$user_payload") || status=000
if [[ "$status" == "201" || "$status" == "200" ]]; then
  u_id=$(extract_id)
  print_result "Create user (POST /users) -> HTTP $status" 0
  if [[ -n "$u_id" ]]; then
    printf "Created user id: %s\n" "$u_id"
  fi
else
  printf "Response body:\n%s\n" "$(resp_body)"
  print_result "Create user (POST /users) -> HTTP $status" 1
fi

# 3) List users
printf "\n== 3) List users ==\n"
status=$(http_status GET "/users") || status=000
if [[ "$status" == "200" ]]; then
  print_result "List users (GET /users)" 0
else
  printf "Response body:\n%s\n" "$(resp_body)"
  print_result "List users (GET /users)" 1
fi

# 4) Create course
printf "\n== 4) Create course ==\n"
course_payload='{"title":"Intro to Smoke Testing","description":"A short test course","slug":"intro-to-smoke-testing"}'
status=$(http_status POST "/courses" "$course_payload") || status=000
if [[ "$status" == "201" || "$status" == "200" ]]; then
  c_id=$(extract_id)
  print_result "Create course (POST /courses) -> HTTP $status" 0
  if [[ -n "$c_id" ]]; then
    printf "Created course id: %s\n" "$c_id"
  fi
else
  printf "Response body:\n%s\n" "$(resp_body)"
  print_result "Create course (POST /courses) -> HTTP $status" 1
fi

# 5) List courses
printf "\n== 5) List courses ==\n"
status=$(http_status GET "/courses") || status=000
if [[ "$status" == "200" ]]; then
  print_result "List courses (GET /courses)" 0
else
  printf "Response body:\n%s\n" "$(resp_body)"
  print_result "List courses (GET /courses)" 1
fi

# 6) Create lesson
printf "\n== 6) Create lesson ==\n"
# Use created course id if available, otherwise default to 1
use_course_id="${c_id:-1}"
lesson_payload="{\"title\":\"Lesson 1\",\"content\":\"Lesson content\",\"courseId\":${use_course_id}}"
status=$(http_status POST "/lessons" "$lesson_payload") || status=000
if [[ "$status" == "201" || "$status" == "200" ]]; then
  l_id=$(extract_id)
  print_result "Create lesson (POST /lessons) -> HTTP $status" 0
  if [[ -n "$l_id" ]]; then
    printf "Created lesson id: %s\n" "$l_id"
  fi
else
  printf "Response body:\n%s\n" "$(resp_body)"
  print_result "Create lesson (POST /lessons) -> HTTP $status" 1
fi

# 7) List lessons
printf "\n== 7) List lessons ==\n"
status=$(http_status GET "/lessons") || status=000
if [[ "$status" == "200" ]]; then
  print_result "List lessons (GET /lessons)" 0
else
  printf "Response body:\n%s\n" "$(resp_body)"
  print_result "List lessons (GET /lessons)" 1
fi

# Summary
printf "\n== Summary ==\n"
printf "Passed: %d\nFailed: %d\n" "$ok_count" "$fail_count"

# Cleanup temp file
rm -f /tmp/resp_body_$$

if [[ "$fail_count" -gt 0 ]]; then
  exit 1
else
  exit 0
fi
