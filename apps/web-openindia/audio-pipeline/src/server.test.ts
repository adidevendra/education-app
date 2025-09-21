import request from 'supertest';
import app from './server';

describe('server', () => {
  it('responds 400 without payload', async () => {
    const res = await request(app).post('/synthesize').send({});
    expect(res.status).toBe(400);
  });
});
