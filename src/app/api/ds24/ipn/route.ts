// Digistore24 IPN (Instant Payment Notification) endpoint.
// In DS24: Settings → Integrations (IPN) → add "Generic" connection with URL
//   https://YOUR-DOMAIN/api/ds24/ipn
// and the same SHA passphrase you put in DS24_IPN_PASSPHRASE.
import { eq } from "drizzle-orm";
import { db, ipnEvents, users } from "@/db";
import { eliteProductIds, verifyDs24Signature } from "@/lib/ds24";
import { applyBillingEvent } from "@/lib/entitlements";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const text = (body: string, status = 200) => new Response(body, { status, headers: { "content-type": "text/plain" } });

export async function POST(request: Request) {
  const passphrase = process.env.DS24_IPN_PASSPHRASE ?? "";
  if (!passphrase) return text("IPN passphrase not configured", 500);

  const form = await request.formData();
  const params: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string") params[k] = v;

  if (!verifyDs24Signature(params, passphrase)) return text("ERROR: invalid sha_sign", 403);

  const event = params.event ?? "";
  // DS24 expects the literal body "OK" for every event it should stop retrying.
  if (event === "connection_test") return text("OK");

  const productId = params.product_id ?? "";
  const orderId = params.order_id || null;
  const email = (params.email ?? "").trim().toLowerCase() || null;

  // Match the account: `custom` carries our user id from the checkout link; fall back to email.
  let userId: string | null = null;
  const custom = params.custom ?? "";
  if (UUID.test(custom)) {
    const [u] = await db.select({ id: users.id }).from(users).where(eq(users.id, custom)).limit(1);
    userId = u?.id ?? null;
  }
  if (!userId && email) {
    const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    userId = u?.id ?? null;
  }

  const isElite = eliteProductIds().includes(productId);
  await db.insert(ipnEvents).values({ event, orderId, productId, email, userId, payload: params });

  // Only Elite products change plans; other products (e.g. the Excel downloads) are just logged.
  // Unmatched buyers are granted Elite when they sign up with the same email.
  if (isElite && userId) await applyBillingEvent(userId, event, orderId);

  return text("OK");
}
