import "server-only";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { and, eq, gt, lt } from "drizzle-orm";
import { db, businesses, sessions, users, type Business, type User } from "@/db";

const COOKIE = "pq_session";
const SESSION_DAYS = 30;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ id: hashToken(token), userId, expiresAt });
  // Opportunistic cleanup of expired sessions.
  await db.delete(sessions).where(and(eq(sessions.userId, userId), lt(sessions.expiresAt, new Date())));
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
  jar.delete(COOKIE);
}

/** Signs a user out everywhere (after a password reset or change). */
export async function destroyUserSessions(userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

/** The signed-in user and their business, or null. Cached per request. */
export const getSession = cache(async (): Promise<{ user: User; business: Business } | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [row] = await db
    .select({ user: users, business: businesses })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .innerJoin(businesses, eq(businesses.userId, users.id))
    .where(and(eq(sessions.id, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return row ?? null;
});

export async function requireSession() {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}

export function isElite(user: Pick<User, "plan" | "eliteUntil">, now = new Date()) {
  return user.plan === "elite" && (!user.eliteUntil || user.eliteUntil > now);
}

/** Owner/admin accounts: listed in ADMIN_EMAILS and with a confirmed email (so nobody can pre-register it). */
export function isAdmin(user: Pick<User, "email" | "emailVerifiedAt">) {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return !!user.emailVerifiedAt && admins.includes(user.email.toLowerCase());
}

export async function requireAdmin() {
  const s = await requireSession();
  if (!isAdmin(s.user)) redirect("/app");
  return s;
}
