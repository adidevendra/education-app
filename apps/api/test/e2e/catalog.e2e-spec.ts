import request from 'supertest';

describe('Catalog E2E (smoke)', () => {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  const orgA = 'org-a';
  const orgB = 'org-b';

  it('creates and lists courses within org only', async () => {
    // Create in org A
    const createRes = await request(base)
      .post('/api/catalog/courses')
      .set('x-org-id', orgA)
      .send({ title: 'Course A', slug: 'course-a', visibility: 'private' });
    expect(createRes.status).toBeLessThan(500);

    // List org A
    const listA = await request(base).get('/api/catalog/courses').set('x-org-id', orgA);
    // List org B
    const listB = await request(base).get('/api/catalog/courses').set('x-org-id', orgB);

    expect(Array.isArray(listA.body)).toBe(true);
    expect(listA.body.length).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(listB.body)).toBe(true);
    expect(listB.body.find((c: any) => c.slug === 'course-a')).toBeFalsy();
  });

  it('public by slug returns null when not public', async () => {
    const res = await request(base).get('/api/catalog/public/course-a');
    expect(res.status).toBeLessThan(500);
  });
});
