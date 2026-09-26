import type { NextRequest } from "next/server";

// In-memory sliding-window rate limit (§66).
// NOTE تک‌نمونه‌ای است؛ برای چند نمونه‌ای به Redis منتقل شود.
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit = 60, windowMs = 60_000): boolean {
  const now = Date.now();
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) return false;
  arr.push(now);
  buckets.set(key, arr);
  if (buckets.size > 10000) buckets.clear();
  return true;
}

export function clientKey(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 45) ?? "unknown";
}
