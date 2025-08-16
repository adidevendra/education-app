import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CoursesService } from './courses.service';
import { SearchService } from '../search/search.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const CreateCourseDto = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().optional(),
  published: z.boolean().optional(),
});

type CreateCourseDto = z.infer<typeof CreateCourseDto>;

const UpdateCourseDto = CreateCourseDto.partial();

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private service: CoursesService, private searchService: SearchService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'List courses' })
  list() {
    return this.service.findAll();
  }

  @Get('search')
  @ApiResponse({ status: 200, description: 'Search courses' })
  search(@Query('q') q?: string) {
    if (!q || String(q).trim() === '') return [];
    return this.searchService.searchCourses(String(q));
  }

  @Post()
  @ApiBody({ type: Object, examples: { sample: { value: { title: 'Intro', slug: 'intro' } } } })
  @ApiResponse({ status: 201, description: 'Course created' })
  create(@Body(new ZodValidationPipe(CreateCourseDto)) body: CreateCourseDto) {
    return this.service.create(body as any);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Course updated' })
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateCourseDto)) body: Partial<CreateCourseDto>) {
    return this.service.update(id, body as any);
  }

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Enroll in course' })
  async enroll(@Param('id') id: string, @Req() req: any) {
    const enrollment = await this.service.enroll(req.user.id, id);
    return { success: true, enrollmentId: enrollment.id };
  }
}
