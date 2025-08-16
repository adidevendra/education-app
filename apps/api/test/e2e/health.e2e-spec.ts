/* End-to-end health check
   These tests assume the API is already running on http://localhost:3000
   and are intended to be run with USE_IN_MEMORY_DB=1 so they don't require a real DB.
*/

process.env.USE_IN_MEMORY_DB = '1';

import request from 'supertest';

const BASE = process.env.BASE_URL || 'http://localhost:3000/api';

jest.setTimeout(10000);

describe('Health endpoint (e2e)', () => {
  it('GET /api/health should return 200 and { status: "ok" }', async () => {
    const res = await request(BASE).get('/health').timeout({ deadline: 8000 });
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body.status).toBe('ok');
  });
});
