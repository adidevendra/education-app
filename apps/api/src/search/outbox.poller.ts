import { Inject, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { OutboxRepo } from '../db/outbox';
import { COURSE_INDEX_QUEUE } from '../queue/queue.module';

@Injectable()
export class OutboxPoller {
  private readonly logger = new Logger(OutboxPoller.name);
  private timer?: NodeJS.Timeout;
  constructor(@Inject(COURSE_INDEX_QUEUE) private readonly queue: Queue) {
    // start polling after constructed
    this.timer = setInterval(() => this.tick().catch(() => {}), 3000);
  }

  async tick() {
    const rows = await OutboxRepo.nextUnprocessed(25);
    for (const row of rows) {
      if (row.type === 'index-course') {
        await this.queue.add('index-course', row.payload as any, { removeOnComplete: 100, removeOnFail: 100 });
        await OutboxRepo.markProcessed(row.id);
      }
    }
  }
}
