import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { markEmailVerified } from "@/lib/entitlements";
import { consumeToken } from "@/lib/tokens";

// Target of the "Confirm my email" link.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const userId = await consumeToken(token, "verify");
  const to = new URL("/app", request.url);
  if (!userId) {
    to.searchParams.set("verify", "invalid");
    return NextResponse.redirect(to);
  }
  const [u] = await db.select({ email: users.email, verified: users.emailVerifiedAt }).from(users).where(eq(users.id, userId)).limit(1);
  if (u && !u.verified) await markEmailVerified(userId, u.email);
  to.searchParams.set("verify", "ok");
  return NextResponse.redirect(to);
}
