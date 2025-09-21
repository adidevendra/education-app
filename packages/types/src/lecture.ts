import { z } from 'zod';

export const LectureSchema = z.object({
  id: z.string().uuid().optional(),
  moduleId: z.string(),
  title: z.string().min(2).max(160),
  summary: z.string().max(2000).optional().nullable(),
  durationSeconds: z.number().int().positive().max(4 * 60 * 60).optional(),
  isPublished: z.boolean().default(false),
  position: z.number().int().nonnegative(),
  // will be validated separately / sanitized
  contentMd: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type Lecture = z.infer<typeof LectureSchema>;
