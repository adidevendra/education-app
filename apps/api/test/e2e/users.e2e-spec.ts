/* End-to-end users smoke test
   Assumes the API is already running at http://localhost:3000 and uses the in-memory DB.
*/

process.env.USE_IN_MEMORY_DB = '1';

import request from 'supertest';

const BASE = process.env.BASE_URL || 'http://localhost:3000/api';

jest.setTimeout(20000);

describe('Users e2e', () => {
  it('POST /api/users -> 201 and returns id/email; GET /api/users includes that user', async () => {
    const payload = { email: 'e2e-user@example.com', name: 'E2E User' };

    // create
    const postRes = await request(BASE)
      .post('/users')
      .send(payload)
      .set('Content-Type', 'application/json')
      .timeout({ deadline: 10000 });

    expect(postRes.status).toBe(201);
    expect(postRes.body).toBeDefined();
    expect(postRes.body.id).toBeDefined();
    expect(postRes.body.email).toBe(payload.email);

    const createdId = postRes.body.id;

    // list
    const listRes = await request(BASE).get('/users').timeout({ deadline: 10000 });
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);

    const found = listRes.body.find((u: any) => String(u.email) === payload.email || String(u.id) === String(createdId));
    expect(found).toBeTruthy();
  });
});
