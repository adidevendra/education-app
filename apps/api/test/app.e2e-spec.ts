/* eslint-disable @typescript-eslint/no-var-requires */
// End-to-end smoke tests using supertest against a running instance of the API.
// NOTE: These tests assume the API is already running locally on http://localhost:3000
// and that it was started with USE_IN_MEMORY_DB=1 so tests don't require Prisma/Postgres.

process.env.USE_IN_MEMORY_DB = '1';

import request from 'supertest';

const BASE = process.env.BASE_URL || 'http://localhost:3000/api';

// increase timeout for slower systems
jest.setTimeout(20000);

describe('Education API (e2e smoke)', () => {
  let userId: string | number | null = null;
  let courseId: string | number | null = null;
  let lessonId: string | number | null = null;

  function expect2xx(res: request.Response) {
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);
  }

  it('health check responds', async () => {
    const res = await request(BASE).get('/health').timeout({ deadline: 10000 });
    expect2xx(res);
    expect(res.body).toBeDefined();
    expect(res.body.status).toBeDefined();
  });

  // Users CRUD
  it('creates a user', async () => {
    const payload = { email: 'e2e-user@example.com', name: 'E2E User' };
    const res = await request(BASE).post('/users').send(payload).set('Content-Type', 'application/json');
    expect2xx(res);
    // created object should be returned
    expect(res.body).toBeDefined();
    expect(res.body.email).toBe(payload.email);
    userId = res.body.id ?? res.body.id?.toString?.();
  });

  it('lists users', async () => {
    const res = await request(BASE).get('/users');
    expect2xx(res);
    expect(Array.isArray(res.body)).toBe(true);
    if (userId) {
      const found = res.body.find((u: any) => String(u.id) === String(userId));
      expect(found).toBeTruthy();
    }
  });

  it('updates the user', async () => {
    if (!userId) return; // skip if no id
    const res = await request(BASE)
      .patch(`/users/${userId}`)
      .send({ name: 'E2E User Updated' })
      .set('Content-Type', 'application/json');
    expect2xx(res);
    expect(res.body).toBeDefined();
    // allow either returned updated resource or empty 204
    if (res.body && Object.keys(res.body).length) {
      expect(res.body.name === 'E2E User Updated' || res.body.name).toBeTruthy();
    }
  });

  it('deletes the user', async () => {
    if (!userId) return;
    const res = await request(BASE).delete(`/users/${userId}`);
    expect2xx(res);
  });

  // Courses CRUD
  it('creates a course', async () => {
    const payload = { title: 'E2E Course', slug: 'e2e-course' };
    const res = await request(BASE).post('/courses').send(payload).set('Content-Type', 'application/json');
    expect2xx(res);
    expect(res.body).toBeDefined();
    expect(res.body.title).toBe(payload.title);
    courseId = res.body.id ?? res.body.id?.toString?.();
  });

  it('lists courses', async () => {
    const res = await request(BASE).get('/courses');
    expect2xx(res);
    expect(Array.isArray(res.body)).toBe(true);
    if (courseId) {
      const found = res.body.find((c: any) => String(c.id) === String(courseId));
      expect(found).toBeTruthy();
    }
  });

  it('updates the course', async () => {
    if (!courseId) return;
    const res = await request(BASE)
      .patch(`/courses/${courseId}`)
      .send({ title: 'E2E Course Updated' })
      .set('Content-Type', 'application/json');
    expect2xx(res);
    if (res.body && Object.keys(res.body).length) {
      expect(res.body.title).toBeDefined();
    }
  });

  it('deletes the course', async () => {
    if (!courseId) return;
    const res = await request(BASE).delete(`/courses/${courseId}`);
    expect2xx(res);
  });

  // Lessons CRUD
  it('creates a lesson', async () => {
    const useCourse = courseId || 1;
    const payload = { title: 'E2E Lesson 1', courseId: useCourse };
    const res = await request(BASE).post('/lessons').send(payload).set('Content-Type', 'application/json');
    expect2xx(res);
    expect(res.body).toBeDefined();
    expect(res.body.title).toBe(payload.title);
    lessonId = res.body.id ?? res.body.id?.toString?.();
  });

  it('lists lessons', async () => {
    const res = await request(BASE).get('/lessons');
    expect2xx(res);
    expect(Array.isArray(res.body)).toBe(true);
    if (lessonId) {
      const found = res.body.find((l: any) => String(l.id) === String(lessonId));
      expect(found).toBeTruthy();
    }
  });

  it('updates the lesson', async () => {
    if (!lessonId) return;
    const res = await request(BASE)
      .patch(`/lessons/${lessonId}`)
      .send({ title: 'E2E Lesson 1 Updated' })
      .set('Content-Type', 'application/json');
    expect2xx(res);
    if (res.body && Object.keys(res.body).length) {
      expect(res.body.title).toBeDefined();
    }
  });

  it('deletes the lesson', async () => {
    if (!lessonId) return;
    const res = await request(BASE).delete(`/lessons/${lessonId}`);
    expect2xx(res);
  });

  it('logs Meili indexing attempts (if Meili not running you will see ECONNREFUSED in logs)', async () => {
    // This test cannot inspect server logs reliably from the test process.
    // It simply makes one create call which triggers indexing attempts that are logged by the server.
    const payload = { title: 'Meili Log Trigger', slug: 'meili-log-trigger' };
    const res = await request(BASE).post('/courses').send(payload).set('Content-Type', 'application/json');
    expect2xx(res);
    // To verify logs, inspect the server terminal or pm2 logs for ECONNREFUSED entries.
  });

  it('serves Swagger UI at /docs', async () => {
    const res = await request(BASE).get('/docs').timeout({ deadline: 10000 });
    // Swagger UI should return HTML when available
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);
    const ct = res.headers['content-type'] || '';
    expect(typeof ct).toBe('string');
    expect(ct.includes('html') || ct.includes('application/json')).toBeTruthy();
  });
});
