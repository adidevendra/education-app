import { Injectable, Logger } from '@nestjs/common';
import { EmailAdapter } from './adapters/email.adapter';
import { WebPushAdapter } from './adapters/webpush.adapter';
import { ExpoAdapter } from './adapters/expo.adapter';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private email = new EmailAdapter();
  private webpush = new WebPushAdapter();
  private expo = new ExpoAdapter();

  // Generic notification entrypoint for now — logs the message.
  async notify(channel: string, payload: any) {
    // Simple console/logging implementation for now.
    const msg = { channel, payload, at: new Date().toISOString() };
    // Use Nest logger so logs integrate with nest runtime
    this.logger.log(`Notification -> ${JSON.stringify(msg)}`);
    return { ok: true };
  }

  // Convenience helpers
  async sendEmail(to: string, subject: string, body: string) {
    try { return await this.email.send(to, subject, body); } catch (e) { this.logger.error(e as any); return this.notify('email', { to, subject, body }); }
  }

  async sendPush(toDeviceId: string, title: string, body: string) {
    if (toDeviceId.startsWith('ExponentPushToken')) {
      try { return await this.expo.send(toDeviceId, title, body); } catch (e) { this.logger.error(e as any); }
    }
    return this.notify('push', { toDeviceId, title, body });
  }
}
