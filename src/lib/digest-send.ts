import "server-only";
import { randomBytes } from "node:crypto";
import { and, eq, gte } from "drizzle-orm";
import { db, expenses, jobs, users, type Business, type User } from "@/db";
import { getNiche } from "@/niches";
import { isElite } from "./auth";
import { settingsOf } from "./data";
import { buildDigest } from "./digest";
import { sendEmail } from "./email";
import { moneyFormatter } from "./format";
import { site } from "./site";

/** Builds and sends one user's weekly summary. Returns false if there was nothing to send or sending failed. */
export async function sendDigest(user: User, business: Business, appUrl = site.url, today = new Date()) {
  // A year of history is enough for the week, the month and the lapsed-customer check.
  const since = new Date(today.getTime() - 400 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [j, e] = await Promise.all([
    db.select().from(jobs).where(and(eq(jobs.businessId, business.id), eq(jobs.status, "completed"), gte(jobs.date, since))),
    db.select().from(expenses).where(and(eq(expenses.businessId, business.id), gte(expenses.date, since))),
  ]);
  if (j.length === 0 && e.length === 0) return false;

  let token = user.unsubscribeToken;
  if (!token) {
    token = randomBytes(24).toString("base64url");
    await db.update(users).set({ unsubscribeToken: token }).where(eq(users.id, user.id));
  }
  const unsubscribeUrl = `${appUrl}/api/unsubscribe?token=${token}`;
  const d = buildDigest({
    name: user.name,
    businessName: business.name,
    niche: getNiche(business.niche),
    settings: settingsOf(business),
    elite: isElite(user),
    jobs: j,
    expenses: e,
    today,
    money: moneyFormatter(business.country),
    appUrl,
    unsubscribeUrl,
  });
  const ok = await sendEmail({
    to: user.email,
    subject: d.subject,
    text: d.text,
    html: d.html,
    // RFC 8058 one-click unsubscribe (Gmail/Yahoo show an "Unsubscribe" button).
    headers: { "List-Unsubscribe": `<${unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  });
  if (ok) await db.update(users).set({ lastDigestAt: today }).where(eq(users.id, user.id));
  return ok;
}
