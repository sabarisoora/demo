"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, users } from "@/db";
import { createSession, destroySession, destroyUserSessions, hashPassword, requireSession, verifyPassword } from "@/lib/auth";
import { rateLimit } from "@/lib/tokens";

export type AccountState = { error?: string; ok?: string } | undefined;

export async function updateName(_: AccountState, form: FormData): Promise<AccountState> {
  const { user } = await requireSession();
  const name = z.string().trim().min(1, "Enter your name").max(100).safeParse(form.get("name"));
  if (!name.success) return { error: name.error.issues[0].message };
  await db.update(users).set({ name: name.data }).where(eq(users.id, user.id));
  return { ok: "Saved." };
}

export async function changePassword(_: AccountState, form: FormData): Promise<AccountState> {
  const { user } = await requireSession();
  if (!(await rateLimit(`pw-change:${user.id}`, 10, 900))) return { error: "Too many attempts. Try again in a few minutes." };
  const next = z.string().min(8, "Use at least 8 characters").max(200).safeParse(form.get("password"));
  if (!next.success) return { error: next.error.issues[0].message };
  if (form.get("password") !== form.get("confirm")) return { error: "The two new passwords don't match." };
  if (!(await verifyPassword(String(form.get("current") ?? ""), user.passwordHash))) return { error: "Your current password is incorrect." };

  await db.update(users).set({ passwordHash: await hashPassword(next.data) }).where(eq(users.id, user.id));
  await destroyUserSessions(user.id);
  await createSession(user.id);
  redirect("/app/account?password=1");
}

export async function deleteAccount(_: AccountState, form: FormData): Promise<AccountState> {
  const { user } = await requireSession();
  if (!(await rateLimit(`delete:${user.id}`, 5, 900))) return { error: "Too many attempts. Try again in a few minutes." };
  if (form.get("confirm") !== "DELETE") return { error: "Type DELETE to confirm." };
  if (!(await verifyPassword(String(form.get("current") ?? ""), user.passwordHash))) return { error: "Your password is incorrect." };
  // Business, entries, sessions and tokens are removed by ON DELETE CASCADE.
  await db.delete(users).where(eq(users.id, user.id));
  await destroySession();
  redirect("/?deleted=1");
}
