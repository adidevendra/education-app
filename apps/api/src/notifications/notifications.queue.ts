import { Global, Inject, Injectable, Module, OnModuleInit } from '@nestjs/common';
import { Queue, Worker, QueueEvents, JobsOptions, Job } from 'bullmq';
import { NotificationsService } from './notifications.service';
import { Templates, TemplateName } from './templates';

export const NOTIFICATIONS_QUEUE = 'NOTIFICATIONS_QUEUE';
export const NOTIFICATIONS_DLQ = 'NOTIFICATIONS_DLQ';

type EmailJob = { to: string; template: TemplateName; data: any };
type PushJob = { to: string; title: string; body: string };
type InAppJob = { userId: string; message: string };

@Global()
@Module({
  providers: [
    {
      provide: NOTIFICATIONS_QUEUE,
      useFactory: () => new Queue('notifications', { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' } }),
    },
    {
      provide: NOTIFICATIONS_DLQ,
      useFactory: () => new Queue('notifications:dlq', { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' } }),
    },
    {
      provide: 'NOTIF_WORKER',
      inject: [NOTIFICATIONS_QUEUE, NOTIFICATIONS_DLQ, NotificationsService],
      useFactory: (queue: Queue, dlq: Queue, svc: NotificationsService) => {
        const worker = new Worker(
          'notifications',
          async job => {
            if (job.name === 'email') {
              const { to, template, data } = job.data as EmailJob;
              const { subject, html, text } = Templates[template](data);
              await svc.sendEmail(to, subject, html || text);
            } else if (job.name === 'push') {
              const { to, title, body } = job.data as PushJob;
              await svc.sendPush(to, title, body);
            } else if (job.name === 'inapp') {
              const { userId, message } = job.data as InAppJob;
              await svc.notify('inapp', { userId, message });
            }
          },
          { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' } }
        );
        const events = new QueueEvents('notifications', { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' } });
        events.on('failed', async ({ jobId, failedReason }) => {
          console.error('Notification job failed', jobId, failedReason);
          // Move failed to DLQ
          try {
            const j = await queue.getJob(jobId as string);
            if (j) {
              await dlq.add(j.name, j.data, { removeOnComplete: true });
            }
          } catch (e) {
            console.error('DLQ move error', e);
          }
        });
        return worker;
      }
    },
  ],
  exports: [NOTIFICATIONS_QUEUE],
})
export class NotificationsQueueModule implements OnModuleInit {
  onModuleInit() {}
}

@Injectable()
export class NotificationsQueueService {
  constructor(@Inject(NOTIFICATIONS_QUEUE) private queue: Queue) {}
  async enqueueEmail(job: EmailJob, opts?: JobsOptions){
    await this.queue.add('email', job, { attempts: 3, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: true, ...opts });
  }
  async enqueuePush(job: PushJob, opts?: JobsOptions){
    await this.queue.add('push', job, { attempts: 3, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: true, ...opts });
  }
  async enqueueInApp(job: InAppJob, opts?: JobsOptions){
    await this.queue.add('inapp', job, { attempts: 1, removeOnComplete: true, ...opts });
  }
}
