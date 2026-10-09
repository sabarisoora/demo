import "server-only";
import { createHash } from "node:crypto";
import { and, asc, eq, gt, isNull } from "drizzle-orm";
import { db, businesses, invites, memberships, users } from "@/db";

export const inviteHash = (t: string) => createHash("sha256").update(t).digest("hex");

/** An unused, unexpired invitation and its shop, or null. */
export async function findInvite(token: string) {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null;
  const [i] = await db
    .select({ invite: invites, business: businesses })
    .from(invites)
    .innerJoin(businesses, eq(businesses.id, invites.businessId))
    .where(and(eq(invites.id, inviteHash(token)), isNull(invites.acceptedAt), gt(invites.expiresAt, new Date())))
    .limit(1);
  return i ?? null;
}

export async function teamOf(businessId: string) {
  const [members, pending] = await Promise.all([
    db
      .select({ id: memberships.id, role: memberships.role, since: memberships.createdAt, name: users.name, email: users.email })
      .from(memberships)
      .innerJoin(users, eq(users.id, memberships.userId))
      .where(eq(memberships.businessId, businessId))
      .orderBy(asc(memberships.createdAt)),
    db
      .select()
      .from(invites)
      .where(and(eq(invites.businessId, businessId), isNull(invites.acceptedAt), gt(invites.expiresAt, new Date())))
      .orderBy(asc(invites.createdAt)),
  ]);
  return { members, pending };
}
