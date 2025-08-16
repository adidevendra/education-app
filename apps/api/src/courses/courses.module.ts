import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { SearchModule } from '../search/search.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [SearchModule, PrismaModule],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
