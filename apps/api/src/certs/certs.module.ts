import { Module } from '@nestjs/common';
import { CertsService } from './certs.service';
import { CertsController } from './certs.controller';
import { CertsPublicController } from './certs.public.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [CertsService],
  controllers: [CertsController, CertsPublicController],
  exports: [CertsService]
})
export class CertsModule {}
