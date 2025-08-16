#!/usr/bin/env zsh
# Simple smoke test runner for the Education API (zsh/bash compatible)
# Usage: ./tests/smoke_test.sh
# Assumes API is running at http://localhost:3000 and routes under /api

set -euo pipefail
BASE=${BASE:-http://localhost:3000/api}
JQ=$(command -v jq || true)
PASS=0
FAIL=0

run() {
  echo
  echo "==> $1"
  shift
  local cmd=("$@")
  echo "Command: ${cmd[*]}"
  local out
  if out=$(eval "${cmd[*]}" 2>&1); then
    echo "Response: $out"
    return 0
  else
    echo "Response/Error: $out"
    return 1
  fi
}

check_status() {
  local body="$1"
  local want=$2
  local code
  code=$(echo "$body" | tail -n1)
  # If response printed headers, try to extract numeric status line
  if [[ "$code" =~ HTTP/[0-9\.]+[[:space:]]([0-9]{3}) ]]; then
    code=${match[1]}
  fi
  if [[ "$code" == "$want" ]]; then
    return 0
  fi
  return 1
}

step_health() {
  echo "-- Health"
  echo "Command: curl -s -w \"\\n%{http_code}\n\" ${BASE}/health"
  body=$(curl -s -w "\n%{http_code}\n" "${BASE}/health" || true)
  echo "Response: $body"
  HTTP_STATUS=$(echo "$body" | tail -n1)
  if [[ "$HTTP_STATUS" == "200" ]]; then
    echo "PASS: health (200)"
    PASS=$((PASS+1))
  else
    echo "FAIL: health (expected 200) -> $HTTP_STATUS"
    FAIL=$((FAIL+1))
  fi
}

step_users() {
  echo "-- Users: create"
  echo "Command: curl -s -w '\n%{http_code}\n' -X POST ${BASE}/users -H 'Content-Type: application/json' -d '{"email":"smoke+user@example.com","name":"Smoke User"}'"
  body=$(curl -s -w "\n%{http_code}\n" -X POST "${BASE}/users" -H 'Content-Type: application/json' -d '{"email":"smoke+user@example.com","name":"Smoke User"}' || true)
  echo "Response: $body"
  HTTP_STATUS=$(echo "$body" | tail -n1)
  if [[ "$HTTP_STATUS" == "201" ]]; then
    echo "PASS: users create (201)"
    PASS=$((PASS+1))
  else
    echo "FAIL: users create (expected 201) -> $HTTP_STATUS"
    FAIL=$((FAIL+1))
  fi
  # optional field check
  if [[ -n "$JQ" ]]; then
    id=$(echo "$body" | sed '$d' | jq -r '.id // empty')
    email=$(echo "$body" | sed '$d' | jq -r '.email // empty')
    if [[ -n "$id" && -n "$email" ]]; then
      echo "Users fields OK: id=$id, email=$email"
    else
      echo "Users fields MISSING"
    fi
  fi

  echo "-- Users: list"
  echo "Command: curl -s -w '\n%{http_code}\n' ${BASE}/users"
  body=$(curl -s -w "\n%{http_code}\n" "${BASE}/users" || true)
  echo "Response: $body"
  HTTP_STATUS=$(echo "$body" | tail -n1)
  if [[ "$HTTP_STATUS" == "200" ]]; then
    echo "PASS: users list (200)"
    PASS=$((PASS+1))
  else
    echo "FAIL: users list (expected 200) -> $HTTP_STATUS"
    FAIL=$((FAIL+1))
  fi
}

step_courses() {
  echo "-- Courses: create"
  echo "Command: curl -s -w '\n%{http_code}\n' -X POST ${BASE}/courses -H 'Content-Type: application/json' -d '{\"title\":\"Smoke Course\",\"slug\":\"smoke-course\",\"description\":\"Smoke test\"}'"
  body=$(curl -s -w "\n%{http_code}\n" -X POST "${BASE}/courses" -H 'Content-Type: application/json' -d '{"title":"Smoke Course","slug":"smoke-course","description":"Smoke test"}' || true)
  echo "Response: $body"
  HTTP_STATUS=$(echo "$body" | tail -n1)
  course_id=""
  if [[ "$HTTP_STATUS" == "201" ]]; then
    echo "PASS: courses create (201)"
    PASS=$((PASS+1))
    if [[ -n "$JQ" ]]; then
      course_id=$(echo "$body" | sed '$d' | jq -r '.id // empty')
      echo "Captured course_id=$course_id"
    fi
  else
    echo "FAIL: courses create (expected 201) -> $status"
    FAIL=$((FAIL+1))
  fi

  echo "-- Courses: list"
  echo "Command: curl -s -w '\n%{http_code}\n' ${BASE}/courses"
  body=$(curl -s -w "\n%{http_code}\n" "${BASE}/courses" || true)
  echo "Response: $body"
  HTTP_STATUS=$(echo "$body" | tail -n1)
  if [[ "$HTTP_STATUS" == "200" ]]; then
    echo "PASS: courses list (200)"
    PASS=$((PASS+1))
  else
    echo "FAIL: courses list (expected 200) -> $HTTP_STATUS"
    FAIL=$((FAIL+1))
  fi

  echo "$course_id"
  export COURSE_ID="$course_id"
}

step_lessons() {
  echo "-- Lessons: create"
  COURSE_ID=${COURSE_ID:-}
  if [[ -z "$COURSE_ID" ]]; then
    echo "Warning: COURSE_ID is empty, you may need to set it manually from course create response"
  fi
  echo "Command: curl -s -w '\n%{http_code}\n' -X POST ${BASE}/lessons -H 'Content-Type: application/json' -d '{\"title\":\"Smoke Lesson\",\"courseId\":\"${COURSE_ID}\",\"content\":\"Smoke content\"}'"
  body=$(curl -s -w "\n%{http_code}\n" -X POST "${BASE}/lessons" -H 'Content-Type: application/json' -d "{\"title\":\"Smoke Lesson\",\"courseId\":\"${COURSE_ID}\",\"content\":\"Smoke content\"}" || true)
  echo "Response: $body"
  HTTP_STATUS=$(echo "$body" | tail -n1)
  if [[ "$HTTP_STATUS" == "201" ]]; then
    echo "PASS: lessons create (201)"
    PASS=$((PASS+1))
  else
    echo "FAIL: lessons create (expected 201) -> $HTTP_STATUS"
    FAIL=$((FAIL+1))
  fi

  echo "-- Lessons: list"
  echo "Command: curl -s -w '\n%{http_code}\n' ${BASE}/lessons"
  body=$(curl -s -w "\n%{http_code}\n" "${BASE}/lessons" || true)
  echo "Response: $body"
  HTTP_STATUS=$(echo "$body" | tail -n1)
  if [[ "$HTTP_STATUS" == "200" ]]; then
    echo "PASS: lessons list (200)"
    PASS=$((PASS+1))
  else
    echo "FAIL: lessons list (expected 200) -> $HTTP_STATUS"
    FAIL=$((FAIL+1))
  fi
}

main() {
  echo "Starting smoke tests against ${BASE}"
  step_health
  step_users
  step_courses
  step_lessons

  echo
  echo "Smoke test summary: PASS=$PASS, FAIL=$FAIL"
  if [[ $FAIL -gt 0 ]]; then
    echo "Some checks failed. Inspect responses above and server logs."
    return 1
  fi
  echo "All checks passed."
  return 0
}

main "$@"
