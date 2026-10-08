import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";

async function unsubscribe(token: string | null) {
  if (!token || token.length > 100) return false;
  const rows = await db.update(users).set({ digestOptOut: true }).where(eq(users.unsubscribeToken, token)).returning({ id: users.id });
  return rows.length > 0;
}

// Link in the email: unsubscribe, then show a confirmation page.
export async function GET(request: NextRequest) {
  const ok = await unsubscribe(request.nextUrl.searchParams.get("token"));
  return NextResponse.redirect(new URL(`/unsubscribed${ok ? "" : "?invalid=1"}`, request.url));
}

// One-click unsubscribe from the mail client's button (RFC 8058).
export async function POST(request: NextRequest) {
  await unsubscribe(request.nextUrl.searchParams.get("token"));
  return new Response("Unsubscribed", { status: 200 });
}
