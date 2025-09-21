// src/course.ts
import { z } from "zod";
var CourseVisibilityEnum = z.enum(["public", "private", "unlisted"]);
var CourseSchema = z.object({
  id: z.string().uuid("course.id must be uuid").optional(),
  orgId: z.string(),
  title: z.string().min(3).max(160),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(120),
  description: z.string().max(4e3).optional().nullable(),
  visibility: CourseVisibilityEnum.default("private"),
  tags: z.array(z.string().min(1).max(32)).max(20).optional(),
  estimatedMinutes: z.number().int().positive().max(1e5).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
});
var ModuleSchema = z.object({
  id: z.string().uuid().optional(),
  courseId: z.string(),
  title: z.string().min(2).max(160),
  position: z.number().int().nonnegative()
});

// src/lecture.ts
import { z as z2 } from "zod";
var LectureSchema = z2.object({
  id: z2.string().uuid().optional(),
  moduleId: z2.string(),
  title: z2.string().min(2).max(160),
  summary: z2.string().max(2e3).optional().nullable(),
  durationSeconds: z2.number().int().positive().max(4 * 60 * 60).optional(),
  isPublished: z2.boolean().default(false),
  position: z2.number().int().nonnegative(),
  // will be validated separately / sanitized
  contentMd: z2.string().optional().nullable(),
  createdAt: z2.coerce.date().optional(),
  updatedAt: z2.coerce.date().optional()
});

// src/segment.ts
import { z as z3 } from "zod";
var TranscriptCaptionSchema = z3.object({
  startMs: z3.number().int().nonnegative(),
  endMs: z3.number().int().positive(),
  text: z3.string().max(500)
}).refine((v) => v.endMs > v.startMs, { message: "endMs must be greater than startMs" });
var MediaSegmentSchema = z3.object({
  id: z3.string().uuid().optional(),
  lectureId: z3.string(),
  kind: z3.enum(["video", "audio", "interactive"]),
  src: z3.string().url(),
  byteSize: z3.number().int().positive().max(10 * 1024 * 1024 * 1024).optional(),
  mime: z3.string().max(128),
  durationSeconds: z3.number().int().positive().max(4 * 60 * 60),
  captions: z3.array(TranscriptCaptionSchema).max(5e3).optional(),
  createdAt: z3.coerce.date().optional()
});

// src/glossary.ts
import { z as z4 } from "zod";
var GlossaryTermSchema = z4.object({
  id: z4.string().uuid().optional(),
  courseId: z4.string(),
  term: z4.string().min(1).max(120),
  definition: z4.string().min(1).max(5e3),
  aliases: z4.array(z4.string().min(1).max(120)).max(10).optional(),
  createdAt: z4.coerce.date().optional(),
  updatedAt: z4.coerce.date().optional()
});

// src/quiz.ts
import { z as z5 } from "zod";
var QuizItemKindEnum = z5.enum(["single_choice", "multi_choice", "true_false", "short_text"]);
var QuizItemSchema = z5.object({
  id: z5.string().uuid().optional(),
  lectureId: z5.string(),
  kind: QuizItemKindEnum,
  prompt: z5.string().min(1).max(1e3),
  options: z5.array(z5.string().min(1).max(400)).max(20).optional(),
  correctOptionIndexes: z5.array(z5.number().int().nonnegative()).max(20).optional(),
  explanation: z5.string().max(2e3).optional().nullable(),
  createdAt: z5.coerce.date().optional()
}).refine((d) => {
  if (d.kind === "single_choice" || d.kind === "multi_choice") {
    return !!d.options && d.options.length >= 2;
  }
  return true;
}, { message: "at least two options required for choice questions", path: ["options"] });

// src/user.ts
import { z as z6 } from "zod";
var UserSchema = z6.object({
  id: z6.string(),
  name: z6.string().nullable().optional(),
  email: z6.string().email()
});
export {
  CourseSchema,
  CourseVisibilityEnum,
  GlossaryTermSchema,
  LectureSchema,
  MediaSegmentSchema,
  ModuleSchema,
  QuizItemKindEnum,
  QuizItemSchema,
  TranscriptCaptionSchema,
  UserSchema
};
//# sourceMappingURL=index.mjs.map