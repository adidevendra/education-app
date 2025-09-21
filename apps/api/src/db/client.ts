import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const connectionString = process.env.POSTGRES_URL;
if (!connectionString) {
  // Keep message generic; avoid leaking env context
  throw new Error('POSTGRES_URL is required');
}

const pool = new Pool({ connectionString, max: 10 });
export const db = drizzle(pool);
export type DbClient = typeof db;
