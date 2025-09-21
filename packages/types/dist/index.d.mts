import { z } from 'zod';

declare const CourseVisibilityEnum: z.ZodEnum<["public", "private", "unlisted"]>;
declare const CourseSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    orgId: z.ZodString;
    title: z.ZodString;
    slug: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    visibility: z.ZodDefault<z.ZodEnum<["public", "private", "unlisted"]>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    estimatedMinutes: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodOptional<z.ZodDate>;
    updatedAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    orgId: string;
    title: string;
    slug: string;
    visibility: "public" | "private" | "unlisted";
    id?: string | undefined;
    description?: string | null | undefined;
    tags?: string[] | undefined;
    estimatedMinutes?: number | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}, {
    orgId: string;
    title: string;
    slug: string;
    id?: string | undefined;
    description?: string | null | undefined;
    visibility?: "public" | "private" | "unlisted" | undefined;
    tags?: string[] | undefined;
    estimatedMinutes?: number | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}>;
type Course = z.infer<typeof CourseSchema>;
declare const ModuleSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    courseId: z.ZodString;
    title: z.ZodString;
    position: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    title: string;
    courseId: string;
    position: number;
    id?: string | undefined;
}, {
    title: string;
    courseId: string;
    position: number;
    id?: string | undefined;
}>;
type Module = z.infer<typeof ModuleSchema>;

declare const LectureSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    moduleId: z.ZodString;
    title: z.ZodString;
    summary: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    durationSeconds: z.ZodOptional<z.ZodNumber>;
    isPublished: z.ZodDefault<z.ZodBoolean>;
    position: z.ZodNumber;
    contentMd: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodDate>;
    updatedAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    title: string;
    position: number;
    moduleId: string;
    isPublished: boolean;
    id?: string | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    summary?: string | null | undefined;
    durationSeconds?: number | undefined;
    contentMd?: string | null | undefined;
}, {
    title: string;
    position: number;
    moduleId: string;
    id?: string | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    summary?: string | null | undefined;
    durationSeconds?: number | undefined;
    isPublished?: boolean | undefined;
    contentMd?: string | null | undefined;
}>;
type Lecture = z.infer<typeof LectureSchema>;

declare const TranscriptCaptionSchema: z.ZodEffects<z.ZodObject<{
    startMs: z.ZodNumber;
    endMs: z.ZodNumber;
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    startMs: number;
    endMs: number;
    text: string;
}, {
    startMs: number;
    endMs: number;
    text: string;
}>, {
    startMs: number;
    endMs: number;
    text: string;
}, {
    startMs: number;
    endMs: number;
    text: string;
}>;
declare const MediaSegmentSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    lectureId: z.ZodString;
    kind: z.ZodEnum<["video", "audio", "interactive"]>;
    src: z.ZodString;
    byteSize: z.ZodOptional<z.ZodNumber>;
    mime: z.ZodString;
    durationSeconds: z.ZodNumber;
    captions: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
        startMs: z.ZodNumber;
        endMs: z.ZodNumber;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        startMs: number;
        endMs: number;
        text: string;
    }, {
        startMs: number;
        endMs: number;
        text: string;
    }>, {
        startMs: number;
        endMs: number;
        text: string;
    }, {
        startMs: number;
        endMs: number;
        text: string;
    }>, "many">>;
    createdAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    durationSeconds: number;
    lectureId: string;
    kind: "video" | "audio" | "interactive";
    src: string;
    mime: string;
    id?: string | undefined;
    createdAt?: Date | undefined;
    byteSize?: number | undefined;
    captions?: {
        startMs: number;
        endMs: number;
        text: string;
    }[] | undefined;
}, {
    durationSeconds: number;
    lectureId: string;
    kind: "video" | "audio" | "interactive";
    src: string;
    mime: string;
    id?: string | undefined;
    createdAt?: Date | undefined;
    byteSize?: number | undefined;
    captions?: {
        startMs: number;
        endMs: number;
        text: string;
    }[] | undefined;
}>;
type MediaSegment = z.infer<typeof MediaSegmentSchema>;
type TranscriptCaption = z.infer<typeof TranscriptCaptionSchema>;

declare const GlossaryTermSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    courseId: z.ZodString;
    term: z.ZodString;
    definition: z.ZodString;
    aliases: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    createdAt: z.ZodOptional<z.ZodDate>;
    updatedAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    courseId: string;
    term: string;
    definition: string;
    id?: string | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    aliases?: string[] | undefined;
}, {
    courseId: string;
    term: string;
    definition: string;
    id?: string | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    aliases?: string[] | undefined;
}>;
type GlossaryTerm = z.infer<typeof GlossaryTermSchema>;

declare const QuizItemKindEnum: z.ZodEnum<["single_choice", "multi_choice", "true_false", "short_text"]>;
declare const QuizItemSchema: z.ZodEffects<z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    lectureId: z.ZodString;
    kind: z.ZodEnum<["single_choice", "multi_choice", "true_false", "short_text"]>;
    prompt: z.ZodString;
    options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    correctOptionIndexes: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    explanation: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    lectureId: string;
    kind: "single_choice" | "multi_choice" | "true_false" | "short_text";
    prompt: string;
    id?: string | undefined;
    options?: string[] | undefined;
    createdAt?: Date | undefined;
    correctOptionIndexes?: number[] | undefined;
    explanation?: string | null | undefined;
}, {
    lectureId: string;
    kind: "single_choice" | "multi_choice" | "true_false" | "short_text";
    prompt: string;
    id?: string | undefined;
    options?: string[] | undefined;
    createdAt?: Date | undefined;
    correctOptionIndexes?: number[] | undefined;
    explanation?: string | null | undefined;
}>, {
    lectureId: string;
    kind: "single_choice" | "multi_choice" | "true_false" | "short_text";
    prompt: string;
    id?: string | undefined;
    options?: string[] | undefined;
    createdAt?: Date | undefined;
    correctOptionIndexes?: number[] | undefined;
    explanation?: string | null | undefined;
}, {
    lectureId: string;
    kind: "single_choice" | "multi_choice" | "true_false" | "short_text";
    prompt: string;
    id?: string | undefined;
    options?: string[] | undefined;
    createdAt?: Date | undefined;
    correctOptionIndexes?: number[] | undefined;
    explanation?: string | null | undefined;
}>;
type QuizItem = z.infer<typeof QuizItemSchema>;

declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    name?: string | null | undefined;
}, {
    id: string;
    email: string;
    name?: string | null | undefined;
}>;
type User = z.infer<typeof UserSchema>;

export { type Course, CourseSchema, CourseVisibilityEnum, type GlossaryTerm, GlossaryTermSchema, type Lecture, LectureSchema, type MediaSegment, MediaSegmentSchema, type Module, ModuleSchema, type QuizItem, QuizItemKindEnum, QuizItemSchema, type TranscriptCaption, TranscriptCaptionSchema, type User, UserSchema };
