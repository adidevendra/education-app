import { z } from 'zod';

export const QuizItemKindEnum = z.enum(['single_choice', 'multi_choice', 'true_false', 'short_text']);

export const QuizItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    lectureId: z.string(),
    kind: QuizItemKindEnum,
    prompt: z.string().min(1).max(1000),
    options: z.array(z.string().min(1).max(400)).max(20).optional(),
    correctOptionIndexes: z.array(z.number().int().nonnegative()).max(20).optional(),
    explanation: z.string().max(2000).optional().nullable(),
    createdAt: z.coerce.date().optional(),
  })
  .refine(d => {
    if ((d.kind === 'single_choice' || d.kind === 'multi_choice')) {
      return !!d.options && d.options.length >= 2;
    }
    return true;
  }, { message: 'at least two options required for choice questions', path: ['options'] });

export type QuizItem = z.infer<typeof QuizItemSchema>;
