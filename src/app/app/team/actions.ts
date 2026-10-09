"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db, businesses, invites, memberships, sessions, users } from "@/db";
import { createSession, getSession, getSessionUser, hashPassword, isElite, requireOwner } from "@/lib/auth";
import { actionEmail, requestOrigin, sendEmail } from "@/lib/email";
import { markEmailVerified } from "@/lib/entitlements";
import { clientIp, rateLimit } from "@/lib/tokens";
import { site } from "@/lib/site";
import { findInvite, inviteHash } from "@/lib/team";

export type TeamState = { error?: string; ok?: string; link?: string } | undefined;
const roleSchema = z.enum(["staff", "viewer"]);
const MAX_MEMBERS = 10;

export async function inviteMember(_: TeamState, form: FormData): Promise<TeamState> {
  const { user, me, business } = await requireOwner();
  if (!isElite(user)) return { error: "Team access is an Elite feature." };
  const p = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email"), role: roleSchema }).safeParse(Object.fromEntries(form));
  if (!p.success) return { error: p.error.issues[0].message };
  const { email, role } = p.data;
  if (email === me.email) return { error: "That's you. You already own this shop." };
  if (!(await rateLimit(`invite:${business.id}`, 20, 3600))) return { error: "Too many invitations in the last hour." };
  const count = await db.select({ id: memberships.id }).from(memberships).where(eq(memberships.businessId, business.id));
  if (count.length >= MAX_MEMBERS) return { error: `A shop can have up to ${MAX_MEMBERS} team members.` };

  const token = randomBytes(24).toString("base64url");
  // One open invitation per email: replace any older one.
  await db.delete(invites).where(and(eq(invites.businessId, business.id), eq(invites.email, email), isNull(invites.acceptedAt)));
  await db.insert(invites).values({ id: inviteHash(token), businessId: business.id, email, role, expiresAt: new Date(Date.now() + 7 * 86_400_000) });
  const link = `${await requestOrigin()}/invite/${token}`;
  const roleText = role === "viewer" ? "view the numbers (read-only)" : "add and edit repair orders, customers and inventory";
  const sent = await sendEmail({
    to: email,
    subject: `${me.name || business.name} invited you to ${business.name || site.name} on ${site.name}`,
    ...actionEmail({
      greeting: "Hi,",
      body: `${me.name || "The owner"} invited you to join ${business.name || "their shop"} on ${site.name}, where you'll be able to ${roleText}.`,
      action: "Accept invitation",
      url: link,
      footer: "This invitation works for 7 days. If you weren't expecting it, you can ignore this email.",
    }),
  });
  revalidatePath("/app/team");
  return { ok: sent ? `Invitation sent to ${email}.` : `Invitation created. Email isn't set up, so send this link to ${email} yourself:`, link: sent ? undefined : link };
}

export async function revokeInvite(form: FormData) {
  const { business } = await requireOwner();
  await db.delete(invites).where(and(eq(invites.id, z.string().parse(form.get("id"))), eq(invites.businessId, business.id)));
  revalidatePath("/app/team");
}

export async function changeRole(form: FormData) {
  const { business } = await requireOwner();
  const id = z.string().uuid().parse(form.get("id"));
  await db.update(memberships).set({ role: roleSchema.parse(form.get("role")) }).where(and(eq(memberships.id, id), eq(memberships.businessId, business.id)));
  revalidatePath("/app/team");
}

export async function removeMember(form: FormData) {
  const { business } = await requireOwner();
  const id = z.string().uuid().parse(form.get("id"));
  const [m] = await db.delete(memberships).where(and(eq(memberships.id, id), eq(memberships.businessId, business.id))).returning({ userId: memberships.userId });
  // Sign them out right away.
  if (m) await db.delete(sessions).where(eq(sessions.userId, m.userId));
  revalidatePath("/app/team");
}

// ───────────── Accepting an invitation (/invite/[token]) ─────────────

async function join(userId: string, invite: typeof invites.$inferSelect) {
  await db.transaction(async (tx) => {
    await tx.insert(memberships).values({ businessId: invite.businessId, userId, role: invite.role });
    await tx.update(invites).set({ acceptedAt: new Date() }).where(eq(invites.id, invite.id));
  });
}

/** Signed-in user with the invited email accepts. */
export async function acceptInvite(_: TeamState, form: FormData): Promise<TeamState> {
  const token = String(form.get("token") ?? "");
  const found = await findInvite(token);
  if (!found) return { error: "This invitation has expired or was already used." };
  const me = await getSessionUser();
  if (!me) return { error: "Log in first." };
  if (me.email !== found.invite.email) return { error: `This invitation is for ${found.invite.email}. Log in with that email.` };
  if (await getSession()) return { error: "Your account already belongs to a shop. Each login can be in one shop; use a different email for this one." };
  await join(me.id, found.invite);
  // Clicking the emailed link proves the address.
  if (!me.emailVerifiedAt) await markEmailVerified(me.id, me.email);
  redirect("/app?joined=1");
}

/** New person: creates their login and joins the shop in one step. */
export async function signupAndAccept(_: TeamState, form: FormData): Promise<TeamState> {
  const token = String(form.get("token") ?? "");
  const found = await findInvite(token);
  if (!found) return { error: "This invitation has expired or was already used." };
  const p = z
    .object({ name: z.string().trim().min(1, "Enter your name").max(100), password: z.string().min(8, "Use at least 8 characters").max(200) })
    .safeParse(Object.fromEntries(form));
  if (!p.success) return { error: p.error.issues[0].message };
  if (!(await rateLimit(`signup:${await clientIp()}`, 10, 3600))) return { error: "Too many attempts. Try again later." };
  const email = found.invite.email;
  const [exists] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (exists) return { error: "An account with this email already exists. Log in, then open the invitation link again." };
  const [u] = await db
    .insert(users)
    .values({ email, name: p.data.name, passwordHash: await hashPassword(p.data.password), emailVerifiedAt: new Date() })
    .returning({ id: users.id });
  await join(u.id, found.invite);
  await createSession(u.id);
  redirect("/app?joined=1");
}

/** Someone without a shop (e.g. removed from a team) starts their own free one. */
export async function startOwnShop() {
  const me = await getSessionUser();
  if (!me) redirect("/login");
  if (await getSession()) redirect("/app");
  await db.insert(businesses).values({ userId: me.id, name: "", ownerName: me.name });
  redirect("/app/settings");
}
