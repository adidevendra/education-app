import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { LessonsService } from './lessons.service';
import { SearchService } from '../search/search.service';

const CreateLessonDto = z.object({
  title: z.string().min(3),
  content: z.string().optional(),
  courseId: z.string().uuid(),
});

type CreateLessonDto = z.infer<typeof CreateLessonDto>;

@ApiTags('lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private service: LessonsService, private searchService: SearchService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'List lessons' })
  list() {
    return this.service.findAll();
  }

  @Post()
  @ApiBody({ type: Object, examples: { sample: { value: { title: 'Intro', courseId: 'uuid' } } } })
  @ApiResponse({ status: 201, description: 'Lesson created' })
  create(@Body(new ZodValidationPipe(CreateLessonDto)) body: CreateLessonDto) {
    return this.service.create(body as any);
  }

  @Get('search')
  @ApiResponse({ status: 200, description: 'Search lessons' })
  search(@Query('q') q?: string) {
    if (!q || String(q).trim() === '') return [];
    return this.searchService.searchLessons(String(q));
  }
}
