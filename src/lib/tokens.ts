import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { db, authTokens, rateLimits } from "@/db";
import { headers } from "next/headers";

export type TokenKind = "reset" | "verify";
const hash = (t: string) => createHash("sha256").update(t).digest("hex");

/** Creates a one-time token and returns the raw value (to put in a link). Older ones of the same kind are revoked. */
export async function createToken(userId: string, kind: TokenKind, ttlMinutes: number) {
  const raw = randomBytes(32).toString("base64url");
  await db.delete(authTokens).where(and(eq(authTokens.userId, userId), eq(authTokens.kind, kind)));
  await db.insert(authTokens).values({ id: hash(raw), userId, kind, expiresAt: new Date(Date.now() + ttlMinutes * 60_000) });
  return raw;
}

/** Marks a token used and returns its user id, or null if it's unknown, expired or already used. */
export async function consumeToken(raw: string, kind: TokenKind): Promise<string | null> {
  if (!raw || raw.length > 100) return null;
  const [row] = await db
    .update(authTokens)
    .set({ usedAt: new Date() })
    .where(and(eq(authTokens.id, hash(raw)), eq(authTokens.kind, kind), isNull(authTokens.usedAt), gt(authTokens.expiresAt, new Date())))
    .returning({ userId: authTokens.userId });
  return row?.userId ?? null;
}

/** Checks a token without using it (to show the reset form only for valid links). */
export async function peekToken(raw: string, kind: TokenKind): Promise<boolean> {
  if (!raw || raw.length > 100) return false;
  const [row] = await db
    .select({ id: authTokens.id })
    .from(authTokens)
    .where(and(eq(authTokens.id, hash(raw)), eq(authTokens.kind, kind), isNull(authTokens.usedAt), gt(authTokens.expiresAt, new Date())))
    .limit(1);
  return !!row;
}

export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
}

/**
 * Fixed-window rate limit backed by Postgres (works across serverless instances).
 * Returns true if this attempt is allowed.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const fresh = sql`${rateLimits.windowStart} < now() - make_interval(secs => ${windowSeconds})`;
  const [row] = await db
    .insert(rateLimits)
    .values({ key, windowStart: new Date(), count: 1 })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${fresh} then 1 else ${rateLimits.count} + 1 end`,
        windowStart: sql`case when ${fresh} then now() else ${rateLimits.windowStart} end`,
      },
    })
    .returning({ count: rateLimits.count });
  return row.count <= limit;
}
