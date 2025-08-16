import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [PrismaModule, SearchModule],
  controllers: [HealthController],
})
export class HealthModule {}
