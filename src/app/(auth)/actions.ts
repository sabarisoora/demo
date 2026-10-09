"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, businesses, users } from "@/db";
import { createSession, destroySession, destroyUserSessions, hashPassword, requireSession, verifyPassword } from "@/lib/auth";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/account-emails";
import { AFF_COOKIE, CAM_COOKIE, cleanAffiliate } from "@/lib/ds24";
import { countries } from "@/lib/countries";
import { emailConfigured } from "@/lib/email";
import { markEmailVerified } from "@/lib/entitlements";
import { clientIp, consumeToken, rateLimit } from "@/lib/tokens";
import { site } from "@/lib/site";
import { niches } from "@/niches";

export type FormState = { error?: string; ok?: string } | undefined;

const TOO_MANY = "Too many attempts. Please wait a few minutes and try again.";
const password = z.string().min(8, "Use at least 8 characters").max(200);

const signupSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100),
  business: z.string().trim().min(1, "Enter your business name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(200),
  password,
  country: z.string().refine((c) => countries.some((x) => x.name === c), "Pick a country"),
  niche: z.string().refine((n) => n in niches, "Unknown business type"),
  terms: z.literal("on", { error: "Please accept the Terms and Privacy Policy" }),
});

export async function signup(_: FormState, form: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, business, email, country, niche } = parsed.data;
  if (!(await rateLimit(`signup:${await clientIp()}`, 10, 3600))) return { error: TOO_MANY };

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return { error: "An account with this email already exists. Log in instead." };

  const jar = await cookies();
  const passwordHash = await hashPassword(parsed.data.password);
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

  await sendVerificationEmail({ id: userId, email, name });
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
  const { email } = parsed.data;
  const ip = await clientIp();
  // Per-account limit stops password guessing; per-IP limit stops spraying many accounts.
  if (!(await rateLimit(`login:${email}`, 10, 900)) || !(await rateLimit(`login-ip:${ip}`, 40, 900))) return { error: TOO_MANY };

  const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  // Same message either way so the form can't be used to discover registered emails.
  if (!u || !(await verifyPassword(parsed.data.password, u.passwordHash))) {
    return { error: "Email or password is incorrect." };
  }
  await createSession(u.id);
  // Only same-site paths ("/invite/…"), never "//evil.com" or absolute URLs.
  const next = String(form.get("next") ?? "");
  redirect(/^\/(?![\/\\])[\w\-./?=&%]*$/.test(next) ? next : "/app");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function requestPasswordReset(_: FormState, form: FormData): Promise<FormState> {
  const email = z.string().trim().toLowerCase().email().safeParse(form.get("email"));
  if (!email.success) return { error: "Enter a valid email." };
  if (!(await rateLimit(`reset:${email.data}`, 5, 3600)) || !(await rateLimit(`reset-ip:${await clientIp()}`, 20, 3600))) {
    return { error: TOO_MANY };
  }
  if (!emailConfigured() && process.env.NODE_ENV === "production") {
    return { error: `Password reset emails aren't set up yet. Email ${site.supportEmail} and we'll help you get back in.` };
  }
  const [u] = await db.select().from(users).where(eq(users.email, email.data)).limit(1);
  if (u) await sendPasswordResetEmail(u);
  // Same answer whether or not the account exists.
  return { ok: "If an account exists for that email, a reset link is on its way. Check your inbox (and spam folder)." };
}

export async function resetPassword(_: FormState, form: FormData): Promise<FormState> {
  const parsed = z.object({ token: z.string().min(1), password }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (form.get("password") !== form.get("confirm")) return { error: "The two passwords don't match." };
  const userId = await consumeToken(parsed.data.token, "reset");
  if (!userId) return { error: "This reset link has expired or was already used. Request a new one." };

  // Reaching this link proves they own the inbox, so the email counts as verified too.
  const [u] = await db
    .update(users)
    .set({ passwordHash: await hashPassword(parsed.data.password) })
    .where(eq(users.id, userId))
    .returning();
  if (!u.emailVerifiedAt) await markEmailVerified(userId, u.email);
  await destroyUserSessions(userId);
  await createSession(userId);
  redirect("/app?reset=1");
}

export async function resendVerification(): Promise<FormState> {
  const { user } = await requireSession();
  if (user.emailVerifiedAt) return { ok: "Your email is already confirmed." };
  if (!(await rateLimit(`verify:${user.id}`, 3, 3600))) return { error: TOO_MANY };
  const sent = await sendVerificationEmail(user);
  if (!sent && process.env.NODE_ENV === "production") return { error: `We couldn't send the email. Contact ${site.supportEmail}.` };
  return { ok: `Sent! Check ${user.email} (and your spam folder).` };
}
