import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV, DATABASE_URL: 'mockdb://url' };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('connects and disconnects when DATABASE_URL is set', async () => {
    const service = new PrismaService();

  const impl = (service as any).impl;
  const connectSpy = jest.spyOn(impl, '$connect').mockResolvedValue();
  const disconnectSpy = jest.spyOn(impl, '$disconnect').mockResolvedValue();

  await service.onModuleInit();
  await service.onModuleDestroy();

  expect(connectSpy).toHaveBeenCalled();
  expect(disconnectSpy).toHaveBeenCalled();
  });
});
