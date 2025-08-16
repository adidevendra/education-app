/* End-to-end lessons test
   Assumes the API is already running at http://localhost:3000 and uses the in-memory DB.
*/

process.env.USE_IN_MEMORY_DB = '1';

import request from 'supertest';

const BASE = process.env.BASE_URL || 'http://localhost:3000/api';

jest.setTimeout(20000);

describe('Lessons e2e', () => {
  it('creates a course, creates a lesson for that course, and lists includes the lesson', async () => {
    // create course
    const coursePayload = { title: 'E2E Course for Lessons', slug: 'e2e-course-lessons' };

    const courseRes = await request(BASE)
      .post('/courses')
      .send(coursePayload)
      .set('Content-Type', 'application/json')
      .timeout({ deadline: 10000 });

    expect(courseRes.status).toBe(201);
    expect(courseRes.body).toBeDefined();
    expect(courseRes.body.id).toBeDefined();
    expect(courseRes.body.title).toBe(coursePayload.title);

    const courseId = courseRes.body.id;

    // create lesson pointing to courseId
    const lessonPayload = { title: 'E2E Lesson 1', content: 'Lesson content', courseId };

    const lessonRes = await request(BASE)
      .post('/lessons')
      .send(lessonPayload)
      .set('Content-Type', 'application/json')
      .timeout({ deadline: 10000 });

    expect(lessonRes.status).toBe(201);
    expect(lessonRes.body).toBeDefined();
    expect(lessonRes.body.id).toBeDefined();
    expect(lessonRes.body.title).toBe(lessonPayload.title);
    expect(lessonRes.body.courseId).toBe(String(courseId));

    const createdLessonId = lessonRes.body.id;

    // list lessons and verify
    const listRes = await request(BASE).get('/lessons').timeout({ deadline: 10000 });
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);

    const found = listRes.body.find((l: any) => String(l.id) === String(createdLessonId) || l.title === lessonPayload.title);
    expect(found).toBeTruthy();
    if (found) {
      expect(found.courseId).toBe(String(courseId));
    }
  });
});
