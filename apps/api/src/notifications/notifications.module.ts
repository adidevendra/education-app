import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsQueueModule, NotificationsQueueService } from './notifications.queue';

@Global()
@Module({
  imports: [NotificationsQueueModule],
  providers: [NotificationsService, NotificationsQueueService],
  exports: [NotificationsService, NotificationsQueueModule, NotificationsQueueService],
})
export class NotificationsModule {}
