import { describe, it, expect } from '@jest/globals';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  it('creates order and marks success with invoice', async () => {
    const svc = new PaymentsService();
    const order = await svc.createOrder({ orgId: 'org', amountCents: 1000, currency: 'INR' } as any);
    const rec = await svc.markPayment({ id: order.id, status: 'succeeded', providerRef: 'rzp', signature: 'sig' });
    expect(rec?.status).toBe('succeeded');
    expect(rec?.invoiceUrl).toBeTruthy();
  });
});
