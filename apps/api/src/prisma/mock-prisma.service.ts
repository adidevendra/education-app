import { Injectable, Logger } from '@nestjs/common';

type AnyObj = Record<string, any>;

@Injectable()
export class MockPrismaService {
  private readonly logger = new Logger(MockPrismaService.name);
  private users: AnyObj[] = [];
  private courses: AnyObj[] = [];
  private lessons: AnyObj[] = [];
  private enrollments: AnyObj[] = [];
  private auditLogs: AnyObj[] = [];
  private profiles: AnyObj[] = [];

  private makeId(prefix = '') {
    return `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 9000 + 1000)}`;
  }

  // minimal user API
  user = {
    findMany: async () => this.users,
    create: async ({ data }: { data: AnyObj }) => {
      const created = { id: this.makeId('u_'), createdAt: new Date(), updatedAt: new Date(), ...data };
      this.users.push(created);
      return created;
    },
  };

  // minimal course API
  course = {
    findMany: async () => this.courses,
    create: async ({ data }: { data: AnyObj }) => {
      const slug = (data.title || 'course').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const created = {
        id: this.makeId('c_'),
        title: data.title,
        slug,
        description: data.description || null,
        published: !!data.published,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.courses.push(created);
      return created;
    },
  };

  // minimal lesson API
  lesson = {
    findMany: async () => this.lessons,
    create: async ({ data }: { data: AnyObj }) => {
      const created = {
        id: this.makeId('l_'),
        title: data.title,
        content: data.content || null,
        courseId: data.courseId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.lessons.push(created);
      return created;
    },
  };

  // minimal profile API
  profile = {
    findMany: async ({ where }: { where?: AnyObj } = {}) => {
      if (!where) return this.profiles;
      return this.profiles.filter((p) => {
        for (const k of Object.keys(where)) {
          if ((p as any)[k] !== (where as any)[k]) return false;
        }
        return true;
      });
    },
    create: async ({ data }: { data: AnyObj }) => {
      const created = { id: this.makeId('pr_'), ...data, createdAt: new Date(), updatedAt: new Date() };
      this.profiles.push(created);
      return created;
    },
    update: async ({ where, data }: { where: AnyObj; data: AnyObj }) => {
      const idx = this.profiles.findIndex((p) => p.id === where.id);
      if (idx === -1) throw new Error('Not found');
      this.profiles[idx] = { ...this.profiles[idx], ...data, updatedAt: new Date() };
      return this.profiles[idx];
    },
  };

  // minimal enrollment API
  enrollment = {
    findMany: async ({ where }: { where?: AnyObj } = {}) => {
      if (!where) return this.enrollments;
      return this.enrollments.filter((e) => {
        for (const k of Object.keys(where)) {
          if ((e as any)[k] !== (where as any)[k]) return false;
        }
        return true;
      });
    },
    create: async ({ data }: { data: AnyObj }) => {
      const created = {
        id: this.makeId('en_'),
        userId: data.userId,
        courseId: data.courseId,
        createdAt: new Date(),
      };
      this.enrollments.push(created);
      return created;
    },
  };

  // minimal auditLog API
  auditLog = {
    findMany: async ({ where }: { where?: AnyObj } = {}) => {
      if (!where) return this.auditLogs;
      return this.auditLogs.filter((e) => {
        for (const k of Object.keys(where)) {
          if ((e as any)[k] !== (where as any)[k]) return false;
        }
        return true;
      });
    },
    create: async ({ data }: { data: AnyObj }) => {
      const created = {
        id: this.makeId('al_'),
        userId: data.userId || null,
        action: data.action,
        resource: data.resource,
        timestamp: new Date(),
      };
      this.auditLogs.push(created);
      return created;
    },
  };
}
