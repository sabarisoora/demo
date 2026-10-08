"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, users } from "@/db";
import { requireAdmin } from "@/lib/auth";

const DAY = 24 * 60 * 60 * 1000;

/** Support tool: give Elite manually (e.g. a payment that didn't sync, a reviewer, a partner). */
export async function grantElite(form: FormData) {
  await requireAdmin();
  const id = z.string().uuid().parse(form.get("id"));
  const days = z.coerce.number().int().min(0).max(3650).parse(form.get("days") ?? 0);
  await db
    .update(users)
    .set({ plan: "elite", eliteUntil: days > 0 ? new Date(Date.now() + days * DAY) : null })
    .where(eq(users.id, id));
  revalidatePath("/admin");
}

export async function revokeElite(form: FormData) {
  await requireAdmin();
  const id = z.string().uuid().parse(form.get("id"));
  await db.update(users).set({ plan: "free", eliteUntil: null }).where(eq(users.id, id));
  revalidatePath("/admin");
}

export async function verifyEmailManually(form: FormData) {
  await requireAdmin();
  const id = z.string().uuid().parse(form.get("id"));
  const { markEmailVerified } = await import("@/lib/entitlements");
  const [u] = await db.select({ email: users.email }).from(users).where(eq(users.id, id)).limit(1);
  if (u) await markEmailVerified(id, u.email);
  revalidatePath("/admin");
}
