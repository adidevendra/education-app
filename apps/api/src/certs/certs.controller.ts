import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CertsService } from './certs.service';
import { IssueCertDto } from './dto';
import { z } from 'zod';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsQueueService } from '../notifications/notifications.queue';

@Controller('v1/certs')
export class CertsController {
  constructor(private svc: CertsService, private notify: NotificationsService, private notifQueue: NotificationsQueueService) {}

  @Post('issue')
  async issue(@Body() body: any){
    const dto: IssueCertDto = z.object({ enrollmentId: z.string() }).parse(body);
  const cert = await this.svc.issue(dto);
  await this.notifQueue.enqueueEmail({ to: 'user@example.com', template: 'certificateIssued', data: { userName: 'User', courseTitle: 'Course', certUrl: cert.url } });
  return cert;
  }

  // Public verify URL
  @Get(':id')
  async verify(@Param('id') id: string){
    const cert = await this.svc.get(id);
    if (!cert) return { ok: false };
    return { ok: true, id: cert.id, issuedAt: cert.issuedAt, url: cert.url };
  }
}
