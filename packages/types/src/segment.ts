import { z } from 'zod';

export const TranscriptCaptionSchema = z.object({
  startMs: z.number().int().nonnegative(),
  endMs: z.number().int().positive(),
  text: z.string().max(500),
}).refine(v => v.endMs > v.startMs, { message: 'endMs must be greater than startMs' });

export const MediaSegmentSchema = z.object({
  id: z.string().uuid().optional(),
  lectureId: z.string(),
  kind: z.enum(['video', 'audio', 'interactive']),
  src: z.string().url(),
  byteSize: z.number().int().positive().max(10 * 1024 * 1024 * 1024).optional(),
  mime: z.string().max(128),
  durationSeconds: z.number().int().positive().max(4 * 60 * 60),
  captions: z.array(TranscriptCaptionSchema).max(5000).optional(),
  createdAt: z.coerce.date().optional(),
});

export type MediaSegment = z.infer<typeof MediaSegmentSchema>;
export type TranscriptCaption = z.infer<typeof TranscriptCaptionSchema>;
