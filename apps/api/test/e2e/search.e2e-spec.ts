import request from 'supertest';

describe('Search Reindex (admin only)', () => {
  const base = process.env.BASE_URL || 'http://localhost:3000';

  it('rejects unauthenticated', async () => {
    const res = await request(base).post('/api/v1/search/reindex');
    expect(res.status).toBeGreaterThanOrEqual(401);
  });
});
