import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Vercel's Neon/Postgres integrations name the variable differently; accept any of them.
export function databaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || "";
}

function createDb() {
  const url = databaseUrl();
  if (!url) {
    throw new Error("No database configured. Set DATABASE_URL (on Vercel: Storage → connect a Neon Postgres database, then redeploy).");
  }
  // Neon/Supabase poolers (PgBouncer in transaction mode) don't support prepared statements.
  const client = postgres(url, { max: 5, prepare: false });
  return drizzle(client, { schema });
}

type Db = ReturnType<typeof createDb>;

// Reuse one client across hot reloads in dev and across invocations on a warm serverless instance.
const globalForDb = globalThis as unknown as { db?: Db };

// Connect lazily on first use, so building the app never needs a database.
export const db = new Proxy({} as Db, {
  get(_, prop) {
    globalForDb.db ??= createDb();
    return Reflect.get(globalForDb.db, prop, globalForDb.db);
  },
});

export * from "./schema";
