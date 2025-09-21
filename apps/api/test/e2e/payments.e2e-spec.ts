import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';

describe('Payments (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });
  afterAll(async ()=>{ await app.close(); });

  it('creates order and accepts webhook', async () => {
    const res = await request(app.getHttpServer()).post('/api/v1/payments/orders').send({ orgId: 'org1', amountCents: 12345 });
    expect(res.status).toBe(201);
    const id = res.body.id;
    const webhook = await request(app.getHttpServer()).post('/api/v1/payments/webhook').send({ id, status: 'succeeded', providerRef: 'rzp_test_123' });
    expect(webhook.status).toBe(200);
  });
});
