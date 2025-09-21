import { Global, Module } from '@nestjs/common';
import { Queue } from 'bullmq';

export const COURSE_INDEX_QUEUE = 'COURSE_INDEX_QUEUE';

@Global()
@Module({
  providers: [
    {
      provide: COURSE_INDEX_QUEUE,
      useFactory: () => {
        const connection = {
          connection: {
            url: process.env.REDIS_URL || 'redis://localhost:6379',
          },
        } as any;
        return new Queue('index-course', connection);
      },
    },
  ],
  exports: [COURSE_INDEX_QUEUE],
})
export class QueueModule {}
