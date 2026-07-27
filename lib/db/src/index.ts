import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Vercel serverless functions spin up many short-lived instances, each with
// its own pool. Keep pools small there so we don't exhaust Supabase's
// connection limit (pair this with Supabase's "Transaction pooler" connection
// string in DATABASE_URL when deployed on Vercel). Supabase requires TLS but
// its certs aren't in Node's default trust store, so relax verification.
const isServerless = process.env.VERCEL === "1";
const isSupabase = process.env.DATABASE_URL.includes("supabase.com");

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
  max: isServerless ? 1 : 10,
});
export const db = drizzle(pool, { schema });

export * from "./schema";
