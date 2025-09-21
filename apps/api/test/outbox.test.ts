import { describe, it, expect, beforeAll, afterAll } from 'vitest';

if (!process.env.POSTGRES_URL) {
  // eslint-disable-next-line no-console
  console.warn('Skipping OutboxRepo tests: POSTGRES_URL not set');
  describe('OutboxRepo (skipped)', () => {
    it('skips when POSTGRES_URL missing', () => {
      expect(true).toBe(true);
    });
  });
} else {
  // Defer module imports until after env is verified
  describe('OutboxRepo', () => {
    let db: any;
    let OutboxRepo: any;
    beforeAll(async () => {
      const clientMod = await import('../src/db/client');
      db = clientMod.db;
      const outboxMod = await import('../src/db/outbox');
      OutboxRepo = outboxMod.OutboxRepo;
      // Ensure table exists if using migration-less local run
      await db.execute(
        `CREATE TABLE IF NOT EXISTS outbox (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          type varchar(128) NOT NULL,
          payload jsonb NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now(),
          processed_at timestamptz
        );`
      );
    });

    afterAll(async () => {
      await db.execute('TRUNCATE TABLE outbox');
    });

    it('enqueues and fetches jobs idempotently', async () => {
      const job = await OutboxRepo.enqueue('email.send', { to: 'demo@example.com' });
      expect(job.type).toBe('email.send');
      const next = await OutboxRepo.nextUnprocessed(5);
      expect(next.length).toBeGreaterThanOrEqual(1);
      await OutboxRepo.markProcessed(job.id);
      const remaining = await OutboxRepo.nextUnprocessed(5);
      const found = remaining.find((r: { id: string }) => r.id === job.id);
      expect(found).toBeUndefined();
    });
  });
}
