## Smoke tests (curl)

Quick curl commands to verify the API is responding. These assume the API is reachable at http://localhost:3000 and the routes are mounted under `/api`.

Health

```bash
curl -i http://localhost:3000/api/health
```

Users

```bash
curl -i http://localhost:3000/api/users
```

Courses

```bash
curl -i http://localhost:3000/api/courses
```

Lessons

```bash
curl -i http://localhost:3000/api/lessons
```

Notes


```bash
USE_IN_MEMORY_DB=1 npm run dev
```


```bash
pm2 start ecosystem.config.js
pm2 save
```

If your server is not on port 3000 or the API prefix differs, update the URLs accordingly.

### Running the bundled smoke test script

There's a convenience script `smoke-test.sh` in this folder that runs the main smoke checks sequentially (health, create/list users, create/list courses, create/list lessons).

Make sure the API is running on `http://localhost:3000`, then run:

```bash
./smoke-test.sh
```

The script is executable. It attempts to parse returned JSON for created resource IDs using `python3`; if Python isn't available it will still run the curl commands but won't chain IDs automatically.
# API Smoke Test Plan (in-memory mode)

This document describes a full end-to-end smoke test plan for the Education API running in in-memory mode.

- Location: `apps/api/TESTING.md`
- Quick start: run the API with `USE_IN_MEMORY_DB=1` so tests run against the in-memory mock data store.

---

## Prerequisites

- Node + npm installed on the machine.
- From the `apps/api` folder run the API in in-memory mode:

```bash
# Option A (recommended if you added the convenience script)
npm run dev:oracle

# Option B (simple env prefix, zsh)
USE_IN_MEMORY_DB=1 PORT=3000 npm run dev
```

- The app should be listening on `http://localhost:3000` (default port 3000).
- If you used `pm2` to run the server, logs can be inspected via `pm2 logs <name>`; otherwise watch the terminal where the server runs.

---

## Health check

Simple sanity check to confirm the server is up:

```bash
curl --max-time 10 -i http://localhost:3000/api/health
```

Expected: HTTP 200 with a small JSON body like `{"status":"ok","timestamp":"..."}`.

---

## User CRUD
```bash
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

List users

```bash
curl --max-time 10 -i http://localhost:3000/api/users
```

Update user (patch name)

```bash
curl --max-time 10 -i -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'
```

Delete user

```bash
curl --max-time 10 -i -X DELETE http://localhost:3000/api/users/1
```

Notes: the in-memory implementation returns created objects with an `id` field; use the returned `id` when updating/deleting if not `1`.

---

## Course CRUD

Create a course (note: DTO requires `slug` in current controllers — include a simple slug)

```bash
curl --max-time 10 -i -X POST http://localhost:3000/api/courses \
```

List courses

```bash
curl --max-time 10 -i http://localhost:3000/api/courses
```

Update course

```bash
curl --max-time 10 -i -X PATCH http://localhost:3000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Intro to Copilot - Updated"}'
```

Delete course

```bash
curl --max-time 10 -i -X DELETE http://localhost:3000/api/courses/1
```

---

## Lesson CRUD

Create a lesson (linked to course id)

```bash
curl --max-time 10 -i -X POST http://localhost:3000/api/lessons \
  -H "Content-Type: application/json" \
  -d '{"title":"Lesson 1","courseId":1}'
```

List lessons

```bash
curl --max-time 10 -i http://localhost:3000/api/lessons
```

Update lesson

```bash
curl --max-time 10 -i -X PATCH http://localhost:3000/api/lessons/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Lesson 1 - Updated"}'
```

Delete lesson

```bash
curl --max-time 10 -i -X DELETE http://localhost:3000/api/lessons/1
```

---

## Meilisearch logging note

- The code attempts to index courses and lessons in Meilisearch after create/update operations. Indexing failures are caught and logged, so DB writes still succeed in in-memory mode.
- If no Meilisearch instance is running (default expected port `7700`), you should see a log warning with an `ECONNREFUSED` error printed by the server. Example (approx):

```
WARN  Meili indexing failed for course  { code: 'ECONNREFUSED', errno: 'ECONNREFUSED', syscall: 'connect', address: '127.0.0.1', port: 7700 }
```

- To inspect logs:
  - If running in foreground: watch the terminal where `npm run dev`/`npm run dev:oracle` is running.
  - If running with `pm2`:

```bash
pm2 logs education-api-inmem --lines 200 | grep -Ei 'meili|econrefused'
```

Expected behaviour: API returns success responses (201/200/204) and log contains Meili `ECONNREFUSED` warning lines if Meili isn't available.

---

## One-shot zsh script (copy-paste)

This script runs the full flow and attempts to capture returned IDs. It assumes `python3` is available for quick JSON parsing.

Copy and paste into your zsh terminal while the API is running:

```zsh
#!/usr/bin/env zsh
set -euo pipefail

BASE='http://localhost:3000/api'

echo "1) Health check"
curl --max-time 10 -i "${BASE}/health"
echo
sleep 0.3

echo "2) Create user"
resp_user=$(curl --max-time 10 -s -X POST "${BASE}/users" \
  -H "Content-Type: application/json" \
  -d '{"email":"meili-test@example.com","name":"Meili Test"}')
echo "Response: $resp_user"
id_user=$(python3 -c 'import sys,json;print(json.load(sys.stdin).get("id",""))' <<<"$resp_user")
echo "Created user id: $id_user"
echo
sleep 0.3

echo "3) List users"
curl --max-time 10 -i "${BASE}/users"
echo
sleep 0.3

echo "4) Update user"
if [[ -z "$id_user" ]]; then
  echo "No user id; skipping update"
else
  curl --max-time 10 -i -X PATCH "${BASE}/users/${id_user}" \
    -H "Content-Type: application/json" \
    -d '{"name":"Meili Test Updated"}'
fi
echo
sleep 0.3

echo "5) Delete user"
if [[ -z "$id_user" ]]; then
  echo "No user id; skipping delete"
else
  curl --max-time 10 -i -X DELETE "${BASE}/users/${id_user}"
fi
echo
sleep 0.3

echo "6) Create course (includes slug)"
resp_course=$(curl --max-time 10 -s -X POST "${BASE}/courses" \
  -H "Content-Type: application/json" \
  -d '{"title":"Intro to Meili Test","slug":"intro-to-meili-test"}')
echo "Response: $resp_course"
id_course=$(python3 -c 'import sys,json;print(json.load(sys.stdin).get("id",""))' <<<"$resp_course")
echo "Created course id: $id_course"
echo
sleep 0.3

echo "7) List courses"
curl --max-time 10 -i "${BASE}/courses"
echo
sleep 0.3

echo "8) Update course"
if [[ -z "$id_course" ]]; then
  echo "No course id; skipping update"
else
  curl --max-time 10 -i -X PATCH "${BASE}/courses/${id_course}" \
    -H "Content-Type: application/json" \
    -d '{"title":"Intro to Meili Test - Updated"}'
fi
echo
sleep 0.3

echo "9) Delete course"
if [[ -z "$id_course" ]]; then
  echo "No course id; skipping delete"
else
  curl --max-time 10 -i -X DELETE "${BASE}/courses/${id_course}"
fi
echo
sleep 0.3

echo "10) Create lesson (linked to the created course)"
use_course_id="${id_course:-1}"
resp_lesson=$(curl --max-time 10 -s -X POST "${BASE}/lessons" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Lesson 1\",\"courseId\":\"${use_course_id}\"}")
echo "Response: $resp_lesson"
id_lesson=$(python3 -c 'import sys,json;print(json.load(sys.stdin).get("id",""))' <<<"$resp_lesson")
echo "Created lesson id: $id_lesson"
echo
sleep 0.3

echo "11) List lessons"
curl --max-time 10 -i "${BASE}/lessons"
echo
sleep 0.3

echo "12) Update lesson"
if [[ -z "$id_lesson" ]]; then
  echo "No lesson id; skipping update"
else
  curl --max-time 10 -i -X PATCH "${BASE}/lessons/${id_lesson}" \
    -H "Content-Type: application/json" \
    -d '{"title":"Lesson 1 - Updated"}'
fi
echo
sleep 0.3

echo "13) Delete lesson"
if [[ -z "$id_lesson" ]]; then
  echo "No lesson id; skipping delete"
else
  curl --max-time 10 -i -X DELETE "${BASE}/lessons/${id_lesson}"
fi
echo
sleep 0.3

echo "14) Confirm Meilisearch indexing logs (ECONNREFUSED expected if Meili not running)"
if command -v pm2 >/dev/null 2>&1 && pm2 list | grep -q education-api-inmem; then
  echo "Checking pm2 logs for 'meili' or 'ECONNREFUSED' (last 200 lines)..."
  pm2 logs education-api-inmem --lines 200 | grep -Ei 'meili|econrefused' || echo "No matching pm2 log lines found."
else
  echo "pm2 not used or process not found; check the server terminal output for 'Meili' or 'ECONNREFUSED' warnings."
fi

echo "Done."
```

---

## Troubleshooting

- If a curl command times out or you get a connection refused: confirm the server is running and listening on port 3000 and that `USE_IN_MEMORY_DB=1` was set.
- If JSON parsing in the one-shot script fails, ensure `python3` is available, or replace parsing with `jq` if you prefer.
- If you want the tests to target a running Postgres/Prisma setup instead of in-memory, start the DB and set `DATABASE_URL` appropriately; note that real DB tests will be slower and require migrations.

---

## Logs and Monitoring

When the API is started with PM2 (for example `pm2 start ecosystem.config.js`) you can use the following commands to monitor and control the `education-api` process:

- View logs (stream stdout/stderr):

```bash
pm2 logs education-api
```

- Restart the app:

```bash
pm2 restart education-api
```

- Stop the app:

```bash
pm2 stop education-api
```

- List PM2-managed processes and status:

```bash
pm2 list
# or
pm2 status
```

Tips:

- To limit output when viewing logs, add `--lines N` to `pm2 logs` (e.g. `pm2 logs education-api --lines 200`).
- Use `pm2 monit` for a lightweight monitoring dashboard.
- If PM2 isn't installed on your machine, install it with `npm install -g pm2` and then run `pm2 start ecosystem.config.js` from the `apps/api` folder.

## Load testing (autocannon)

A lightweight HTTP load test script is included at `./load_test.sh`. It uses `autocannon` (via `npx`) and by default targets the health endpoint at `http://localhost:3000/api/health` with 100 requests/sec for 10 seconds.

Usage

- Run with defaults (100 rps, 10s):

```bash
./load_test.sh
```

- Provide a different target and/or rate and duration:

```bash
# TARGET RATE DURATION
./load_test.sh http://localhost:3000/api/health 100 10
```

- Save machine-readable JSON output for later analysis:

```bash
# direct autocannon JSON output to a file
npx autocannon -R 100 -d 10 -j "http://localhost:3000/api/health" > load_test_result.json
```

Notes

- `npx` will download `autocannon` transiently if it's not installed globally; no global install is required.
- If the server isn't running you'll get connection errors — start the API first (for in-memory quick tests use `USE_IN_MEMORY_DB=1 npm run dev`).
- For more realistic load tests, run the load generator from a different machine than the server to avoid client-side CPU/connection limits.

How to interpret results

Key fields in the human-friendly autocannon output (and in the JSON):

- requests/sec (RPS): how many requests per second were achieved. Compare this to your target (100). If achieved RPS is consistently below target the server (or client machine) is saturated.
- Latency (ms): typically shown as average and percentiles (p50, p95, p99). Lower is better. p95/p99 show tail latency experienced by most/rare requests.
- errors / non2xx: any non-2xx responses or socket/timeout errors indicate problems. Investigate server logs when these appear.
- throughput (bytes/sec): bandwidth used by the responses.
- duration / sockets: shows connections used. A high number of open sockets or many socket errors can indicate connection exhaustion.

Common interpretations and next steps

- High p99 but low p50/p95: a small fraction of requests suffer high latency (tail latency). Investigate long-running handlers, DB slow queries, or blocking work.
- Many errors or timeouts: check server logs for stack traces, look at resource usage (CPU/memory), and verify DB/Meili availability.
- Achieved RPS < target: try increasing client concurrency (`-c` in autocannon) or move the load generator off the same host. Also monitor server CPU and event-loop latency.

Quick example workflow

1. Start the API (in-memory mode for quick testing):

```bash
USE_IN_MEMORY_DB=1 PORT=3000 npm run dev
```

2. In another terminal, run the load test:

```bash
./load_test.sh http://localhost:3000/api/health 100 10
```

3. If you need JSON for CI or dashboards:

```bash
npx autocannon -R 100 -d 10 -j "http://localhost:3000/api/health" > load_test_result.json
# inspect
cat load_test_result.json | jq '.'
```

If you'd like, I can also add an npm script that runs the test (for example `npm run loadtest`) or add a JSON-based CI job that fails when errors are observed.
