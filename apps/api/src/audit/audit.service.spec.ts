import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { MockPrismaService } from '../prisma/mock-prisma.service';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: MockPrismaService;

  beforeAll(async () => {
    process.env.USE_IN_MEMORY_DB = '1';
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditService, { provide: PrismaService, useClass: MockPrismaService }],
    }).compile();

    service = module.get<AuditService>(AuditService);
    prisma = (module.get(PrismaService) as unknown) as MockPrismaService;
  });

  afterAll(() => {
    delete process.env.USE_IN_MEMORY_DB;
  });

  it('writes an audit log record', async () => {
    await service.log('u-123', 'CREATE', 'Course:c-1');
    await new Promise((resolve) => setImmediate(resolve));

    const logs = await prisma.auditLog.findMany();
    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs[logs.length - 1]).toMatchObject({ userId: 'u-123', action: 'CREATE', resource: 'Course:c-1' });
  });
});
