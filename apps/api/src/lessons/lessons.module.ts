import { Module } from '@nestjs/common';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { SearchModule } from '../search/search.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [SearchModule, PrismaModule],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
