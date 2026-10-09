import "server-only";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { and, eq, gt, lt } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, businesses, memberships, sessions, users, type Business, type User } from "@/db";

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

export type Role = "owner" | "staff" | "viewer";
export type Session = {
  /** The person signed in, with the SHOP's plan (owner's) so Elite checks cover team members. */
  user: User;
  /** The person signed in, exactly as stored (their own plan field). */
  me: User;
  business: Business;
  role: Role;
};

const sessionUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [row] = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return row?.user ?? null;
});

/** The signed-in user, even if they don't belong to a shop (yet / any more). */
export const getSessionUser = sessionUser;

/** The signed-in user, their shop and role, or null. Cached per request. */
export const getSession = cache(async (): Promise<Session | null> => {
  const me = await sessionUser();
  if (!me) return null;
  const [own] = await db.select().from(businesses).where(eq(businesses.userId, me.id)).limit(1);
  if (own) return { user: me, me, business: own, role: "owner" };
  const owner = alias(users, "owner");
  const [m] = await db
    .select({ business: businesses, role: memberships.role, owner })
    .from(memberships)
    .innerJoin(businesses, eq(businesses.id, memberships.businessId))
    .innerJoin(owner, eq(owner.id, businesses.userId))
    .where(eq(memberships.userId, me.id))
    .limit(1);
  if (!m) return null;
  return { user: { ...me, plan: m.owner.plan, eliteUntil: m.owner.eliteUntil }, me, business: m.business, role: m.role === "viewer" ? "viewer" : "staff" };
});

export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect((await sessionUser()) ? "/no-shop" : "/login");
  // Team access is part of Elite: members can't get in while the shop isn't on Elite.
  if (s.role !== "owner" && !isElite(s.user)) redirect("/no-shop?paused=1");
  return s;
}

/** Owner or staff: may create and change records. Viewers are read-only. */
export async function requireWriter(): Promise<Session> {
  const s = await requireSession();
  if (s.role === "viewer") throw new Error("Read-only access: ask the shop owner for edit rights.");
  return s;
}

/** Shop owner only: settings, team, imports and wiping data. */
export async function requireOwner(): Promise<Session> {
  const s = await requireSession();
  if (s.role !== "owner") throw new Error("Only the shop owner can do this.");
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
