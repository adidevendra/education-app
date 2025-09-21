import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyHelmet from '@fastify/helmet';
import * as Sentry from '@sentry/node';
import { startOtel } from './otel';
import { ZodError } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  // OpenTelemetry
  try { await startOtel(); } catch {}

  const adapter = new FastifyAdapter({ logger: false });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix('api', { exclude: [{ path: 'certs/:id', method: RequestMethod.GET }] });

  // Helmet security headers
  await app.register(fastifyHelmet, { contentSecurityPolicy: false });

  // Strict CORS allowlist; reject non-allowed origins with 403
  const allowedOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
  app.getHttpAdapter().getInstance().addHook('onRequest', (req: any, reply: any, done: any) => {
    const origin = req.headers.origin;
    if (origin) {
      if (!allowedOrigins.length || allowedOrigins.includes(origin)) {
        reply.header('Access-Control-Allow-Origin', origin);
        reply.header('Vary', 'Origin');
      } else {
        reply.code(403).send({ error: 'origin_forbidden' });
        return; // stop further processing
      }
    }
    if (req.method === 'OPTIONS') {
      reply
        .header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
        .header('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || 'Content-Type,Authorization')
        .code(204)
        .send();
      return;
    }
    done();
  });

  // Path-scoped simple per-IP rate limiting for /auth and /jobs
  const limitRps = parseInt(process.env.RATE_LIMIT_RPS || '10', 10);
  interface Bucket { count: number; reset: number }
  const buckets = new Map<string, Bucket>();
  const windowMs = 1000;
  app.getHttpAdapter().getInstance().addHook('onRequest', (req: any, reply: any, done: any) => {
    const url: string = req.url || '';
    if (url.startsWith('/auth') || url.startsWith('/jobs')) {
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';
      const now = Date.now();
      let bucket = buckets.get(ip);
      if (!bucket || bucket.reset < now) {
        bucket = { count: 0, reset: now + windowMs };
        buckets.set(ip, bucket);
      }
      bucket.count++;
      if (bucket.count > limitRps) {
        reply.code(429).header('Retry-After', Math.ceil((bucket.reset - now) / 1000)).send({ error: 'rate_limited' });
        return;
      }
    }
    done();
  });

  // Lightweight /healthz endpoint (distinct from /api/health)
  let version = '0.0.0';
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    version = pkg.version || version;
  } catch {}
  const commit = process.env.GIT_COMMIT || 'unknown';
  app.getHttpAdapter().getInstance().get('/healthz', (_req: any, reply: any) => {
    reply.send({ status: 'ok', version, commit });
  });

  // Global Zod error mapping (if thrown inside controllers/services)
  app.useGlobalFilters({
    catch(exception: any, host: any) {
      if (exception instanceof ZodError) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        res.status(400).send({ error: 'validation_error', issues: exception.issues });
        return;
      }
      throw exception;
    }
  } as any);

  // Sentry stays optional
  if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV || 'development' });
  }
  const config = new DocumentBuilder()
    .setTitle('Education API')
    .setDescription('API for the Education platform')
    .addBearerAuth({ type: 'http', scheme: 'bearer' }, 'bearer')
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, doc);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
