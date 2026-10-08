import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db, ipnEvents, users } from "@/db";
import { eliteProductIds } from "./ds24";

export const GRANT_EVENTS = ["on_payment", "on_rebill_resumed"];
export const REVOKE_EVENTS = ["on_refund", "on_chargeback", "on_payment_missed"];
export const CANCEL_EVENTS = ["on_rebill_cancelled"];

const DAY = 24 * 60 * 60 * 1000;

/** Applies one DS24 billing event to a user's plan. */
export async function applyBillingEvent(userId: string, event: string, orderId: string | null, now = new Date()) {
  if (GRANT_EVENTS.includes(event)) {
    await db.update(users).set({ plan: "elite", eliteUntil: null, ds24OrderId: orderId }).where(eq(users.id, userId));
  } else if (REVOKE_EVENTS.includes(event)) {
    await db.update(users).set({ plan: "free", eliteUntil: null }).where(eq(users.id, userId));
  } else if (CANCEL_EVENTS.includes(event)) {
    // Cancelled subscriptions stay active to the end of the period they've paid for.
    // DS24 doesn't send that date on every account, so allow one billing month.
    await db.update(users).set({ eliteUntil: new Date(now.getTime() + 31 * DAY) }).where(eq(users.id, userId));
  }
}

/**
 * Someone may buy Elite on DS24 before creating an account (e.g. straight from an affiliate's
 * link). When they sign up with the same email, replay the latest billing event for it.
 */
export async function claimUnmatchedPurchases(userId: string, email: string) {
  const products = eliteProductIds();
  if (!products.length) return;
  const [latest] = await db
    .select()
    .from(ipnEvents)
    .where(
      and(
        eq(ipnEvents.email, email),
        inArray(ipnEvents.productId, products),
        inArray(ipnEvents.event, [...GRANT_EVENTS, ...REVOKE_EVENTS, ...CANCEL_EVENTS]),
      ),
    )
    .orderBy(desc(ipnEvents.receivedAt))
    .limit(1);
  if (!latest || latest.userId) return;
  await applyBillingEvent(userId, latest.event, latest.orderId, latest.receivedAt);
  await db.update(ipnEvents).set({ userId }).where(and(eq(ipnEvents.email, email), inArray(ipnEvents.productId, products)));
}
