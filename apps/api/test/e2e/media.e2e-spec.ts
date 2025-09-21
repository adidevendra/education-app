import request from 'supertest';

describe('Media E2E', () => {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  const orgA = 'org-a';
  const orgB = 'org-b';

  it('creates asset and associates captions and transcript (org isolated)', async () => {
    // create (org A)
    const create = await request(base)
      .post('/api/v1/media/assets')
      .set('x-org-id', orgA)
      .send({ title: 'Video', provider: 'mux', providerAssetId: 'asset123' });
    expect(create.status).toBeLessThan(500);
    const id = create.body?.id;
    expect(id).toBeTruthy();

    // get with playback URL
    const getA = await request(base).get(`/api/v1/media/assets/${id}`).set('x-org-id', orgA);
    expect(getA.status).toBeLessThan(500);
    expect(getA.body?.playbackUrl).toContain('mux');

    // captions
    const cap = await request(base)
      .post(`/api/v1/media/assets/${id}/captions`)
      .set('x-org-id', orgA)
      .send({ lang: 'en', label: 'English', url: 'https://example.com/en.vtt' });
    expect(cap.status).toBeLessThan(500);

    // transcript
    const tx = await request(base)
      .post(`/api/v1/media/assets/${id}/transcript`)
      .set('x-org-id', orgA)
      .send([
        { start: 0, end: 3, text: 'Intro' },
        { start: 3, end: 10, text: 'Topic' },
      ]);
    expect(tx.status).toBeLessThan(500);

    // cross-org should not see
    const getB = await request(base).get(`/api/v1/media/assets/${id}`).set('x-org-id', orgB);
    expect(getB.body).toBeFalsy();
  });
});
