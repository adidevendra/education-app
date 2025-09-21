import { Injectable } from '@nestjs/common';
import { z } from 'zod';

const CreateCourseInput = z
  .object({
    title: z.string(),
    slug: z.string().optional(),
    description: z.string().nullable().optional(),
    visibility: z.enum(['public', 'private', 'unlisted']).optional(),
    language: z.string().optional(),
    tags: z.array(z.string()).optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  })
  .strict();
const UpdateCourseInput = CreateCourseInput.partial();

const ModuleSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  title: z.string(),
  position: z.number().int().nonnegative(),
});
const CreateModuleInput = ModuleSchema.pick({ title: true, position: true, courseId: true });
const UpdateModuleInput = CreateModuleInput.partial();

const LessonSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  title: z.string(),
  contentMd: z.string().nullable().optional(),
  position: z.number().int().nonnegative(),
  isPublished: z.boolean().default(false),
});
const CreateLessonInput = LessonSchema.pick({ title: true, contentMd: true, position: true, isPublished: true, moduleId: true });
const UpdateLessonInput = CreateLessonInput.partial();

const CourseSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  title: z.string(),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  visibility: z.enum(['public', 'private', 'unlisted']).default('private'),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
type Course = z.infer<typeof CourseSchema> & {
  language?: string;
  tags?: string[];
  level?: 'beginner' | 'intermediate' | 'advanced';
  slug?: string;
};
type Module = z.infer<typeof ModuleSchema>;
type Lesson = z.infer<typeof LessonSchema>;

@Injectable()
export class CatalogService {
  private coursesByOrg = new Map<string, Map<string, Course>>();
  private modulesByOrg = new Map<string, Map<string, Module>>();
  private lessonsByOrg = new Map<string, Map<string, Lesson>>();

  private id(prefix = '') {
    return `${prefix}${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  }

  // helpers
  private getStore<T>(map: Map<string, Map<string, T>>, orgId: string) {
    let m = map.get(orgId);
    if (!m) {
      m = new Map();
      map.set(orgId, m);
    }
    return m;
  }

  // Courses
  createCourse(orgId: string, input: z.infer<typeof CreateCourseInput>): Course {
    const data = CreateCourseInput.parse(input);
    const course: Course = {
      id: this.id('c_'),
      orgId,
      title: data.title,
      slug: data.slug,
      description: data.description,
      visibility: data.visibility ?? 'private',
      language: data.language,
      tags: data.tags,
      level: data.level,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    this.getStore(this.coursesByOrg, orgId).set(course.id, course);
    return course;
  }

  updateCourse(orgId: string, id: string, patch: z.infer<typeof UpdateCourseInput>): Course | null {
    const store = this.getStore(this.coursesByOrg, orgId);
    const existing = store.get(id);
    if (!existing) return null;
    const data = UpdateCourseInput.parse(patch);
    const updated: Course = { ...existing, ...data, updatedAt: new Date() };
    store.set(id, updated);
    return updated;
  }

  deleteCourse(orgId: string, id: string): boolean {
    return this.getStore(this.coursesByOrg, orgId).delete(id);
  }

  listCourses(orgId: string, filters: { language?: string | undefined; tags?: string[] | undefined; level?: string | undefined; visibility?: string | undefined }) {
    const items = Array.from(this.getStore(this.coursesByOrg, orgId).values());
    return items.filter((c) => {
      if (filters.language && c.language !== filters.language) return false;
      if (filters.level && c.level !== filters.level) return false;
      if (filters.visibility && c.visibility !== filters.visibility) return false;
      if (filters.tags && filters.tags.length) {
        const t = new Set(c.tags ?? []);
        for (const tag of filters.tags) if (!t.has(tag)) return false;
      }
      return true;
    });
  }

  getCourseBySlugPublic(slug: string) {
    for (const orgStore of this.coursesByOrg.values()) {
      for (const c of orgStore.values()) {
        if (c.slug === slug && c.visibility === 'public') return c;
      }
    }
    return null;
  }

  // Modules
  createModule(orgId: string, input: z.infer<typeof CreateModuleInput>): Module {
    const data = CreateModuleInput.parse(input);
    const mod: Module = { id: this.id('m_'), ...data } as any;
    this.getStore(this.modulesByOrg, orgId).set(mod.id, mod);
    return mod;
  }

  updateModule(orgId: string, id: string, patch: z.infer<typeof UpdateModuleInput>): Module | null {
    const store = this.getStore(this.modulesByOrg, orgId);
    const existing = store.get(id);
    if (!existing) return null;
    const data = UpdateModuleInput.parse(patch);
    const updated: Module = { ...existing, ...data } as any;
    store.set(id, updated);
    return updated;
  }

  deleteModule(orgId: string, id: string): boolean {
    return this.getStore(this.modulesByOrg, orgId).delete(id);
  }

  // Lessons
  createLesson(orgId: string, input: z.infer<typeof CreateLessonInput>): Lesson {
    const data = CreateLessonInput.parse(input);
    const lesson: Lesson = { id: this.id('l_'), ...data } as any;
    this.getStore(this.lessonsByOrg, orgId).set(lesson.id, lesson);
    return lesson;
  }

  updateLesson(orgId: string, id: string, patch: z.infer<typeof UpdateLessonInput>): Lesson | null {
    const store = this.getStore(this.lessonsByOrg, orgId);
    const existing = store.get(id);
    if (!existing) return null;
    const data = UpdateLessonInput.parse(patch);
    const updated: Lesson = { ...existing, ...data } as any;
    store.set(id, updated);
    return updated;
  }

  deleteLesson(orgId: string, id: string): boolean {
    return this.getStore(this.lessonsByOrg, orgId).delete(id);
  }
}
