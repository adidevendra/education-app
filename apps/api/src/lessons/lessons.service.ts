import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchService } from '../search/search.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class LessonsService {
  private readonly logger = new Logger(LessonsService.name);
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
    private notifications: NotificationsService,
    private auditService: AuditService,
  ) {}

  findAll() {
    return (this.prisma as any).lesson.findMany();
  }

  async create(data: any) {
    const created = await (this.prisma as any).lesson.create({ data });

    // fire-and-forget indexing; log errors but do not block API response
    this.searchService
      .indexLesson(created)
      .catch((err) => this.logger.warn({ err }, 'SearchService.indexLesson failed'));

    // Notify in background
    this.notifications
      .notify('New lesson created', { title: created.title, id: created.id })
      .catch((err) => this.logger.warn({ err }, 'NotificationsService.notify failed'));

  // audit
  this.auditService.log(null, 'CREATE_LESSON', `Lesson:${created.id}`);

    return created;
  }
}
