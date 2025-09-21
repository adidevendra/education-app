import { z } from 'zod';

export const CourseVisibilityEnum = z.enum(['public', 'private', 'unlisted']);

export const CourseSchema = z.object({
  id: z.string().uuid('course.id must be uuid').optional(),
  orgId: z.string(),
  title: z.string().min(3).max(160),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(120),
  description: z.string().max(4000).optional().nullable(),
  visibility: CourseVisibilityEnum.default('private'),
  tags: z.array(z.string().min(1).max(32)).max(20).optional(),
  estimatedMinutes: z.number().int().positive().max(100000).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type Course = z.infer<typeof CourseSchema>;

export const ModuleSchema = z.object({
  id: z.string().uuid().optional(),
  courseId: z.string(),
  title: z.string().min(2).max(160),
  position: z.number().int().nonnegative(),
});
export type Module = z.infer<typeof ModuleSchema>;
