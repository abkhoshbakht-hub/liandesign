"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { isFlood, CLICK_FLOOD_LIMIT, IMPRESSION_FLOOD_LIMIT, FLOOD_WINDOW_MS } from "@/lib/ads/fraud";

// ── Phase 5: ad tracking (§48) + anti-fraud (§47) ──

function clientIp(): string | null {
  const h = headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim().slice(0, 45);
  return h.get("x-real-ip")?.slice(0, 45) ?? null;
}

// ثبت نمایش‌ها (bulk) — فقط ایونت سالم در KPI می‌آید (Rule 8)
export async function logSponsoredViews(
  views: { campaignId: string | null; placementKey: string }[]
): Promise<void> {
  if (views.length === 0) return;
  try {
    const ip = clientIp();
    const windowStart = new Date(Date.now() - FLOOD_WINDOW_MS);
    let suspicious = false;
    if (ip) {
      const recent = await db.impressionEvent.count({
        where: { ip, placementKey: views[0].placementKey, createdAt: { gte: windowStart } },
      });
      suspicious = isFlood(recent, IMPRESSION_FLOOD_LIMIT);
    }
    await db.impressionEvent.createMany({
      data: views.map((v) => ({ campaignId: v.campaignId, placementKey: v.placementKey, ip, suspicious })),
    });
  } catch {
    // ترکینگ هرگز فلوی کاربر را خراب نمی‌کند
  }
}

// ثبت کلیک + تشخیص فلود؛ خروجی: آیا مشکوک بود
export async function trackClick(itemId: string): Promise<{
  ok: boolean;
  campaignId: string | null;
  placementKey: string;
  suspicious: boolean;
}> {
  const item = await db.campaignItem.findUnique({
    where: { id: itemId },
    select: { campaignId: true, placementId: true },
  });
  const placementKey = item?.placementId ?? "unknown";
  const campaignId = item?.campaignId ?? null;
  try {
    const ip = clientIp();
    let suspicious = false;
    if (ip && campaignId) {
      const windowStart = new Date(Date.now() - FLOOD_WINDOW_MS);
      const recent = await db.clickEvent.count({
        where: { campaignId, ip, createdAt: { gte: windowStart } },
      });
      suspicious = isFlood(recent, CLICK_FLOOD_LIMIT);
    }
    await db.clickEvent.create({ data: { campaignId, placementKey, ip, suspicious } });
    return { ok: true, campaignId, placementKey, suspicious };
  } catch {
    return { ok: true, campaignId, placementKey, suspicious: false };
  }
}

export async function logConversion(campaignId: string | null, kind = "generic"): Promise<void> {
  try {
    await db.conversionEvent.create({ data: { campaignId, kind } });
  } catch {
    // ignore
  }
}

// ── آمار کمپین برای داشبورد تبلیغ‌دهنده (§33) ──

export async function getCampaignStats(campaignId: string) {
  const [impressions, clicks, conversions] = await Promise.all([
    db.impressionEvent.count({ where: { campaignId, suspicious: false } }),
    db.clickEvent.count({ where: { campaignId, suspicious: false } }),
    db.conversionEvent.count({ where: { campaignId } }),
  ]);
  return {
    impressions,
    clicks,
    conversions,
    ctr: impressions > 0 ? Math.round((clicks / impressions) * 1000) / 10 : 0,
  };
}

// ── KPI درآمدی ادمین (§34-35) ──

export async function getAdsRevenue() {
  const paidOrders = await db.order.findMany({
    where: { status: "PAID", number: { startsWith: "ADS-" } },
    select: { id: true, total: true, createdAt: true },
  });
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sum = (rows: { total: number }[]) => rows.reduce((s, r) => s + r.total, 0);

  const [impressions, clicks, advertisers, campaigns, byPlacement, byModel] = await Promise.all([
    db.impressionEvent.count({ where: { suspicious: false } }),
    db.clickEvent.count({ where: { suspicious: false } }),
    db.advertiserProfile.count(),
    db.campaign.findMany({ select: { id: true, title: true, pricingModel: true, budget: true, status: true } }),
    db.campaignItem.groupBy({ by: ["placementId"], _sum: { price: true }, _count: { placementId: true } }),
    db.campaign.groupBy({ by: ["pricingModel"], _sum: { budget: true }, _count: { pricingModel: true } }),
  ]);

  const total = sum(paidOrders);

  // درآمد به‌تفکیک تبلیغ‌دهنده و مدل (از سفارش‌های پرداخت‌شده لینک‌شده به کمپین)
  const linked = await db.campaign.findMany({
    where: { orderId: { not: null } },
    select: {
      orderId: true,
      pricingModel: true,
      advertiser: { select: { company: true } },
    },
  });
  const paidTotals = new Map(paidOrders.map((o) => [o.id, o.total]));
  const byAdvertiser = new Map<string, number>();
  const revenueByModel = new Map<string, number>();
  for (const c of linked) {
    const t = c.orderId ? (paidTotals.get(c.orderId) ?? 0) : 0;
    if (t <= 0) continue;
    const name = c.advertiser.company ?? "بدون نام";
    byAdvertiser.set(name, (byAdvertiser.get(name) ?? 0) + t);
    revenueByModel.set(c.pricingModel, (revenueByModel.get(c.pricingModel) ?? 0) + t);
  }

  // fill rate: پلیسمنت‌های دارای کمپین فعال / کل پلیسمنت‌های فعال
  const [placementsTotal, filled] = await Promise.all([
    db.adPlacement.count({ where: { active: true } }),
    db.campaignItem.findMany({
      where: { campaign: { status: "ACTIVE" } },
      select: { placementId: true },
      distinct: ["placementId"],
    }),
  ]);

  return {
    total,
    today: sum(paidOrders.filter((o) => o.createdAt >= startOfDay)),
    month: sum(paidOrders.filter((o) => o.createdAt >= startOfMonth)),
    impressions,
    clicks,
    ctr: impressions > 0 ? Math.round((clicks / impressions) * 1000) / 10 : 0,
    advertisers,
    arpa: advertisers > 0 ? Math.round(total / advertisers) : 0,
    rpm: impressions > 0 ? Math.round((total / impressions) * 1000) : 0,
    fillRate: placementsTotal > 0 ? Math.round((filled.length / placementsTotal) * 100) : 0,
    campaigns: campaigns.map((c) => ({ id: c.id, title: c.title, model: c.pricingModel, budget: c.budget, status: c.status })),
    byPlacement,
    byModel,
    revenueByAdvertiser: Array.from(byAdvertiser.entries()).map(([name, revenue]) => ({ name, revenue })),
    revenueByModel: Array.from(revenueByModel.entries()).map(([model, revenue]) => ({ model, revenue })),
  };
}
