import { z } from 'zod';

export const CreateOrderDto = z.object({
  orgId: z.string(),
  amountCents: z.number().int().positive(),
  currency: z.string().default('INR'),
  receipt: z.string().optional(),
  notes: z.record(z.string(), z.string()).optional(),
});
export type CreateOrderDto = z.infer<typeof CreateOrderDto>;

export const PaymentEvent = z.object({
  id: z.string(),
  status: z.enum(['succeeded','failed']),
  providerRef: z.string(),
  signature: z.string(),
});
export type PaymentEvent = z.infer<typeof PaymentEvent>;

export const PaymentRecord = z.object({
  id: z.string(),
  orgId: z.string(),
  amountCents: z.number().int(),
  status: z.enum(['pending','succeeded','failed','refunded']),
  provider: z.literal('razorpay'),
  providerRef: z.string().nullable(),
  invoiceUrl: z.string().nullable().optional(),
});
export type PaymentRecord = z.infer<typeof PaymentRecord>;
