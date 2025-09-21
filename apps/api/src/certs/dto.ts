import { z } from 'zod';

export const IssueCertDto = z.object({
  enrollmentId: z.string(),
  userId: z.string().optional(),
  courseId: z.string().optional(),
});
export type IssueCertDto = z.infer<typeof IssueCertDto>;
