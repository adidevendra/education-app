import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';

describe('Certs (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });
  afterAll(async ()=>{ await app.close(); });

  it('issues and verifies certificate', async () => {
    const res = await request(app.getHttpServer()).post('/api/v1/certs/issue').send({ enrollmentId: 'enr1' });
    expect(res.status).toBe(201);
    const id = res.body.id;
    const verify = await request(app.getHttpServer()).get(`/api/v1/certs/${id}`);
    expect(verify.status).toBe(200);
    expect(verify.body.ok).toBe(true);
  });
});
