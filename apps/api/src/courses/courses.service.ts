import { Injectable, Logger } from '@nestjs/common';
import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchService } from '../search/search.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
    private notifications: NotificationsService,
    private auditService: AuditService,
  ) {}

  findAll() {
    return this.prisma.course.findMany();
  }

  async create(data: any) {
    const created = await this.prisma.course.create({ data });

    // Fire-and-forget indexing; log errors but do not block the response
    this.searchService
      .indexCourse(created)
      .catch((err) => this.logger.warn({ err }, 'SearchService.indexCourse failed'));

    // Notify in background (does not block the API response)
    this.notifications
      .notify('New course created', { title: created.title, id: created.id })
      .catch((err) => this.logger.warn({ err }, 'NotificationsService.notify failed'));

  // audit log (fire-and-forget)
  this.auditService.log(null, 'CREATE_COURSE', `Course:${created.id}`);

    return created;
  }

  async update(id: string, data: any) {
    const updated = await (this.prisma as any).course.update({ where: { id }, data });

    // Re-index in background
    this.searchService
      .indexCourse(updated)
      .catch((err) => this.logger.warn({ err }, 'SearchService.indexCourse failed (update)'));

    return updated;
  }

  /**
   * Enroll a user in a course. Throws ConflictException if already enrolled.
   */
  async enroll(userId: string, courseId: string) {
    // check existing
    const existing = await (this.prisma as any).enrollment.findMany({ where: { userId, courseId } });
    if (existing && existing.length) {
      throw new ConflictException('User already enrolled in course');
    }

    const created = await (this.prisma as any).enrollment.create({ data: { userId, courseId } });
  // audit
  this.auditService.log(userId, 'ENROLL_COURSE', `Course:${courseId}`);
    return created;
  }
}
