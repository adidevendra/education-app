import { describe, it, expect } from '@jest/globals';
import request from 'supertest';

describe('Users (e2e)', () => {
  it('GET /api/users', async () => {
    const res = await request('http://localhost:3000').get('/api/users');
    expect(res.status).toBe(200);
  });
});
