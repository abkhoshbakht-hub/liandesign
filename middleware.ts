import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "lian-ref";
const MAX_AGE = 60 * 60 * 24 * 30; // ۳۰ روز

// ---------------------------------------------------------------------------
// Anti-abuse rate limiting (in-memory, per instance)
// Purpose: stop credential brute-force, form/chat/coupon spam, fake ad clicks
// and upload flooding. Counts POST requests and API traffic only, so normal
// browsing and static demo previews are never throttled.
// ---------------------------------------------------------------------------

type Bucket = { limit: number; windowMs: number };

const RULES: { match: (p: string, m: string) => boolean; bucket: Bucket; name: string }[] = [
  // Auth: credential stuffing / brute force
  {
    match: (p, m) =>
      m === "POST" && (p === "/api/auth/callback/credentials" || p === "/api/auth/signin"),
    bucket: { limit: 10, windowMs: 5 * 60_000 },
    name: "auth",
  },
  // Chatbot / AI conversation abuse
  { match: (p, m) => m === "POST" && p.startsWith("/api/chat"), bucket: { limit: 30, windowMs: 5 * 60_000 }, name: "chat" },
  // File upload flooding (disk exhaustion)
  {
    match: (p, m) => m === "POST" && p === "/api/ads/creative-upload",
    bucket: { limit: 15, windowMs: 60 * 60_000 },
    name: "upload",
  },
  // Any other mutation (server actions, tickets, coupons, branding requests...)
  {
    match: (p, m) => m === "POST" && !p.startsWith("/_next"),
    bucket: { limit: 80, windowMs: 5 * 60_000 },
    name: "post",
  },
  // Click / impression fraud
  {
    match: (p, m) =>
      m === "POST" && (p === "/api/ads/clicks" || p === "/api/ads/impressions" || p === "/api/ads/conversions"),
    bucket: { limit: 300, windowMs: 60_000 },
    name: "adtrack",
  },
  { match: (p, m) => m === "POST" && p === "/api/analytics", bucket: { limit: 200, windowMs: 60_000 }, name: "analytics" },
  // Read APIs
  {
    match: (p, m) => m === "GET" && p.startsWith("/api/") && !p.startsWith("/api/auth/session"),
    bucket: { limit: 300, windowMs: 60_000 },
    name: "apiget",
  },
];

const store = new Map<string, { count: number; reset: number }>();
let lastSweep = 0;

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function hit(key: string, limit: number, windowMs: number): { limited: boolean; retryAfter: number } {
  const now = Date.now();

  // Periodically drop expired entries so the map cannot grow without bound.
  if (now - lastSweep > 60_000) {
    lastSweep = now;
    for (const [k, v] of Array.from(store.entries())) if (v.reset <= now) store.delete(k);
  }

  const cur = store.get(key);
  if (!cur || cur.reset <= now) {
    store.set(key, { count: 1, reset: now + windowMs });
    return { limited: false, retryAfter: 0 };
  }
  cur.count += 1;
  if (cur.count > limit) {
    return { limited: true, retryAfter: Math.ceil((cur.reset - now) / 1000) };
  }
  return { limited: false, retryAfter: 0 };
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  for (const rule of RULES) {
    if (!rule.match(pathname, method)) continue;
    const key = `${rule.name}:${clientIp(req)}`;
    const { limited, retryAfter } = hit(key, rule.bucket.limit, rule.bucket.windowMs);
    if (limited) {
      return new NextResponse(
        JSON.stringify({ ok: false, error: "RATE_LIMITED", retryAfter }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(rule.bucket.limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
    break;
  }

  // Captures cross-site referral (?source=&campaign=&website_id=) into a
  // cookie. No personal data is transferred — only campaign attribution.
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
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|previews/|thumbs/|fonts/|.*\\.(?:png|jpg|jpeg|webp|gif|svg|ico|woff2?|ttf|txt|xml|txt)$).*)",
  ],
};