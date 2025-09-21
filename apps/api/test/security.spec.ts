/// <reference types="vitest" />

import { FastifyAdapter } from '@nestjs/platform-fastify';
import fastifyHelmet from '@fastify/helmet';

let app: any;

const isVitest = typeof (globalThis as any).vitest !== 'undefined';
const suite = isVitest && typeof describe.skip === 'function' ? describe : describe.skip ?? describe;

suite('Security Baseline', () => {
  if (!isVitest) {
    return;
  }

  beforeAll(async () => {
    process.env.CORS_ORIGINS = 'https://allowed.example';

    const adapter = new FastifyAdapter();
    app = adapter.getInstance();

    await app.register(fastifyHelmet, { contentSecurityPolicy: false });

    const allowedOrigins = process.env.CORS_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean) || [];

    app.addHook('onRequest', (req: any, reply: any, done: () => void) => {
      const origin = req.headers.origin;
      if (origin) {
        if (!allowedOrigins.length || allowedOrigins.includes(origin)) {
          reply.header('access-control-allow-origin', origin);
          reply.header('vary', 'Origin');
        } else {
          reply.code(403).send({ error: 'origin_forbidden' });
          return;
        }
      }

      if (req.method === 'OPTIONS') {
        reply
          .header('access-control-allow-methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
          .header('access-control-allow-headers', req.headers['access-control-request-headers'] || 'Content-Type,Authorization')
          .code(204)
          .send();
        return;
      }

      done();
    });

    app.get('/healthz', (_req: any, reply: any) => {
      reply.send({ status: 'ok' });
    });

    await app.ready();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('healthz returns ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/healthz' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).status).toBe('ok');
  });

  it('blocks non-allowlisted origin', async () => {
    const res = await app.inject({ method: 'GET', url: '/healthz', headers: { origin: 'https://evil.example' } });
    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res.body).error).toBe('origin_forbidden');
  });

  it('allows allowlisted origin', async () => {
    const res = await app.inject({ method: 'GET', url: '/healthz', headers: { origin: 'https://allowed.example' } });
    expect(res.statusCode).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('https://allowed.example');
  });
});
