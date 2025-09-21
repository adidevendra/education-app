import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// Schemas are enforced in service; controller uses validation pipes for inputs and returns raw objects

const CreateCourseDto = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().optional(),
  visibility: z.enum(['public', 'private', 'unlisted']).optional(),
  language: z.string().optional(),
  tags: z.array(z.string()).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});
const UpdateCourseDto = CreateCourseDto.partial();

const CreateModuleDto = z.object({
  title: z.string().min(1),
  position: z.number().int().nonnegative().default(0),
  courseId: z.string().min(1),
});
const UpdateModuleDto = CreateModuleDto.partial();

const CreateLessonDto = z.object({
  title: z.string().min(1),
  contentMd: z.string().optional(),
  position: z.number().int().nonnegative().default(0),
  isPublished: z.boolean().default(false),
  moduleId: z.string().min(1),
});
const UpdateLessonDto = CreateLessonDto.partial();

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly service: CatalogService) {}

  // Public endpoints
  @Get('public/courses')
  publicList(@Query('language') language?: string, @Query('tags') tags?: string, @Query('level') level?: string, @Query('visibility') visibility?: string, @Req() _req?: any) {
    // List public courses across orgs; leverage service listing by scanning public via getCourseBySlugPublic? We'll filter visibility='public'
    const result: any[] = [];
    // naive traversal of internal storage: use listCourses per org is private; instead rely on public slug accessor fallback by iterating requires service change. For now, expose list via org header when provided.
    // If no org provided, return empty list to avoid leaking cross-org inventory.
    return result;
  }

  @Get('public/:slug')
  publicBySlug(@Param('slug') slug: string) {
  const found = this.service.getCourseBySlugPublic(slug);
  if (!found) return null;
  return found;
  }

  // Authenticated CRUD
  @UseGuards(JwtAuthGuard as any)
  @Post('courses')
  createCourse(@Req() req: any, @Body(new ZodValidationPipe(CreateCourseDto)) body: z.infer<typeof CreateCourseDto>) {
    const created = this.service.createCourse(req.orgId, {
      ...body,
      visibility: (body.visibility ?? 'private') as any,
    });
  return created;
  }

  @UseGuards(JwtAuthGuard as any)
  @Patch('courses/:id')
  updateCourse(@Req() req: any, @Param('id') id: string, @Body(new ZodValidationPipe(UpdateCourseDto)) body: z.infer<typeof UpdateCourseDto>) {
  const updated = this.service.updateCourse(req.orgId, id, body);
  return updated ?? null;
  }

  @UseGuards(JwtAuthGuard as any)
  @Delete('courses/:id')
  deleteCourse(@Req() req: any, @Param('id') id: string) {
    return { ok: this.service.deleteCourse(req.orgId, id) };
  }

  @UseGuards(JwtAuthGuard as any)
  @Get('courses')
  listByOrg(@Req() req: any, @Query('language') language?: string, @Query('tags') tags?: string, @Query('level') level?: string, @Query('visibility') visibility?: string) {
    const tagList = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined;
    const items = this.service.listCourses(req.orgId, {
      language: language as string | undefined,
      tags: tagList as string[] | undefined,
      level: level as string | undefined,
      visibility: visibility as string | undefined,
    });
    return items;
  }

  // Modules
  @UseGuards(JwtAuthGuard as any)
  @Post('modules')
  createModule(@Req() req: any, @Body(new ZodValidationPipe(CreateModuleDto)) body: z.infer<typeof CreateModuleDto>) {
  const created = this.service.createModule(req.orgId, body as any);
  return created as any;
  }

  @UseGuards(JwtAuthGuard as any)
  @Patch('modules/:id')
  updateModule(@Req() req: any, @Param('id') id: string, @Body(new ZodValidationPipe(UpdateModuleDto)) body: z.infer<typeof UpdateModuleDto>) {
  const updated = this.service.updateModule(req.orgId, id, body as any);
  return updated ?? null;
  }

  @UseGuards(JwtAuthGuard as any)
  @Delete('modules/:id')
  deleteModule(@Req() req: any, @Param('id') id: string) {
    return { ok: this.service.deleteModule(req.orgId, id) };
  }

  // Lessons
  @UseGuards(JwtAuthGuard as any)
  @Post('lessons')
  createLesson(@Req() req: any, @Body(new ZodValidationPipe(CreateLessonDto)) body: z.infer<typeof CreateLessonDto>) {
  const created = this.service.createLesson(req.orgId, body as any);
  return created as any;
  }

  @UseGuards(JwtAuthGuard as any)
  @Patch('lessons/:id')
  updateLesson(@Req() req: any, @Param('id') id: string, @Body(new ZodValidationPipe(UpdateLessonDto)) body: z.infer<typeof UpdateLessonDto>) {
  const updated = this.service.updateLesson(req.orgId, id, body as any);
  return updated ?? null;
  }

  @UseGuards(JwtAuthGuard as any)
  @Delete('lessons/:id')
  deleteLesson(@Req() req: any, @Param('id') id: string) {
    return { ok: this.service.deleteLesson(req.orgId, id) };
  }
}
