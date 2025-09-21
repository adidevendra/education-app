"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.ts
var index_exports = {};
__export(index_exports, {
  CourseSchema: () => CourseSchema,
  CourseVisibilityEnum: () => CourseVisibilityEnum,
  GlossaryTermSchema: () => GlossaryTermSchema,
  LectureSchema: () => LectureSchema,
  MediaSegmentSchema: () => MediaSegmentSchema,
  ModuleSchema: () => ModuleSchema,
  QuizItemKindEnum: () => QuizItemKindEnum,
  QuizItemSchema: () => QuizItemSchema,
  TranscriptCaptionSchema: () => TranscriptCaptionSchema,
  UserSchema: () => UserSchema
});
module.exports = __toCommonJS(index_exports);

// src/course.ts
var import_zod = require("zod");
var CourseVisibilityEnum = import_zod.z.enum(["public", "private", "unlisted"]);
var CourseSchema = import_zod.z.object({
  id: import_zod.z.string().uuid("course.id must be uuid").optional(),
  orgId: import_zod.z.string(),
  title: import_zod.z.string().min(3).max(160),
  slug: import_zod.z.string().regex(/^[a-z0-9-]+$/).min(3).max(120),
  description: import_zod.z.string().max(4e3).optional().nullable(),
  visibility: CourseVisibilityEnum.default("private"),
  tags: import_zod.z.array(import_zod.z.string().min(1).max(32)).max(20).optional(),
  estimatedMinutes: import_zod.z.number().int().positive().max(1e5).optional(),
  createdAt: import_zod.z.coerce.date().optional(),
  updatedAt: import_zod.z.coerce.date().optional()
});
var ModuleSchema = import_zod.z.object({
  id: import_zod.z.string().uuid().optional(),
  courseId: import_zod.z.string(),
  title: import_zod.z.string().min(2).max(160),
  position: import_zod.z.number().int().nonnegative()
});

// src/lecture.ts
var import_zod2 = require("zod");
var LectureSchema = import_zod2.z.object({
  id: import_zod2.z.string().uuid().optional(),
  moduleId: import_zod2.z.string(),
  title: import_zod2.z.string().min(2).max(160),
  summary: import_zod2.z.string().max(2e3).optional().nullable(),
  durationSeconds: import_zod2.z.number().int().positive().max(4 * 60 * 60).optional(),
  isPublished: import_zod2.z.boolean().default(false),
  position: import_zod2.z.number().int().nonnegative(),
  // will be validated separately / sanitized
  contentMd: import_zod2.z.string().optional().nullable(),
  createdAt: import_zod2.z.coerce.date().optional(),
  updatedAt: import_zod2.z.coerce.date().optional()
});

// src/segment.ts
var import_zod3 = require("zod");
var TranscriptCaptionSchema = import_zod3.z.object({
  startMs: import_zod3.z.number().int().nonnegative(),
  endMs: import_zod3.z.number().int().positive(),
  text: import_zod3.z.string().max(500)
}).refine((v) => v.endMs > v.startMs, { message: "endMs must be greater than startMs" });
var MediaSegmentSchema = import_zod3.z.object({
  id: import_zod3.z.string().uuid().optional(),
  lectureId: import_zod3.z.string(),
  kind: import_zod3.z.enum(["video", "audio", "interactive"]),
  src: import_zod3.z.string().url(),
  byteSize: import_zod3.z.number().int().positive().max(10 * 1024 * 1024 * 1024).optional(),
  mime: import_zod3.z.string().max(128),
  durationSeconds: import_zod3.z.number().int().positive().max(4 * 60 * 60),
  captions: import_zod3.z.array(TranscriptCaptionSchema).max(5e3).optional(),
  createdAt: import_zod3.z.coerce.date().optional()
});

// src/glossary.ts
var import_zod4 = require("zod");
var GlossaryTermSchema = import_zod4.z.object({
  id: import_zod4.z.string().uuid().optional(),
  courseId: import_zod4.z.string(),
  term: import_zod4.z.string().min(1).max(120),
  definition: import_zod4.z.string().min(1).max(5e3),
  aliases: import_zod4.z.array(import_zod4.z.string().min(1).max(120)).max(10).optional(),
  createdAt: import_zod4.z.coerce.date().optional(),
  updatedAt: import_zod4.z.coerce.date().optional()
});

// src/quiz.ts
var import_zod5 = require("zod");
var QuizItemKindEnum = import_zod5.z.enum(["single_choice", "multi_choice", "true_false", "short_text"]);
var QuizItemSchema = import_zod5.z.object({
  id: import_zod5.z.string().uuid().optional(),
  lectureId: import_zod5.z.string(),
  kind: QuizItemKindEnum,
  prompt: import_zod5.z.string().min(1).max(1e3),
  options: import_zod5.z.array(import_zod5.z.string().min(1).max(400)).max(20).optional(),
  correctOptionIndexes: import_zod5.z.array(import_zod5.z.number().int().nonnegative()).max(20).optional(),
  explanation: import_zod5.z.string().max(2e3).optional().nullable(),
  createdAt: import_zod5.z.coerce.date().optional()
}).refine((d) => {
  if (d.kind === "single_choice" || d.kind === "multi_choice") {
    return !!d.options && d.options.length >= 2;
  }
  return true;
}, { message: "at least two options required for choice questions", path: ["options"] });

// src/user.ts
var import_zod6 = require("zod");
var UserSchema = import_zod6.z.object({
  id: import_zod6.z.string(),
  name: import_zod6.z.string().nullable().optional(),
  email: import_zod6.z.string().email()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
//# sourceMappingURL=index.js.map