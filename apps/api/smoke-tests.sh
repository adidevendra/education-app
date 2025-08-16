#!/usr/bin/env zsh
# smoke-tests.sh
# Sequential smoke tests for the API at http://localhost:3000/api
# Requirements:
# - zsh/bash compatible
# - uses curl + jq
# - prints ✅ PASSED or ❌ FAILED per endpoint
# - exits non-zero on any failure

BASE_URL="http://localhost:3000/api"
CURL_OPTS=(--silent --show-error --fail -H "Content-Type: application/json")

# Helper for printing status
ok() { echo "✅ PASSED - $1" }
fail() { echo "❌ FAILED - $1"; [ -n "$2" ] && echo "  $2" }

# Ensure jq is available
if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required but not found. Install jq and re-run."
  echo "macOS: brew install jq"
  echo "Ubuntu/Debian: sudo apt-get install -y jq"
  exit 2
fi

# Make a curl call and return body and status separately via globals
call_api() {
  local method=$1; shift
  local url=$1; shift
  local data=$1; shift || true

  # Use a unique delimiter so we can split body and status
  local DELIM=$'\n__CURL_STATUS__:'
  local resp

  if [[ -n "$data" ]]; then
    resp=$(curl "${CURL_OPTS[@]}" -X "$method" -d "$data" "$url" -w "$DELIM%{http_code}")
  else
    resp=$(curl "${CURL_OPTS[@]}" -X "$method" "$url" -w "$DELIM%{http_code}")
  fi

  http_status="${resp##*$DELIM}"
  body="${resp%$DELIM*}"
}

# Track overall status
EXIT_CODE=0

echo "Running smoke tests against $BASE_URL"

# 1) Health check
call_api GET "$BASE_URL/health"
if [[ "$http_status" -ge 200 && "$http_status" -lt 300 ]]; then
  ok "Health check GET /health"
else
  fail "Health check GET /health" "HTTP $http_status\n$body"
  EXIT_CODE=1
  exit $EXIT_CODE
fi

# 2) POST user
USER_PAYLOAD='{"name":"Smoke Test User","email":"smoke+test@example.com"}'
call_api POST "$BASE_URL/users" "$USER_PAYLOAD"
if [[ "$http_status" -ge 200 && "$http_status" -lt 300 ]]; then
  # extract id
  user_id=$(echo "$body" | jq -r '(.id // .data.id // .user.id) // empty')
  if [[ -z "$user_id" || "$user_id" == "null" ]]; then
    fail "POST /users - missing id in response" "HTTP $http_status\n$body"
    EXIT_CODE=1; exit $EXIT_CODE
  fi
  ok "POST /users (id=$user_id)"
else
  fail "POST /users" "HTTP $http_status\n$body"
  EXIT_CODE=1; exit $EXIT_CODE
fi

# 3) GET users
call_api GET "$BASE_URL/users"
if [[ "$http_status" -ge 200 && "$http_status" -lt 300 ]]; then
  ok "GET /users"
else
  fail "GET /users" "HTTP $http_status\n$body"
  EXIT_CODE=1; exit $EXIT_CODE
fi

# 4) POST course
COURSE_PAYLOAD='{"title":"Smoke Test Course","description":"Course created by smoke test"}'
call_api POST "$BASE_URL/courses" "$COURSE_PAYLOAD"
if [[ "$http_status" -ge 200 && "$http_status" -lt 300 ]]; then
  course_id=$(echo "$body" | jq -r '(.id // .data.id // .course.id) // empty')
  if [[ -z "$course_id" || "$course_id" == "null" ]]; then
    fail "POST /courses - missing id in response" "HTTP $http_status\n$body"
    EXIT_CODE=1; exit $EXIT_CODE
  fi
  ok "POST /courses (id=$course_id)"
else
  fail "POST /courses" "HTTP $http_status\n$body"
  EXIT_CODE=1; exit $EXIT_CODE
fi

# 5) GET courses
call_api GET "$BASE_URL/courses"
if [[ "$http_status" -ge 200 && "$http_status" -lt 300 ]]; then
  ok "GET /courses"
else
  fail "GET /courses" "HTTP $http_status\n$body"
  EXIT_CODE=1; exit $EXIT_CODE
fi

# 6) POST lesson (use course id)
LESSON_PAYLOAD=$(jq -n --arg title "Smoke Test Lesson" --arg cid "$course_id" '{title:$title, content:"Lesson created by smoke test", courseId:$cid}')
call_api POST "$BASE_URL/lessons" "$LESSON_PAYLOAD"
if [[ "$http_status" -ge 200 && "$http_status" -lt 300 ]]; then
  lesson_id=$(echo "$body" | jq -r '(.id // .data.id // .lesson.id) // empty')
  if [[ -z "$lesson_id" || "$lesson_id" == "null" ]]; then
    fail "POST /lessons - missing id in response" "HTTP $http_status\n$body"
    EXIT_CODE=1; exit $EXIT_CODE
  fi
  ok "POST /lessons (id=$lesson_id, courseId=$course_id)"
else
  fail "POST /lessons" "HTTP $http_status\n$body"
  EXIT_CODE=1; exit $EXIT_CODE
fi

# 7) GET lessons
call_api GET "$BASE_URL/lessons"
if [[ "$http_status" -ge 200 && "$http_status" -lt 300 ]]; then
  ok "GET /lessons"
else
  fail "GET /lessons" "HTTP $http_status\n$body"
  EXIT_CODE=1; exit $EXIT_CODE
fi

# All done
if [[ $EXIT_CODE -eq 0 ]]; then
  echo "\nAll smoke tests passed"
else
  echo "\nSmoke tests failed"
fi

exit $EXIT_CODE
