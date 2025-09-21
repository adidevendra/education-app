import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { MockPrismaService } from './mock-prisma.service';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private impl: any;
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // If USE_IN_MEMORY_DB=1 is explicitly set, force the in-memory mock.
    if (process.env.USE_IN_MEMORY_DB === '1') {
      this.logger.log('USE_IN_MEMORY_DB=1 -> Using in-memory mock PrismaService');
      this.impl = new MockPrismaService();
      return;
    }

    // Prefer a real database when DATABASE_URL is provided; otherwise fall back to in-memory.
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && dbUrl.trim() !== '') {
      this.logger.log('DATABASE_URL detected -> Using real PrismaClient');
      this.impl = new PrismaClient();
    } else {
      this.logger.log('No DATABASE_URL found -> Falling back to in-memory mock PrismaService');
      this.impl = new MockPrismaService();
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

  get profile() {
    return this.impl.profile;
  }

  get enrollment() {
    return this.impl.enrollment;
  }

  get auditLog() {
    return this.impl.auditLog;
  }
}
