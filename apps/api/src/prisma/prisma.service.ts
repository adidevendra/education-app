import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

class InMemoryMock {
  private users: any[] = [];
  private courses: any[] = [];
  private lessons: any[] = [];

  private makeId(prefix = '') {
    return `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 9000 + 1000)}`;
  }

  user = {
    findMany: async () => this.users,
    create: async ({ data }: { data: any }) => {
      const created = { id: this.makeId('u_'), createdAt: new Date(), updatedAt: new Date(), ...data };
      this.users.push(created);
      return created;
    },
  };

  course = {
    findMany: async () => this.courses,
    create: async ({ data }: { data: any }) => {
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

  lesson = {
    findMany: async () => this.lessons,
    create: async ({ data }: { data: any }) => {
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
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private impl: any;
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // If USE_IN_MEMORY_DB=1 is explicitly set, force the in-memory mock.
    if (process.env.USE_IN_MEMORY_DB === '1') {
      this.logger.log('USE_IN_MEMORY_DB=1 -> Using in-memory mock PrismaService');
      this.impl = new InMemoryMock();
      return;
    }

    // Prefer a real database when DATABASE_URL is provided; otherwise fall back to in-memory.
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && dbUrl.trim() !== '') {
      this.logger.log('DATABASE_URL detected -> Using real PrismaClient');
      this.impl = new PrismaClient();
    } else {
      this.logger.log('No DATABASE_URL found -> Falling back to in-memory mock PrismaService');
      this.impl = new InMemoryMock();
    }
  }

  // lifecycle hooks - only relevant for real PrismaClient
  async onModuleInit() {
    if (this.impl?.$connect) {
      await this.impl.$connect();
    }
  }

  async onModuleDestroy() {
    if (this.impl?.$disconnect) {
      await this.impl.$disconnect();
    }
  }

  // expose the model delegates
  get user() {
    return this.impl.user;
  }

  get course() {
    return this.impl.course;
  }

  get lesson() {
    return this.impl.lesson;
  }
}
