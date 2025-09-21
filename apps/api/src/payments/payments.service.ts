import { Injectable } from '@nestjs/common';
import crypto from 'node:crypto';
import { CreateOrderDto, PaymentEvent, PaymentRecord } from './dto';

@Injectable()
export class PaymentsService {
  private store = new Map<string, PaymentRecord>();

  async createOrder(dto: CreateOrderDto){
    const id = `pay_${Math.random().toString(36).slice(2,10)}`;
    const rec: PaymentRecord = {
      id,
      orgId: dto.orgId,
      amountCents: dto.amountCents,
      status: 'pending',
      provider: 'razorpay',
      providerRef: null,
      invoiceUrl: null,
    };
    this.store.set(id, rec);
    // Mock Razorpay order object
    return { id, amount: dto.amountCents, currency: dto.currency, receipt: dto.receipt||id, status: 'created' };
  }

  verifyWebhookSignature(bodyRaw: string, signature: string, secret: string){
    const digest = crypto.createHmac('sha256', secret).update(bodyRaw).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  }

  async markPayment(event: PaymentEvent){
    const rec = this.store.get(event.id);
    if (!rec) return null;
    rec.status = event.status === 'succeeded' ? 'succeeded' : 'failed';
    rec.providerRef = event.providerRef;
    if (rec.status === 'succeeded') {
      rec.invoiceUrl = await this.generateInvoice(rec);
    }
    this.store.set(rec.id, rec);
    return rec;
  }

  async generateInvoice(rec: PaymentRecord){
    // Stub PDF generation: return a fake S3 URL
    return `https://s3.example.com/invoices/${rec.id}.pdf`;
  }

  get(id: string){ return this.store.get(id) || null; }
}
