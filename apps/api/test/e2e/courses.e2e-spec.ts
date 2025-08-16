/* End-to-end courses test
   Assumes the API is already running at http://localhost:3000 and uses the in-memory DB.
*/

process.env.USE_IN_MEMORY_DB = '1';

import request from 'supertest';

const BASE = process.env.BASE_URL || 'http://localhost:3000/api';

jest.setTimeout(20000);

describe('Courses e2e', () => {
  it('POST /api/courses -> 201 with id + title; GET /api/courses includes the title', async () => {
    const payload = { title: 'E2E Course', slug: 'e2e-course' };

    // create
    const postRes = await request(BASE)
      .post('/courses')
      .send(payload)
      .set('Content-Type', 'application/json')
      .timeout({ deadline: 10000 });

    expect(postRes.status).toBe(201);
    expect(postRes.body).toBeDefined();
    expect(postRes.body.id).toBeDefined();
    expect(postRes.body.title).toBe(payload.title);

    const createdId = postRes.body.id;

    // list
    const listRes = await request(BASE).get('/courses').timeout({ deadline: 10000 });
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);

    const found = listRes.body.find((c: any) => String(c.title) === payload.title || String(c.id) === String(createdId));
    expect(found).toBeTruthy();
  });
});
