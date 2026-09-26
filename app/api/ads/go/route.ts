import { NextRequest, NextResponse } from "next/server";
import { trackClick } from "@/lib/data/ads-track";
import { isSafeRedirect } from "@/lib/ads/fraud";
import { rateLimit, clientKey } from "@/lib/rate-limit";

// ترکینگ کلیک + ریدایرکت امن (§48، §57)
export async function GET(req: NextRequest) {
  const item = req.nextUrl.searchParams.get("item") ?? "";
  const to = req.nextUrl.searchParams.get("to") ?? "/";
  const dest = isSafeRedirect(to) ? to : "/";
  if (!rateLimit(`ads:go:${clientKey(req)}`, 120)) {
    return NextResponse.redirect(new URL(dest, req.url), 302);
  }
  await trackClick(item);
  return NextResponse.redirect(new URL(dest, req.url), 302);
}
