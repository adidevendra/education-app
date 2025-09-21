import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CourseSchema } from '@repo/types';
import { CoursesService } from './courses.service';
import { SearchService } from '../search/search.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OutboxRepo } from '../db/outbox';

// Use shared CourseSchema; extend for controller-specific fields (published, language, price)
const CreateCourseDto = CourseSchema.pick({ title: true, slug: true, description: true, tags: true }).extend({
  published: (CourseSchema.shape as any).visibility?.optional?.() || (CourseSchema.shape.visibility as any).optional(),
  language: CourseSchema.shape.title.transform(() => '').optional().optional(), // placeholder simple string
  price: CourseSchema.shape.estimatedMinutes.transform(() => 0).optional().optional(),
});
type CreateCourseDto = typeof CreateCourseDto extends { _output: infer O } ? O : never;
const UpdateCourseDto = (CreateCourseDto as any).partial();

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
  create(@Body(new ZodValidationPipe(CreateCourseDto)) body: CreateCourseDto, @Req() req: any) {
    return this.service.create(body as any).then(async (created) => {
      if (body.published) {
        await OutboxRepo.enqueue('index-course', {
          id: created.id,
          orgId: req.orgId ?? null,
          title: created.title,
          description: created.description ?? null,
          tags: body.tags ?? [],
          lang: body.language ?? null,
          price: body.price ?? null,
        });
      }
      return created;
    });
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Course updated' })
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateCourseDto)) body: Partial<CreateCourseDto>, @Req() req: any) {
    return this.service.update(id, body as any).then(async (updated) => {
      // Enqueue index on update
      await OutboxRepo.enqueue('index-course', {
        id: updated.id,
        orgId: req.orgId ?? null,
        title: updated.title,
        description: updated.description ?? null,
        tags: body.tags ?? [],
        lang: body.language ?? null,
        price: body.price ?? null,
      });
      return updated;
    });
  }

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Enroll in course' })
  async enroll(@Param('id') id: string, @Req() req: any) {
    const enrollment = await this.service.enroll(req.user.id, id);
    return { success: true, enrollmentId: enrollment.id };
  }
}
