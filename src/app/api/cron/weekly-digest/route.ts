// Runs daily via Vercel Cron (vercel.json). Sends each confirmed, opted-in user a summary once a week:
// anyone whose last summary was 7+ days ago (or never, if they joined 3+ days ago) is due.
// Sending is capped per run so it fits serverless time limits; the rest go out the next day.
import { and, asc, eq, isNotNull, isNull, lt, or, sql } from "drizzle-orm";
import { db, businesses, users } from "@/db";
import { sendDigest } from "@/lib/digest-send";
import { emailConfigured } from "@/lib/email";
import { site } from "@/lib/site";

export const maxDuration = 300;
const BATCH = 150;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  // Vercel sends "Authorization: Bearer <CRON_SECRET>" on cron calls when CRON_SECRET is set.
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!emailConfigured()) return Response.json({ skipped: "email not configured" });

  const due = await db
    .select({ user: users, business: businesses })
    .from(users)
    .innerJoin(businesses, eq(businesses.userId, users.id))
    .where(
      and(
        isNotNull(users.emailVerifiedAt),
        eq(users.digestOptOut, false),
        lt(users.createdAt, sql`now() - interval '3 days'`),
        or(isNull(users.lastDigestAt), lt(users.lastDigestAt, sql`now() - interval '6 days 12 hours'`)),
      ),
    )
    .orderBy(asc(users.lastDigestAt))
    .limit(BATCH);

  let sent = 0;
  let skipped = 0;
  for (const { user, business } of due) {
    try {
      if (await sendDigest(user, business, site.url)) sent++;
      else skipped++;
    } catch (e) {
      skipped++;
      console.error("digest failed for", user.id, e);
    }
  }
  return Response.json({ due: due.length, sent, skipped });
}
