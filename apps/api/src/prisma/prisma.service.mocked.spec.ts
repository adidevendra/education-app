// mock the @prisma/client PrismaClient to avoid network ops and exercise $connect/$disconnect branches
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: class MockPrisma {
      _connected = false;
      user = { findMany: jest.fn().mockResolvedValue([]), create: jest.fn().mockResolvedValue({}), update: jest.fn().mockResolvedValue({}) };
      course = { findMany: jest.fn().mockResolvedValue([]), create: jest.fn().mockResolvedValue({}) };
      lesson = { findMany: jest.fn().mockResolvedValue([]), create: jest.fn().mockResolvedValue({}) };
      async $connect() { this._connected = true; }
      async $disconnect() { this._connected = false; }
    },
  };
});

describe('PrismaService with mocked PrismaClient', () => {
  const OLD = { ...process.env };
  afterEach(() => { process.env = { ...OLD } as any; jest.resetModules(); });

  it('uses mocked PrismaClient when DATABASE_URL set and calls lifecycle', async () => {
    // ensure in-memory flag not set so constructor picks PrismaClient path
    delete process.env.USE_IN_MEMORY_DB;
    process.env.DATABASE_URL = 'sqlite::memory:';
    jest.resetModules();
    // require fresh module after env change
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaService } = require('./prisma.service');
    const svc = new PrismaService();
    const impl = (svc as any).impl;
    expect(typeof impl.$connect).toBe('function');
    // spy on impl
    const spyConnect = jest.spyOn(impl, '$connect');
    const spyDisconnect = jest.spyOn(impl, '$disconnect');
    await svc.onModuleInit();
    expect(spyConnect).toHaveBeenCalled();
    await svc.onModuleDestroy();
    expect(spyDisconnect).toHaveBeenCalled();
  });
});
