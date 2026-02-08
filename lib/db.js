import { neon } from "@neondatabase/serverless";

let sqlClient = null;
let schemaPromise = null;

export function getSqlClient() {
  if (!process.env.DATABASE_URL) return null;
  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL);
  }
  return sqlClient;
}

export async function ensureSchema(sql) {
  if (!schemaPromise) {
    schemaPromise = sql`
      CREATE TABLE IF NOT EXISTS scores (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(16) NOT NULL,
        score INTEGER NOT NULL CHECK (score >= 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;
  }
  return schemaPromise;
}
