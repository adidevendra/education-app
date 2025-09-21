import { PrismaService } from './prisma.service';

let currentClient: any;

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => {
    if (!currentClient) {
      throw new Error('Mock PrismaClient instance was not initialised');
    }
    return currentClient;
  }),
}));

const { PrismaClient } = jest.requireMock('@prisma/client') as { PrismaClient: jest.Mock };

const PrismaClientMock = PrismaClient as jest.Mock;

describe('PrismaService', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    currentClient = {
      $connect: jest.fn().mockResolvedValue(undefined as any),
      $disconnect: jest.fn().mockResolvedValue(undefined as any),
      user: {},
      course: {},
      lesson: {},
      profile: {},
      enrollment: {},
      auditLog: {},
    };
    process.env = { ...ORIGINAL_ENV, USE_IN_MEMORY_DB: '0', DATABASE_URL: 'postgres://test-db' };
    PrismaClientMock.mockClear();
  });

  afterEach(() => {
    currentClient = undefined;
    process.env = ORIGINAL_ENV;
  });

  it('connects and disconnects when DATABASE_URL is set', async () => {
    const service = new PrismaService();

    expect(PrismaClientMock).toHaveBeenCalledTimes(1);

    await service.onModuleInit();
    await service.onModuleDestroy();

    expect(currentClient.$connect).toHaveBeenCalledTimes(1);
    expect(currentClient.$disconnect).toHaveBeenCalledTimes(1);
  });
});
