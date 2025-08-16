import { Module, Provider } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { MockPrismaService } from './mock-prisma.service';

const prismaProvider: Provider = {
  provide: PrismaService,
  useFactory: () => {
    if (process.env.USE_IN_MEMORY_DB === '1') {
      return new (MockPrismaService as any)();
    }
    return new PrismaService();
  },
};

@Module({
  providers: [prismaProvider],
  exports: [prismaProvider],
})
export class PrismaModule {}
