import { NextResponse, type NextRequest } from "next/server";
import { AFF_COOKIE, CAM_COOKIE, cleanAffiliate } from "@/lib/ds24";

const SIXTY_DAYS = 60 * 24 * 60 * 60;

// Remembers the Digistore24 affiliate (?aff=) and campaign (?cam=) a visitor arrived with,
// so the affiliate is credited when this visitor signs up and later upgrades to Elite.
export function proxy(request: NextRequest) {
  const aff = cleanAffiliate(request.nextUrl.searchParams.get("aff"));
  const res = NextResponse.next();
  if (aff) {
    const opts = { maxAge: SIXTY_DAYS, path: "/", sameSite: "lax" as const, httpOnly: true };
    res.cookies.set(AFF_COOKIE, aff, opts);
    const cam = cleanAffiliate(request.nextUrl.searchParams.get("cam"));
    if (cam) res.cookies.set(CAM_COOKIE, cam, opts);
    else res.cookies.delete(CAM_COOKIE);
  }
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico|webp)$).*)"],
};
