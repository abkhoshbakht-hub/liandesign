import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "lian-ref";
const MAX_AGE = 60 * 60 * 24 * 30; // ۳۰ روز

// Captures cross-site referral (?source=&campaign=&website_id=) into a
// cookie. No personal data is transferred — only campaign attribution.
export function middleware(req: NextRequest) {
  const source = req.nextUrl.searchParams.get("source");
  if (!source) return NextResponse.next();

  const res = NextResponse.next();
  res.cookies.set(
    COOKIE_NAME,
    JSON.stringify({
      source,
      campaign: req.nextUrl.searchParams.get("campaign") ?? null,
      websiteId: req.nextUrl.searchParams.get("website_id") ?? null,
      ts: Date.now(),
    }),
    { httpOnly: true, sameSite: "lax", path: "/", maxAge: MAX_AGE }
  );
  return res;
}

export const config = {
  matcher: ["/", "/websites/:path*"],
};
