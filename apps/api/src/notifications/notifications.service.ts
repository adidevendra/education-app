import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

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
    return this.notify('email', { to, subject, body });
  }

  async sendPush(toDeviceId: string, title: string, body: string) {
    return this.notify('push', { toDeviceId, title, body });
  }
}
