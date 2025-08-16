# SMOKE TESTS

Quick, copy-paste curl commands to smoke-test the API on http://localhost:3000 (assumes routes are under `/api`).

Important: adjust IDs if your DB already has entries. For a quick local/dev run, you can start the server with the in-memory DB: `USE_IN_MEMORY_DB=1 npm run dev`.

---

## 1) Health

```bash
curl -i http://localhost:3000/api/health
```

## 2) Users — Create and List

# Create a user (replace fields if your API requires different attributes)
```bash
curl -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke+user1@example.com","name":"Smoke User","password":"P@ssw0rd"}'
```

# List all users
```bash
curl -i http://localhost:3000/api/users
```

## 3) Courses — Create and List

# Create a course
```bash
curl -i -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"title":"Intro to Smoke Testing","description":"A short test course"}'
```

# List all courses
```bash
curl -i http://localhost:3000/api/courses
```

## 4) Lessons — Create and List

# Create a lesson. Replace COURSE_ID with an actual course id from the courses list (e.g. 1).
```bash
curl -i -X POST http://localhost:3000/api/lessons \
  -H "Content-Type: application/json" \
  -d '{"title":"Lesson 1","content":"Lesson content","courseId":1}'
```

# List all lessons
```bash
curl -i http://localhost:3000/api/lessons
```

---

Optional: if you have `jq` installed and want to create a course then immediately use its id for lesson creation, you can chain commands like this:

```bash
# Create a course and capture the id
COURSE_ID=$(curl -s -X POST http://localhost:3000/api/courses -H "Content-Type: application/json" -d '{"title":"Chained Course","description":"temp"}' | jq -r '.id')

# Create a lesson attached to the new course
curl -i -X POST http://localhost:3000/api/lessons -H "Content-Type: application/json" -d "{\"title\":\"Chained Lesson\",\"content\":\"x\",\"courseId\":${COURSE_ID}}"
```

If endpoints differ (for example no `/api` prefix), adjust URLs accordingly.

## Logs

When you run the API under PM2 you can tail real-time logs with:

```bash
pm2 logs education-api
```

To limit output to the last N lines, use the `--lines` flag:

```bash
pm2 logs education-api --lines 200
```

If you want to filter logs for errors or warnings, pipe the output to `grep`. For example:

```bash
pm2 logs education-api --lines 200 | grep -Ei "error|warn|exception|trace|ec*onrefused"
```

Or to follow logs and show only error lines in real-time:

```bash
pm2 logs education-api | grep -Ei --line-buffered "error|warn|exception|ec*onrefused"
```

Notes:
- Use `pm2 status` or `pm2 list` to confirm the process name is `education-api`.
- `ec*onrefused` is a loose match to capture `ECONNREFUSED` variants that appear in some logs.
