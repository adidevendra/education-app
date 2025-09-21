import { Body, Controller, Headers, HttpCode, Post, RawBodyRequest, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { z } from 'zod';
import { CreateOrderDto } from './dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsQueueService } from '../notifications/notifications.queue';
import { NotificationsQueueModule } from '../notifications/notifications.queue';
import { Inject } from '@nestjs/common';

const WebhookSchema = z.object({
  id: z.string(),
  status: z.enum(['succeeded','failed']),
  providerRef: z.string(),
});

@Controller('v1/payments')
export class PaymentsController {
  constructor(private svc: PaymentsService, private notify: NotificationsService, private notifQueue: NotificationsQueueService) {}

  @Post('orders')
  async createOrder(@Body() body: any){
  const dto = CreateOrderDto.parse(body);
    return this.svc.createOrder(dto);
  }

  @Post('webhook')
  @HttpCode(200)
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string,
  ){
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_secret';
    const bodyRaw = (req as any).rawBody?.toString?.() || JSON.stringify((req as any).body || {});
    const ok = this.svc.verifyWebhookSignature(bodyRaw, signature||'', secret);
    if (!ok) return { ok: false };
    const payload = JSON.parse(bodyRaw);
    const evt = WebhookSchema.parse(payload);
    const rec = await this.svc.markPayment({ ...evt, signature });
    if (rec?.status === 'succeeded') {
      await this.notifQueue.enqueueEmail({ to: 'user@example.com', template: 'paymentSuccess', data: { userName: 'User', amount: rec.amountCents, invoiceUrl: rec.invoiceUrl } });
    } else if (rec?.status === 'failed') {
      await this.notifQueue.enqueueEmail({ to: 'user@example.com', template: 'paymentSuccess', data: { userName: 'User', amount: rec?.amountCents||0 } });
    }
    return { ok: true };
  }
}
