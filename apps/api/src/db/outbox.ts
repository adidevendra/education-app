import { pgTable, uuid, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { asc, eq, isNull } from 'drizzle-orm';
import { db } from './client';

export const outbox = pgTable('outbox', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: varchar('type', { length: 128 }).notNull(),
  payload: jsonb('payload').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
});

export type OutboxRecord = {
  id: string;
  type: string;
  payload: unknown;
  createdAt: Date;
  processedAt: Date | null;
};

export const OutboxRepo = {
  enqueue: async (type: string, payload: unknown) => {
    const [row] = await db.insert(outbox).values({ type, payload }).returning();
    return row;
  },
  nextUnprocessed: async (limit = 10) => {
    const rows = await db
      .select()
      .from(outbox)
      .where(isNull(outbox.processedAt))
      .orderBy(asc(outbox.createdAt))
      .limit(limit);
    return rows;
  },
  markProcessed: async (id: string) => {
    await db.update(outbox).set({ processedAt: new Date() }).where(eq(outbox.id, id));
  },
};
