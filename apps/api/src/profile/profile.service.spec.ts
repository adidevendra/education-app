import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma/prisma.service';
import { MockPrismaService } from '../prisma/mock-prisma.service';

describe('ProfileService', () => {
  let service: ProfileService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    process.env.USE_IN_MEMORY_DB = '1';
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileService, { provide: PrismaService, useClass: MockPrismaService }],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    prisma = (module.get(PrismaService) as unknown) as MockPrismaService;
  });

  afterEach(() => {
    delete process.env.USE_IN_MEMORY_DB;
  });

  it('creates and returns profile for user', async () => {
    const p = await service.createForUser('u-1', { bio: 'hello' });
    expect(p).toBeDefined();
    expect(p.userId).toBe('u-1');

    const fetched = await service.getByUserId('u-1');
    expect(fetched).toMatchObject({ userId: 'u-1', bio: 'hello' });
  });

  it('updates profile', async () => {
    await service.createForUser('u-2', { bio: 'init' });
    const updated = await service.updateForUser('u-2', { bio: 'changed' });
    expect(updated.bio).toBe('changed');
  });
});
