// lib/db.ts
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

export async function ensureMetadataTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS db_models (
      name TEXT PRIMARY KEY,
      definition JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

export default pool;
