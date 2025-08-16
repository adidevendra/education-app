# API Smoke Tests — One-page Checklist

Run these commands from the server where the API is reachable (default: http://localhost:3000). Copy-paste each command. After any POST that returns `201`, capture the returned `id` and reuse for dependent steps (lesson creation).

1) Health — sanity

```bash
curl -i http://localhost:3000/api/health
```
✅ Expected: HTTP 200
✅ Minimal JSON: {"status":"ok", ...} (timestamp/version optional)

2) Users — create (POST)

```bash
curl -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke+user@example.com","name":"Smoke User"}'
```
✅ Expected: HTTP 201
✅ Minimal JSON: contains `id` and `email`

3) Users — list (GET)

```bash
curl -i http://localhost:3000/api/users
```
✅ Expected: HTTP 200
✅ Minimal JSON: array or object containing entries with `id` and `email`

4) Courses — create (POST)

```bash
curl -i -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"title":"Smoke Course","slug":"smoke-course","description":"Smoke test"}'
```
✅ Expected: HTTP 201
✅ Minimal JSON: contains `id` and `title`

5) Courses — list (GET)

```bash
curl -i http://localhost:3000/api/courses
```
✅ Expected: HTTP 200
✅ Minimal JSON: array or object containing entries with `id` and `title`

6) Lessons — create (POST)

- Replace `<COURSE_ID>` with the `id` returned from step 4 (or use a known existing course id):

```bash
curl -i -X POST http://localhost:3000/api/lessons \
  -H "Content-Type: application/json" \
  -d '{"title":"Smoke Lesson","courseId":"<COURSE_ID>","content":"Smoke content"}'
```
✅ Expected: HTTP 201
✅ Minimal JSON: contains `id`, `title`, `courseId`

7) Lessons — list (GET)

```bash
curl -i http://localhost:3000/api/lessons
```
✅ Expected: HTTP 200
✅ Minimal JSON: array or object containing entries with `id`, `title`, `courseId`

---

Quick notes

- Run API in quick in-memory mode for smoke testing:

```bash
cd /path/to/repo/apps/api
USE_IN_MEMORY_DB=1 PORT=3000 npm run dev
```

- How to capture IDs from responses
  - If `jq` is available, you can extract id from the create response like:

```bash
# example: create course and capture id
COURSE_ID=$(curl -s -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"title":"Smoke Course","slug":"smoke-course"}' | jq -r '.id')
```

- If `jq` is not available, run the POST and copy the returned JSON `id` manually.

- If endpoints return 404: ensure you started the API from `apps/api` and the global prefix (`/api`) is active.

---

This page is intentionally short and focused on copy-paste commands for manual smoke testing.
