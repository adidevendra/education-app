import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  constructor(private prisma: PrismaService) {}

  async log(userId: string | null, action: string, resource: string) {
    // fire-and-forget: don't throw on errors
    try {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.prisma.auditLog.create({ data: { userId, action, resource } } as any);
    } catch (err) {
      this.logger.error('Failed to write audit log', err as any);
    }
  }
}
