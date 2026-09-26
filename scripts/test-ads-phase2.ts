// Phase 2-3 engine unit tests (pure functions only). Run: npx tsx scripts/test-ads-phase2.ts
import { quote, campaignTotal } from "../lib/ads/pricing";
import { canTransition } from "../lib/ads/transitions";
import { matchKeyword, pickSlots, isLiveWindow, deviceFromUA, matchesTargeting, pacingScore, scoreCampaign } from "../lib/ads/targeting";
import { validateCreative } from "../lib/ads/creative";
import { isSafeRedirect, isFlood } from "../lib/ads/fraud";
import { creditBonus } from "../lib/ads/credits";
import { campaignSubmitSchema, allocateSchema } from "../lib/validations/ads";

let pass = 0;
let fail = 0;
function eq(name: string, got: unknown, want: unknown) {
  if (got === want) {
    pass++;
    console.log(`ok: ${name}`);
  } else {
    fail++;
    console.log(`FAIL: ${name} — got ${got}, want ${want}`);
  }
}

const F = {
  placement_homepage_hero: 3.0,
  placement_marketplace_top: 2.0,
  placement_default: 1.0,
  device_mobile: 1.2,
  priority_boost: 1.5,
  exclusive: 5.0,
};

// pricing (§18-19)
eq("cpm hero", quote({ model: "CPM", base: 45000, placementKey: "homepage.hero", factors: F }), 135000);
eq(
  "cpm hero+mobile+priority",
  quote({ model: "CPM", base: 45000, placementKey: "homepage.hero", factors: F, device: "mobile", priority: true }),
  243000
);
eq(
  "cpm hero exclusive",
  quote({ model: "CPM", base: 45000, placementKey: "homepage.hero", factors: F, exclusive: true }),
  675000
);
eq(
  "unknown placement → default",
  quote({ model: "CPM", base: 45000, placementKey: "footer", factors: F }),
  45000
);
eq("cpm total 100k", campaignTotal({ model: "CPM", unitPrice: 135000, impressions: 100000 }), 13500000);
eq("cpc total", campaignTotal({ model: "CPC", unitPrice: 15000, clicks: 200 }), 3000000);
eq("fixed total", campaignTotal({ model: "FIXED_TIME", unitPrice: 5000000 }), 5000000);

// state machine (§41)
eq("draft→review (admin)", canTransition("DRAFT", "PENDING_REVIEW", true), true);
eq("draft→review (owner)", canTransition("DRAFT", "PENDING_REVIEW", false), true);
eq("draft→active blocked", canTransition("DRAFT", "ACTIVE", true), false);
eq("review→approved owner blocked", canTransition("PENDING_REVIEW", "APPROVED", false), false);
eq("review→approved admin", canTransition("PENDING_REVIEW", "APPROVED", true), true);
eq("active→paused", canTransition("ACTIVE", "PAUSED", true), true);
eq("paused→active", canTransition("PAUSED", "ACTIVE", true), true);
eq("completed terminal", canTransition("COMPLETED", "ACTIVE", true), false);
eq("payment→contract (no skip)", canTransition("PAYMENT_RECEIVED", "ACTIVE", true), false);

// sponsored matching (§8)
eq("keyword exact", matchKeyword("سایت فروشگاهی", "سایت فروشگاهی"), true);
eq("keyword partial", matchKeyword("دنبال سایت فروشگاهی خوبم", "فروشگاهی"), true);
eq("keyword reverse", matchKeyword("فروشگاهی", "سایت فروشگاهی ارزان"), true);
eq("keyword miss", matchKeyword("رستوران", "فروشگاهی"), false);
eq("keyword empty", matchKeyword("", "فروشگاهی"), false);

const now = new Date();
eq("live no bounds", isLiveWindow(null, null, now), true);
eq("live inside", isLiveWindow(new Date(now.getTime() - 1000), new Date(now.getTime() + 1000), now), true);
eq("not started", isLiveWindow(new Date(now.getTime() + 1000), null, now), false);
eq("ended", isLiveWindow(null, new Date(now.getTime() - 1000), now), false);

const slots = pickSlots(
  [
    { priority: 1, createdAt: new Date("2026-01-01") },
    { priority: 5, createdAt: new Date("2026-02-01") },
    { priority: 5, createdAt: new Date("2026-01-15") },
  ],
  2
);
eq("slots order", slots[0].createdAt.toISOString(), new Date("2026-01-15").toISOString());
eq("slots limit", slots.length, 2);

eq("creative image ok", validateCreative({ kind: "IMAGE", fileUrl: "https://x.ir/a.png", linkUrl: "https://x.ir" }).length, 0);
eq("creative image missing", validateCreative({ kind: "IMAGE" }).length > 0, true);
eq("creative bad ext", validateCreative({ kind: "IMAGE", fileUrl: "https://x.ir/a.exe" }).length > 0, true);
eq("creative bad url", validateCreative({ kind: "IMAGE", fileUrl: "https://x.ir/a.png", linkUrl: "ftp://x" }).length > 0, true);
eq("creative html ok", validateCreative({ kind: "HTML", html: "<b>x</b>" }).length, 0);
eq("creative html empty", validateCreative({ kind: "HTML", html: " " }).length > 0, true);

eq("redirect internal", isSafeRedirect("/websites/x"), true);
eq("redirect protocol-relative blocked", isSafeRedirect("//evil.ir"), false);
eq("redirect absolute blocked", isSafeRedirect("https://evil.ir"), false);
eq("redirect empty blocked", isSafeRedirect(""), false);
eq("flood over", isFlood(5, 5), true);
eq("flood under", isFlood(4, 5), false);

eq("credit bonus", creditBonus(30000000, 30000000, 10).bonus, 3000000);
eq("credit total", creditBonus(30000000, 30000000, 10).total, 33000000);
eq("credit below threshold", creditBonus(10000000, 30000000, 10).bonus, 0);
eq("credit invalid", creditBonus(-5, 30000000, 10).total, 0);

eq("ua mobile", deviceFromUA("Mozilla/5.0 (iPhone; CPU iPhone OS 17)"), "mobile");
eq("ua desktop", deviceFromUA("Mozilla/5.0 (Windows NT 10.0; Win64; x64)"), "desktop");
eq("target device ok", matchesTargeting([{ type: "DEVICE", value: "mobile" }], { device: "mobile" }), true);
eq("target device miss", matchesTargeting([{ type: "DEVICE", value: "mobile" }], { device: "desktop" }), false);
eq("target category ok", matchesTargeting([{ type: "CATEGORY", value: "c1" }], { device: "desktop", categoryId: "c1" }), true);
eq("target category miss", matchesTargeting([{ type: "CATEGORY", value: "c1" }], { device: "desktop", categoryId: "c2" }), false);
eq("target hour in", matchesTargeting([{ type: "TIME", value: "hour:9-18" }], { device: "desktop", now: new Date(2026, 8, 7, 12) }), true);
eq("target hour out", matchesTargeting([{ type: "TIME", value: "hour:9-18" }], { device: "desktop", now: new Date(2026, 8, 7, 20) }), false);

const t0 = new Date(2026, 8, 1).getTime();
const t10 = new Date(2026, 8, 11).getTime();
eq("pacing on-track", pacingScore({ startsAt: new Date(t0), endsAt: new Date(t10), budget: 100, spent: 50, now: new Date(t0 + (t10 - t0) / 2) }), 1);
eq("pacing over", pacingScore({ startsAt: new Date(t0), endsAt: new Date(t10), budget: 100, spent: 120, now: new Date(t0 + (t10 - t0) / 2) }), 0.2);
eq("pacing under", pacingScore({ startsAt: new Date(t0), endsAt: new Date(t10), budget: 100, spent: 10, now: new Date(t0 + (t10 - t0) / 2) }), 1.5);
eq("score priority wins", scoreCampaign({ priority: 5, pacing: 1 }) > scoreCampaign({ priority: 1, pacing: 1 }), true);

eq("zod bad kind", campaignSubmitSchema.safeParse({ title: "x", kind: "NOPE", budget: 5 }).success, false);
eq("zod short title", campaignSubmitSchema.safeParse({ title: "ab", kind: "DISPLAY", budget: 5 }).success, false);
eq("zod ok", campaignSubmitSchema.safeParse({ title: "تست", kind: "DISPLAY", budget: 5 }).success, true);
eq("zod bad period", allocateSchema.safeParse({ campaignId: "c", placementId: "p", period: "99", amount: 1 }).success, false);
eq("zod ok alloc", allocateSchema.safeParse({ campaignId: "c", placementId: "p", period: "2026-09", amount: 1 }).success, true);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
