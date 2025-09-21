import { z } from 'zod';

export const GlossaryTermSchema = z.object({
  id: z.string().uuid().optional(),
  courseId: z.string(),
  term: z.string().min(1).max(120),
  definition: z.string().min(1).max(5000),
  aliases: z.array(z.string().min(1).max(120)).max(10).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type GlossaryTerm = z.infer<typeof GlossaryTermSchema>;
