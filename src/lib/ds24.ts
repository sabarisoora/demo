// Digistore24 integration: IPN signature verification and checkout links.
import { createHash, timingSafeEqual } from "node:crypto";

export const AFF_COOKIE = "pq_aff";
export const CAM_COOKIE = "pq_cam";

/**
 * Digistore24's IPN signature (port of their reference `digistore_signature` PHP function):
 * drop sha_sign, sort keys (case-sensitive, byte order), skip empty values, concatenate
 * `key=value` + passphrase for each, then SHA-512, uppercase hex.
 */
export function ds24Signature(params: Record<string, string>, passphrase: string): string {
  const keys = Object.keys(params)
    .filter((k) => k !== "sha_sign" && k !== "SHASIGN")
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  let s = "";
  for (const key of keys) {
    const value = params[key];
    if (value === undefined || value === null || value === "") continue;
    s += `${key}=${value}${passphrase}`;
  }
  return createHash("sha512").update(s, "utf8").digest("hex").toUpperCase();
}

export function verifyDs24Signature(params: Record<string, string>, passphrase: string): boolean {
  const given = (params.sha_sign ?? params.SHASIGN ?? "").toUpperCase();
  if (!passphrase || !given) return false;
  const expected = ds24Signature(params, passphrase);
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function eliteProductIds(): string[] {
  const list = (process.env.DS24_ELITE_PRODUCT_IDS || process.env.NEXT_PUBLIC_DS24_ELITE_PRODUCT_ID || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set(list)];
}

/**
 * The DS24 order form for Elite. `custom` carries our user id back in the IPN, so the
 * payment unlocks the right account even if they type a different email at checkout.
 * `aff`/`cam` credit the affiliate who referred this user when they first signed up.
 */
export function eliteCheckoutUrl(user: { id: string; email: string; affiliate: string | null; campaign: string | null }) {
  const productId = process.env.NEXT_PUBLIC_DS24_ELITE_PRODUCT_ID;
  if (!productId) return null;
  const params = new URLSearchParams({ custom: user.id, email: user.email });
  if (user.affiliate) params.set("aff", user.affiliate);
  if (user.campaign) params.set("cam", user.campaign);
  return `https://www.digistore24.com/product/${encodeURIComponent(productId)}?${params}`;
}

/** Affiliate ids are DS24 usernames; keep them tame before storing or reflecting them. */
export function cleanAffiliate(v: string | null | undefined): string | null {
  const s = (v ?? "").trim();
  return /^[A-Za-z0-9_.-]{1,64}$/.test(s) ? s : null;
}
