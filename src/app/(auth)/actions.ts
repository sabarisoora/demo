"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, businesses, users } from "@/db";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { AFF_COOKIE, CAM_COOKIE, cleanAffiliate } from "@/lib/ds24";
import { countries } from "@/lib/countries";
import { claimUnmatchedPurchases } from "@/lib/entitlements";
import { niches } from "@/niches";

export type FormState = { error?: string } | undefined;

const signupSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100),
  business: z.string().trim().min(1, "Enter your business name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(200),
  password: z.string().min(8, "Use at least 8 characters").max(200),
  country: z.string().refine((c) => countries.some((x) => x.name === c), "Pick a country"),
  niche: z.string().refine((n) => n in niches, "Unknown business type"),
});

export async function signup(_: FormState, form: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, business, email, password, country, niche } = parsed.data;

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return { error: "An account with this email already exists. Log in instead." };

  const jar = await cookies();
  const passwordHash = await hashPassword(password);
  const userId = await db.transaction(async (tx) => {
    const [u] = await tx
      .insert(users)
      .values({
        email,
        passwordHash,
        name,
        affiliate: cleanAffiliate(jar.get(AFF_COOKIE)?.value),
        campaign: cleanAffiliate(jar.get(CAM_COOKIE)?.value),
      })
      .returning({ id: users.id });
    await tx.insert(businesses).values({ userId: u.id, niche, name: business, ownerName: name, country });
    return u.id;
  });

  await claimUnmatchedPurchases(userId, email);
  await createSession(userId);
  redirect("/app?welcome=1");
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const [u] = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
  // Same message either way so the form can't be used to discover registered emails.
  if (!u || !(await verifyPassword(parsed.data.password, u.passwordHash))) {
    return { error: "Email or password is incorrect." };
  }
  await createSession(u.id);
  redirect("/app");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
