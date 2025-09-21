import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { AlignmentWorker, AlignmentQueueProvider } from './align.worker';

@Module({
  providers: [MediaService, AlignmentWorker, AlignmentQueueProvider],
  controllers: [MediaController],
  exports: [MediaService],
})
export class MediaModule {}
