// Applies pending SQL migrations from ./drizzle. Runs automatically before `next build`,
// so every Vercel deploy brings the database schema up to date.
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { readFileSync, existsSync } from "node:fs";

// Load .env for local runs (Vercel injects env vars directly).
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

// Prefer the direct (non-pooled) connection for schema changes when the integration provides one.
const url =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "";
if (!url) {
  // Don't fail the deploy: the site still builds, and migrations run on the next deploy
  // once a database is connected.
  console.warn("\n⚠  No DATABASE_URL set — skipping database migrations.");
  console.warn("   On Vercel: Storage → connect a Neon Postgres database, then Redeploy.\n");
  process.exit(0);
}

const client = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
await client.end();
console.log("Database migrations applied.");
