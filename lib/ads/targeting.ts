// Sponsored matching & slot picking — pure functions (§8, §22 ساده‌شده فاز ۳).
// No DB: unit-testable.

export function matchKeyword(query: string, keyword: string): boolean {
  const q = query.trim().toLowerCase();
  const k = keyword.trim().toLowerCase();
  if (!q || !k) return false;
  return q.includes(k) || k.includes(q);
}

interface Slottable {
  priority: number;
  createdAt: Date;
}

// اولویت بالاتر اول؛ تساوی → قدیمی‌تر اول؛ سپس سقف تعداد
export function pickSlots<T extends Slottable>(items: T[], limit: number): T[] {
  return [...items]
    .sort((a, b) => b.priority - a.priority || a.createdAt.getTime() - b.createdAt.getTime())
    .slice(0, Math.max(0, limit));
}

// کمپین در بازه زمانی معتبر است؟
export function isLiveWindow(startsAt: Date | null, endsAt: Date | null, now = new Date()): boolean {
  if (startsAt && startsAt > now) return false;
  if (endsAt && endsAt < now) return false;
  return true;
}

export type DeviceKind = "mobile" | "desktop";

export function deviceFromUA(ua: string): DeviceKind {
  return /mobile|android|iphone|ipad|phone/i.test(ua) ? "mobile" : "desktop";
}

export interface TargetCtx {
  device: DeviceKind;
  categoryId?: string | null;
  now?: Date;
}

// همه قوانین تارگتینگ باید برقرار باشند (§25). SEGMENT فعلاً permissive (فاز بعد).
export function matchesTargeting(rules: { type: string; value: string }[], ctx: TargetCtx): boolean {
  const now = ctx.now ?? new Date();
  for (const r of rules) {
    if (r.type === "DEVICE") {
      const want = r.value.toLowerCase() === "mobile" ? "mobile" : "desktop";
      if (ctx.device !== want) return false;
    } else if (r.type === "CATEGORY") {
      if (ctx.categoryId && r.value !== ctx.categoryId) return false;
    } else if (r.type === "TIME") {
      const v = r.value.toLowerCase();
      if (v === "weekend") {
        const d = now.getDay();
        if (d !== 4 && d !== 5) return false; // پنجشنبه/جمعه
      } else if (v === "weekday") {
        const d = now.getDay();
        if (d === 4 || d === 5) return false;
      } else {
        const m = v.match(/^hour:(\d{1,2})-(\d{1,2})$/);
        if (m) {
          const h = now.getHours();
          const from = parseInt(m[1], 10);
          const to = parseInt(m[2], 10);
          if (from <= to ? h < from || h >= to : h < from && h >= to) return false;
        }
      }
    }
  }
  return true;
}

// سلامت pacing (§23): ۱ یعنی روی برنامه؛ کمتر = جلوتر از بودجه (سرکوب)؛ بیشتر = عقب (تقویت)
export function pacingScore(opts: {
  startsAt: Date | null;
  endsAt: Date | null;
  budget: number;
  spent: number;
  now?: Date;
}): number {
  const now = opts.now ?? new Date();
  if (!opts.startsAt || !opts.endsAt || opts.budget <= 0) return 1;
  const total = opts.endsAt.getTime() - opts.startsAt.getTime();
  if (total <= 0) return 1;
  const elapsed = Math.min(1, Math.max(0, (now.getTime() - opts.startsAt.getTime()) / total));
  const expected = opts.budget * elapsed;
  if (expected <= 0) return 1.2;
  const ratio = opts.spent / expected;
  if (ratio >= 2) return 0.2;
  if (ratio >= 1.2) return 0.6;
  if (ratio <= 0.5) return 1.5;
  return 1;
}

// امتیاز نهایی rotation (§22): اولویت + bid نرمال‌شده + pacing
export function scoreCampaign(opts: {
  priority: number;
  bid?: number | null;
  maxBid?: number | null;
  pacing?: number;
}): number {
  const bidPart = opts.maxBid && opts.maxBid > 0 ? ((opts.bid ?? 0) / opts.maxBid) * 5 : 0;
  return opts.priority * 10 + bidPart + (opts.pacing ?? 1) * 5;
}
