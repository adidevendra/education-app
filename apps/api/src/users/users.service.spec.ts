import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { MockPrismaService } from '../prisma/mock-prisma.service';

describe('UsersService (unit & nest)', () => {
  it('findAll delegates to prisma.user.findMany', async () => {
    const mockPrisma: any = { user: { findMany: jest.fn().mockResolvedValue([{ id: 'u1' }]) } };
    const svc = new UsersService(mockPrisma as any);
    const out = await svc.findAll();
    expect(out).toEqual([{ id: 'u1' }]);
    expect(mockPrisma.user.findMany).toHaveBeenCalled();
  });

  it('create delegates to prisma.user.create', async () => {
    const mockPrisma: any = { user: { create: jest.fn().mockResolvedValue({ id: 'u2' }) } };
    const svc = new UsersService(mockPrisma as any);
    const out = await svc.create({ name: 'bob' });
    expect(out).toEqual({ id: 'u2' });
    expect(mockPrisma.user.create).toHaveBeenCalledWith({ data: { name: 'bob' } });
  });

  it('update delegates to prisma.user.update', async () => {
    const mockPrisma: any = { user: { update: jest.fn().mockResolvedValue({ id: 'u3' }) } };
    const svc = new UsersService(mockPrisma as any);
    const out = await svc.update('u3', { foo: 'bar' });
    expect(out).toEqual({ id: 'u3' });
    expect(mockPrisma.user.update).toHaveBeenCalledWith({ where: { id: 'u3' }, data: { foo: 'bar' } });
  });

  describe('nestjs integration', () => {
    let service: UsersService;

    beforeAll(async () => {
      const useInMem = process.env.USE_IN_MEMORY_DB === '1';
      const providers: any[] = [UsersService];
      if (useInMem) {
        providers.push({ provide: PrismaService, useClass: MockPrismaService });
      } else {
        providers.push({ provide: PrismaService, useClass: PrismaService });
      }

      const module: TestingModule = await Test.createTestingModule({ providers }).compile();
      service = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });
});
