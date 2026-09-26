// Ad fraud helpers — pure (§47). Unit-testable.

export const CLICK_FLOOD_LIMIT = 5; // بیش از ۵ کلیک در دقیقه = مشکوک
export const IMPRESSION_FLOOD_LIMIT = 50; // بیش از ۵۰ نمایش در دقیقه = مشکوک
export const FLOOD_WINDOW_MS = 60_000;

// ریدایرکت ترکینگ فقط به مسیر داخلی مجاز است (جلوگیری از open-redirect)
export function isSafeRedirect(to: string | null): boolean {
  if (!to || !to.startsWith("/") || to.startsWith("//")) return false;
  return true;
}

export function isFlood(recentCount: number, limit: number): boolean {
  return recentCount >= limit;
}
