"use server";

import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/data/coupons";
import { canTransition } from "@/lib/ads/transitions";

// ── Phase 2: Allocation Engine (§21) + Campaign State Machine (§41, §66) ──

type Tx = Parameters<Parameters<typeof db.$transaction>[0]>[0];

async function audit(
  tx: Tx,
  action: string,
  entity: string | null,
  entityId: string | null,
  actorId?: string | null
) {
  await tx.auditLog.create({ data: { action, entity, entityId, actorId: actorId ?? null } });
}

async function currentActor() {
  const { getTestActor } = await import("@/lib/test-actor");
  const test = getTestActor();
  if (test) return test;
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  return user?.id ? { id: user.id, role: user.role ?? "CUSTOMER" } : null;
}

// ── Availability (§20) — public ──

export async function getAvailability(placementKey: string, period: string) {
  const inv = await db.adInventory.findFirst({
    where: { placement: { key: placementKey, active: true }, period },
    include: { placement: { select: { key: true, name: true, exclusive: true } } },
  });
  if (!inv) return null;
  return {
    placement: inv.placement,
    period: inv.period,
    capacity: inv.capacity,
    allocated: inv.allocated,
    remaining: Math.max(0, inv.capacity - inv.allocated),
    overbooking: inv.overbooking,
  };
}

// ── Allocation — transaction-safe (§21) ──

export async function allocateInventory(
  campaignId: string,
  placementId: string,
  period: string,
  amount: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  const { allocateSchema, firstError } = await import("@/lib/validations/ads");
  const parsed = allocateSchema.safeParse({ campaignId, placementId, period, amount });
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  try {
    await db.$transaction(async (tx) => {
      const inv = await tx.adInventory.findUnique({
        where: { placementId_period: { placementId, period } },
      });
      if (!inv) throw new Error("ظرفیتی برای این دوره ثبت نشده است");
      if (!inv.overbooking && inv.allocated + amount > inv.capacity) {
        throw new Error(`ظرفیت کافی نیست (باقیمانده: ${inv.capacity - inv.allocated})`);
      }
      await tx.inventoryAllocation.create({ data: { inventoryId: inv.id, campaignId, amount } });
      await tx.adInventory.update({
        where: { id: inv.id },
        data: { allocated: { increment: amount } },
      });
      await audit(tx, "inventory.allocate", "Campaign", campaignId, admin.id);
    });
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "خطا در تخصیص" };
  }
}

export async function releaseAllocation(
  allocationId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };

  try {
    await db.$transaction(async (tx) => {
      const alloc = await tx.inventoryAllocation.findUnique({ where: { id: allocationId } });
      if (!alloc) throw new Error("تخصیص یافت نشد");
      await tx.inventoryAllocation.delete({ where: { id: allocationId } });
      await tx.adInventory.update({
        where: { id: alloc.inventoryId },
        data: { allocated: { decrement: alloc.amount } },
      });
      await audit(tx, "inventory.release", "Campaign", alloc.campaignId, admin.id);
    });
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "خطا در آزادسازی" };
  }
}

// ── Campaign State Machine (§41) — جدول در lib/ads/transitions.ts ──

export async function transitionCampaign(
  campaignId: string,
  to: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const actor = await currentActor();
  if (!actor) return { ok: false, error: "FORBIDDEN" };

  const campaign = await db.campaign.findUnique({
    where: { id: campaignId },
    include: { advertiser: { select: { userId: true } } },
  });
  if (!campaign) return { ok: false, error: "کمپین یافت نشد" };

  const isAdmin = actor.role === "ADMIN";
  const isOwner = campaign.advertiser.userId === actor.id;
  if (!isAdmin && !isOwner) return { ok: false, error: "FORBIDDEN" };
  if (campaign.status === to) return { ok: true }; // idempotent (§72)

  if (!canTransition(campaign.status, to, isAdmin)) {
    return { ok: false, error: `گذار از ${campaign.status} به ${to} مجاز نیست` };
  }

  // Revenue Protection (§66): فعال‌سازی فقط با قرارداد نهایی مؤثر
  if (to === "ACTIVE") {
    const contract = await db.advertisingContract.findFirst({
      where: { campaignId, finalApprovedAt: { not: null } },
    });
    if (!contract) return { ok: false, error: "بدون قرارداد نهایی، فعال‌سازی ممکن نیست" };
  }

  await db.$transaction(async (tx) => {
    await tx.campaign.update({ where: { id: campaignId }, data: { status: to as never } });
    await audit(tx, `campaign.${to.toLowerCase()}`, "Campaign", campaignId, actor.id);
  });
  if (to === "ACTIVE") {
    const { logEvent } = await import("@/lib/analytics");
    await logEvent("campaign_activated", { campaignId }, actor.id);
  }
  const tpl = NOTIFY_ON[to];
  if (tpl) await notify(campaign.advertiser.userId, tpl.title, `${campaign.title} — ${tpl.body}`);
  return { ok: true };
}

// ── Campaign CRUD (advertiser + admin) ──

export async function createCampaignDraft(
  title: string
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const actor = await currentActor();
  if (!actor) return { ok: false, error: "FORBIDDEN" };
  const clean = title.trim();
  if (clean.length < 3) return { ok: false, error: "عنوان کوتاه است" };

  const profile = await db.advertiserProfile.upsert({
    where: { userId: actor.id },
    create: { userId: actor.id },
    update: {},
  });
  const c = await db.campaign.create({
    data: { advertiserId: profile.id, title: clean, status: "DRAFT" },
  });
  await db.auditLog.create({ data: { action: "campaign.create", entity: "Campaign", entityId: c.id, actorId: actor.id } });
  return { ok: true, id: c.id };
}

export async function listCampaignsAdmin(status?: string) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  return db.campaign.findMany({
    where: status ? { status: status as never } : {},
    include: {
      advertiser: { select: { id: true, company: true, phone: true } },
      _count: { select: { items: true, allocations: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function getAdsOverview() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  const [placements, inventories, campaigns, pending, agg] = await Promise.all([
    db.adPlacement.count(),
    db.adInventory.count(),
    db.campaign.count(),
    db.campaign.count({ where: { status: "PENDING_REVIEW" } }),
    db.adInventory.aggregate({ _sum: { capacity: true, allocated: true } }),
  ]);
  const capacity = agg._sum.capacity ?? 0;
  const allocated = agg._sum.allocated ?? 0;
  return {
    placements,
    inventories,
    campaigns,
    pending,
    capacity,
    allocated,
    utilization: capacity > 0 ? Math.round((allocated / capacity) * 100) : 0,
  };
}

export async function listMyCampaigns() {
  const actor = await currentActor();
  if (!actor) throw new Error("FORBIDDEN");
  const profile = await db.advertiserProfile.findUnique({ where: { userId: actor.id } });
  if (!profile) return [];
  return db.campaign.findMany({
    where: { advertiserId: profile.id },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });
}

// داشبورد تبلیغ‌دهنده (§33): آمار هر کمپین + هزینه و باقیمانده
export async function listMyCampaignsWithStats() {
  const { getCampaignStats } = await import("@/lib/data/ads-track");
  const campaigns = await listMyCampaigns();
  return Promise.all(
    campaigns.map(async (c) => {
      const [stats, order] = await Promise.all([
        getCampaignStats(c.id),
        c.orderId
          ? db.order.findUnique({ where: { id: c.orderId }, select: { total: true, status: true, number: true } })
          : null,
      ]);
      const spend = order && order.status === "PAID" ? order.total : 0;
      return { ...c, stats, order, spend, remaining: Math.max(0, c.budget - spend) };
    })
  );
}

// ── Advertiser overview (§57) ──

export async function getAdvertiserOverview() {
  const { getCampaignStats } = await import("@/lib/data/ads-track");
  const { getCreditBalance } = await import("@/lib/data/ads-shop");
  const actor = await currentActor();
  if (!actor) throw new Error("FORBIDDEN");
  const profile = await db.advertiserProfile.findUnique({ where: { userId: actor.id } });
  if (!profile) {
    return { campaigns: 0, active: 0, spend: 0, impressions: 0, clicks: 0, ctr: 0, balance: 0, unread: 0 };
  }
  const campaigns = await db.campaign.findMany({
    where: { advertiserId: profile.id },
    select: { id: true, status: true, orderId: true },
  });
  const [statList, orders, balance, unread] = await Promise.all([
    Promise.all(campaigns.map((c) => getCampaignStats(c.id))),
    db.order.findMany({
      where: { id: { in: campaigns.map((c) => c.orderId).filter((o): o is string => !!o) }, status: "PAID" },
      select: { total: true },
    }),
    getCreditBalance(),
    db.notification.count({ where: { userId: actor.id, read: false } }),
  ]);
  const impressions = statList.reduce((s, x) => s + x.impressions, 0);
  const clicks = statList.reduce((s, x) => s + x.clicks, 0);
  return {
    campaigns: campaigns.length,
    active: campaigns.filter((c) => c.status === "ACTIVE").length,
    spend: orders.reduce((s, o) => s + o.total, 0),
    impressions,
    clicks,
    ctr: impressions > 0 ? Math.round((clicks / impressions) * 1000) / 10 : 0,
    balance,
    unread,
  };
}

// ── Gap fixes: custom quote (§61) + notifications (§64) ──

export async function notify(userId: string, title: string, body?: string): Promise<void> {
  try {
    await db.notification.create({ data: { userId, title, body: body ?? null } });
  } catch {
    /* ignore */
  }
}

const NOTIFY_ON: Record<string, { title: string; body: string }> = {
  APPROVED: { title: "کمپین تأیید شد", body: "کمپین شما تأیید شد؛ قرارداد را پذیرش کنید." },
  REJECTED: { title: "کمپین رد شد", body: "کمپین شما رد شد. جزئیات را بررسی کنید." },
  FINAL_APPROVED: { title: "قرارداد نهایی شد", body: "قرارداد کمپین شما تأیید نهایی شد." },
  ACTIVE: { title: "تبلیغ فعال شد", body: "کمپین شما اکنون در حال نمایش است." },
  PAUSED: { title: "کمپین متوقف شد", body: "نمایش کمپین شما متوقف شد." },
  COMPLETED: { title: "کمپین تمام شد", body: "کمپین شما به پایان رسید. برای تمدید اقدام کنید." },
  CANCELLED: { title: "کمپین لغو شد", body: "کمپین شما لغو شد." },
};

export async function submitCustomQuote(input: {
  title: string;
  note: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const a = await currentActor();
  if (!a) return { ok: false, error: "FORBIDDEN" };
  const title = input.title.trim();
  const note = input.note.trim();
  if (title.length < 3) return { ok: false, error: "عنوان کوتاه است" };
  if (note.length < 10) return { ok: false, error: "توضیحات را کامل‌تر بنویسید" };

  const profile = await db.advertiserProfile.upsert({
    where: { userId: a.id },
    create: { userId: a.id },
    update: {},
  });
  const c = await db.campaign.create({
    data: { advertiserId: profile.id, title, note, status: "DRAFT", pricingModel: "CUSTOM_QUOTE", budget: 0 },
  });
  await db.auditLog.create({ data: { action: "campaign.create", entity: "Campaign", entityId: c.id, actorId: a.id } });
  const r = await transitionCampaign(c.id, "PENDING_REVIEW");
  return r.ok ? { ok: true, id: c.id } : { ok: false, error: r.error };
}

export async function setCampaignBudget(
  campaignId: string,
  budget: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  if (!Number.isInteger(budget) || budget < 0) return { ok: false, error: "بودجه نامعتبر است" };
  const c = await db.campaign.findUnique({ where: { id: campaignId }, select: { status: true } });
  if (!c) return { ok: false, error: "کمپین یافت نشد" };
  if (!["DRAFT", "PENDING_REVIEW"].includes(c.status)) {
    return { ok: false, error: "فقط در مراحل اولیه می‌توان بودجه را تغییر داد" };
  }
  await db.campaign.update({ where: { id: campaignId }, data: { budget } });
  await db.auditLog.create({ data: { action: "campaign.budget", entity: "Campaign", entityId: campaignId, actorId: admin.id } });
  return { ok: true };
}

export async function listNotifications() {
  const a = await currentActor();
  if (!a) throw new Error("FORBIDDEN");
  return db.notification.findMany({
    where: { userId: a.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function markNotificationRead(id: string): Promise<{ ok: boolean }> {
  const a = await currentActor();
  if (!a) return { ok: false };
  await db.notification.updateMany({ where: { id, userId: a.id }, data: { read: true } });
  return { ok: true };
}

// ── Phase 7: owner targeting & caps (§24-25) ──

const EDITABLE_TARGETING = ["DRAFT", "PENDING_REVIEW"];
const TARGET_TYPES = ["DEVICE", "CATEGORY", "TIME"] as const;

async function editableCampaign(campaignId: string, userId: string) {
  const c = await db.campaign.findFirst({
    where: { id: campaignId, advertiser: { userId } },
    select: { id: true, status: true },
  });
  if (!c) return null;
  if (!EDITABLE_TARGETING.includes(c.status)) return null;
  return c;
}

export async function getCampaignTargeting(campaignId: string) {
  const a = await currentActor();
  if (!a) throw new Error("FORBIDDEN");
  const c = await db.campaign.findFirst({
    where: { id: campaignId, ...(a.role === "ADMIN" ? {} : { advertiser: { userId: a.id } }) },
    include: { targeting: true, caps: true },
  });
  if (!c) throw new Error("FORBIDDEN");
  return { targeting: c.targeting, caps: c.caps };
}

export async function addTargetingRule(
  campaignId: string,
  type: string,
  value: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const a = await currentActor();
  if (!a) return { ok: false, error: "FORBIDDEN" };
  if (!(TARGET_TYPES as readonly string[]).includes(type)) return { ok: false, error: "نوع نامعتبر است" };
  const v = value.trim();
  if (!v) return { ok: false, error: "مقدار لازم است" };
  if (type === "DEVICE" && v !== "mobile" && v !== "desktop") return { ok: false, error: "دستگاه نامعتبر است" };
  if (type === "CATEGORY") {
    const exists = await db.websiteCategory.findUnique({ where: { id: v } });
    if (!exists) return { ok: false, error: "دسته‌بندی یافت نشد" };
  }
  const c = a.role === "ADMIN"
    ? await db.campaign.findUnique({ where: { id: campaignId }, select: { id: true } })
    : await editableCampaign(campaignId, a.id);
  if (!c) return { ok: false, error: "FORBIDDEN" };
  await db.targetingRule.create({ data: { campaignId, type, value: v } });
  return { ok: true };
}

export async function removeTargetingRule(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const a = await currentActor();
  if (!a) return { ok: false, error: "FORBIDDEN" };
  const rule = await db.targetingRule.findUnique({
    where: { id },
    include: { campaign: { select: { status: true, advertiser: { select: { userId: true } } } } },
  });
  if (!rule) return { ok: false, error: "یافت نشد" };
  const isOwner = rule.campaign.advertiser.userId === a.id;
  if (a.role !== "ADMIN" && (!isOwner || !EDITABLE_TARGETING.includes(rule.campaign.status))) {
    return { ok: false, error: "FORBIDDEN" };
  }
  await db.targetingRule.delete({ where: { id } });
  return { ok: true };
}

export async function setFrequencyCap(
  campaignId: string,
  limit: number | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  const a = await currentActor();
  if (!a) return { ok: false, error: "FORBIDDEN" };
  const c = a.role === "ADMIN"
    ? await db.campaign.findUnique({ where: { id: campaignId }, select: { id: true } })
    : await editableCampaign(campaignId, a.id);
  if (!c) return { ok: false, error: "FORBIDDEN" };
  if (limit === null) {
    await db.frequencyCap.deleteMany({ where: { campaignId, scope: "CAMPAIGN" } });
    return { ok: true };
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    return { ok: false, error: "سقف باید بین ۱ تا ۵۰ باشد" };
  }
  const existing = await db.frequencyCap.findFirst({ where: { campaignId, scope: "CAMPAIGN" } });
  if (existing) {
    await db.frequencyCap.update({ where: { id: existing.id }, data: { limit } });
  } else {
    await db.frequencyCap.create({ data: { campaignId, scope: "CAMPAIGN", limit, period: "DAY" } });
  }
  return { ok: true };
}

// ── Phase 3: Sponsored Marketplace + Search + Wizard (§7-8, §10, §31) ──

import { matchKeyword, matchesTargeting, pacingScore, scoreCampaign, type DeviceKind } from "@/lib/ads/targeting";
import { quote } from "@/lib/ads/pricing";
import { getActivePricingRules, getActivePricingFactors } from "@/lib/data/ads";

export interface ViewerCtx {
  ip?: string | null;
  device?: DeviceKind;
  categoryId?: string | null;
}

const defaultFrequencyCap = cache(async (): Promise<number> => {
  return (await db.pricingRule.findUnique({ where: { key: "default_frequency_cap" } }))?.value ?? 3;
});

function startOfDay(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// spent کمپین از روی سفارش پرداخت‌شده (برای pacing)
const spentMapCached = cache(async (key: string): Promise<Record<string, number>> => {
  const campaignIds = key ? key.split("\u0001") : [];
  if (campaignIds.length === 0) return {};
  const campaigns = await db.campaign.findMany({
    where: { id: { in: campaignIds } },
    select: { id: true, orderId: true },
  });
  const orderIds = campaigns.map((c) => c.orderId).filter((o): o is string => !!o);
  const orders = orderIds.length
    ? await db.order.findMany({ where: { id: { in: orderIds }, status: "PAID" }, select: { id: true, total: true } })
    : [];
  const paid = new Map(orders.map((o) => [o.id, o.total]));
  const map: Record<string, number> = {};
  for (const c of campaigns) map[c.id] = c.orderId ? (paid.get(c.orderId) ?? 0) : 0;
  return map;
});

async function spentMap(campaignIds: string[]): Promise<Record<string, number>> {
  if (campaignIds.length === 0) return {};
  const key = [...campaignIds].sort().join("\u0001");
  return spentMapCached(key);
}

// فیلتر تارگتینگ + فرکانسی + امتیازدهی (§22-25) — خروجی مرتب‌شده
async function rankCandidates<
  T extends {
    campaignId: string;
    campaign: {
      priority: number;
      startsAt: Date | null;
      endsAt: Date | null;
      budget: number;
      targeting: { type: string; value: string }[];
      caps: { limit: number }[];
    };
    bid?: number | null;
  },
>(items: T[], ctx: ViewerCtx, limit: number): Promise<T[]> {
  const cap = await defaultFrequencyCap();
  const spent = await spentMap(items.map((i) => i.campaignId));
  const maxBid = Math.max(0, ...items.map((i) => i.bid ?? 0));
  const day = startOfDay();
  const scored: { item: T; score: number }[] = [];

  for (const i of items) {
    if (
      !matchesTargeting(i.campaign.targeting, {
        device: ctx.device ?? "desktop",
        categoryId: ctx.categoryId ?? null,
      })
    ) {
      continue;
    }
    if (ctx.ip) {
      const limitFor = i.campaign.caps[0]?.limit ?? cap;
      const shown = await db.impressionEvent.count({
        where: { campaignId: i.campaignId, ip: ctx.ip, createdAt: { gte: day } },
      });
      if (shown >= limitFor) continue; // frequency cap (§24)
    }
    const pacing = pacingScore({
      startsAt: i.campaign.startsAt,
      endsAt: i.campaign.endsAt,
      budget: i.campaign.budget,
      spent: spent[i.campaignId] ?? 0,
    });
    scored.push({
      item: i,
      score: scoreCampaign({ priority: i.campaign.priority, bid: i.bid ?? null, maxBid, pacing }),
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, Math.max(0, limit)).map((s) => s.item);
}

const WEBSITE_KINDS = ["SPONSORED_WEBSITE", "FEATURED_WEBSITE", "BOOST"] as const;
const PRODUCT_KINDS = ["SPONSORED_PRODUCT", "FEATURED_PRODUCT"] as const;

function liveCampaignWhere() {
  const now = new Date();
  return {
    status: "ACTIVE" as const,
    AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
  };
}

const CAMPAIGN_DELIVERY_SELECT = {
  priority: true,
  startsAt: true,
  endsAt: true,
  budget: true,
  targeting: true,
  caps: true,
} as const;

export async function getSponsoredWebsites(opts: { categoryId?: string; limit?: number; viewer?: ViewerCtx }) {
  const items = await db.campaignItem.findMany({
    where: {
      kind: { in: [...WEBSITE_KINDS] },
      websiteId: { not: null },
      website: { status: "PUBLISHED", ...(opts.categoryId ? { categoryId: opts.categoryId } : {}) },
      campaign: liveCampaignWhere(),
    },
    include: {
      website: { include: { category: true, packages: { orderBy: { price: "asc" } } } },
      campaign: { select: CAMPAIGN_DELIVERY_SELECT },
    },
  });
  const ranked = await rankCandidates(items, opts.viewer ?? {}, opts.limit ?? 2);
  const seen = new Set<string>();
  return ranked
    .filter((i) => (i.websiteId && !seen.has(i.websiteId) ? (seen.add(i.websiteId), true) : false))
    .map((i) => ({ website: i.website!, itemId: i.id, campaignId: i.campaignId, placementId: i.placementId }));
}

export async function getSponsoredProducts(opts: { categoryId?: string; limit?: number; viewer?: ViewerCtx }) {
  const items = await db.campaignItem.findMany({
    where: {
      kind: { in: [...PRODUCT_KINDS] },
      productId: { not: null },
      product: { status: "PUBLISHED", ...(opts.categoryId ? { categoryId: opts.categoryId } : {}) },
      campaign: liveCampaignWhere(),
    },
    include: {
      product: { include: { category: true } },
      campaign: { select: CAMPAIGN_DELIVERY_SELECT },
    },
  });
  const ranked = await rankCandidates(items, opts.viewer ?? {}, opts.limit ?? 2);
  const seen = new Set<string>();
  return ranked
    .filter((i) => (i.productId && !seen.has(i.productId) ? (seen.add(i.productId), true) : false))
    .map((i) => ({ product: i.product!, itemId: i.id, campaignId: i.campaignId, placementId: i.placementId }));
}

export async function getSponsoredSearch(
  q: string,
  type: "website" | "product",
  limit = 2,
  viewer: ViewerCtx = {}
) {
  const query = q.trim();
  if (!query) return [];
  const items = await db.campaignItem.findMany({
    where: {
      kind: "SPONSORED_SEARCH",
      keyword: { not: null },
      ...(type === "website"
        ? { websiteId: { not: null }, website: { status: "PUBLISHED" } }
        : { productId: { not: null }, product: { status: "PUBLISHED" } }),
      campaign: liveCampaignWhere(),
    },
    include: {
      website: { include: { category: true, packages: { orderBy: { price: "asc" } } } },
      product: { include: { category: true } },
      campaign: { select: CAMPAIGN_DELIVERY_SELECT },
    },
  });
  const matched = items.filter((i) => matchKeyword(query, i.keyword ?? ""));
  return rankCandidates(matched, viewer, limit);
}

function viewerKey(v: ViewerCtx): string {
  return `${v.device ?? ""}\u0001${v.categoryId ?? ""}\u0001${v.ip ?? ""}`;
}

const getDisplaySlotCached = cache(async (placementKey: string, vk: string) => {
  const [device, categoryId, ip] = vk.split("\u0001");
  const viewer: ViewerCtx = {
    ...(device ? { device: device as DeviceKind } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(ip ? { ip } : {}),
  };
  const items = await db.campaignItem.findMany({
    where: {
      kind: "DISPLAY",
      placementId: placementKey,
      campaign: {
        ...liveCampaignWhere(),
        creatives: { some: { status: "APPROVED" } },
      },
    },
    include: {
      campaign: {
        select: {
          ...CAMPAIGN_DELIVERY_SELECT,
          creatives: { where: { status: "APPROVED" }, orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
  });
  const ranked = await rankCandidates(items, viewer, 1);
  const top = ranked[0];
  const creative = top?.campaign.creatives[0];
  if (!top || !creative) return null;
  return { itemId: top.id, campaignId: top.campaignId, placementId: top.placementId, creative };
});

export async function getDisplaySlot(placementKey: string, viewer: ViewerCtx = {}) {
  return getDisplaySlotCached(placementKey, viewerKey(viewer));
}

export async function getCategorySponsorship(categoryId: string, viewer: ViewerCtx = {}) {
  const items = await db.campaignItem.findMany({
    where: {
      kind: "CATEGORY_SPONSOR",
      categoryId,
      campaign: liveCampaignWhere(),
    },
    include: {
      website: { select: { name: true, slug: true } },
      campaign: { select: { title: true, ...CAMPAIGN_DELIVERY_SELECT } },
    },
    orderBy: { campaign: { priority: "desc" } },
  });
  const ranked = await rankCandidates(items, { ...viewer, categoryId }, 1);
  return ranked[0] ?? null;
}

export async function getWizardData() {
  const [placements, websites, products, categories, rules, factors] = await Promise.all([
    db.adPlacement.findMany({ where: { active: true }, orderBy: { key: "asc" } }),
    db.website.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    db.product.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    db.websiteCategory.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } }),
    db.pricingRule.findMany({ where: { active: true } }),
    db.pricingFactor.findMany({ where: { active: true } }),
  ]);
  return { placements, websites, products, categories, rules, factors };
}

const WIZARD_KINDS = [
  "SPONSORED_WEBSITE",
  "FEATURED_WEBSITE",
  "SPONSORED_PRODUCT",
  "SPONSORED_SEARCH",
  "CATEGORY_SPONSOR",
  "DISPLAY",
] as const;

const KIND_PLACEMENT: Record<string, string> = {
  SPONSORED_PRODUCT: "store.native",
  CATEGORY_SPONSOR: "category.top",
};

export async function submitSponsoredCampaign(input: {
  title: string;
  kind: string;
  websiteId?: string;
  productId?: string;
  categoryId?: string;
  keyword?: string;
  bid?: number;
  budget: number;
  startsAt?: string;
  endsAt?: string;
  placementId?: string;
  creative?: { fileUrl?: string; linkUrl?: string; width?: number; height?: number };
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const actor = await currentActor();
  if (!actor) return { ok: false, error: "FORBIDDEN" };
  const { campaignSubmitSchema, firstError } = await import("@/lib/validations/ads");
  const parsed = campaignSubmitSchema.safeParse({
    title: input.title,
    kind: input.kind,
    websiteId: input.websiteId,
    productId: input.productId,
    categoryId: input.categoryId,
    keyword: input.keyword,
    bid: input.bid,
    budget: input.budget,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    placementId: input.placementId,
  });
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  if (!(WIZARD_KINDS as readonly string[]).includes(parsed.data.kind)) {
    return { ok: false, error: "نوع تبلیغ نامعتبر است" };
  }
  const title = parsed.data.title;
  if (input.kind === "SPONSORED_SEARCH" && !input.keyword?.trim()) {
    return { ok: false, error: "کلیدواژه لازم است" };
  }
  if ((input.kind === "SPONSORED_WEBSITE" || input.kind === "FEATURED_WEBSITE") && !input.websiteId) {
    return { ok: false, error: "سایت لازم است" };
  }
  if (input.kind === "SPONSORED_PRODUCT" && !input.productId) {
    return { ok: false, error: "محصول لازم است" };
  }
  if (input.kind === "CATEGORY_SPONSOR" && !input.categoryId) {
    return { ok: false, error: "دسته‌بندی لازم است" };
  }
  let placementId = input.placementId?.trim() || KIND_PLACEMENT[input.kind] || "marketplace.native";
  if (input.kind === "DISPLAY") {
    if (!input.placementId) return { ok: false, error: "جایگاه نمایش لازم است" };
    const p = await db.adPlacement.findFirst({ where: { key: placementId, active: true } });
    if (!p) return { ok: false, error: "جایگاه نامعتبر است" };
    if (!input.creative?.fileUrl) return { ok: false, error: "فایل بنر لازم است" };
    placementId = p.key;
  }

  const profile = await db.advertiserProfile.upsert({
    where: { userId: actor.id },
    create: { userId: actor.id },
    update: {},
  });

  const campaign = await db.campaign.create({
    data: {
      advertiserId: profile.id,
      title,
      status: "DRAFT",
      pricingModel: input.kind === "SPONSORED_SEARCH" ? "CPC" : "FIXED_IMPRESSIONS",
      budget: input.budget,
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      items: {
        create: {
          placementId,
          kind: input.kind,
          websiteId: input.websiteId,
          productId: input.productId,
          categoryId: input.categoryId,
          keyword: input.keyword?.trim(),
          bid: input.bid,
        },
      },
      ...(input.kind === "DISPLAY" && input.creative
        ? {
            creatives: {
              create: {
                kind: "IMAGE",
                status: "PENDING",
                fileUrl: input.creative.fileUrl,
                linkUrl: input.creative.linkUrl,
                width: input.creative.width,
                height: input.creative.height,
              },
            },
          }
        : {}),
    },
  });

  await db.auditLog.create({
    data: { action: "campaign.create", entity: "Campaign", entityId: campaign.id, actorId: actor.id },
  });
  return transitionCampaign(campaign.id, "PENDING_REVIEW").then((r) =>
    r.ok ? { ok: true as const, id: campaign.id } : { ok: false as const, error: r.error }
  );
}

// برآورد قیمت واحد برای پیش‌نمایش ویزارد (§20)
export async function getWizardQuote(opts: {
  model: "CPM" | "CPC";
  placementKey: string;
  device?: "desktop" | "mobile" | "tablet";
}): Promise<{ ok: true; unit: number; base: number } | { ok: false; error: string }> {
  const [rules, factors] = await Promise.all([getActivePricingRules(), getActivePricingFactors()]);
  const base = rules.find((r) => r.key === (opts.model === "CPM" ? "base_cpm" : "base_cpc"))?.value;
  if (!base) return { ok: false, error: "قانون قیمت یافت نشد" };
  const map: Record<string, number> = {};
  for (const f of factors) map[f.key] = f.factor;
  return { ok: true, unit: quote({ model: opts.model, base, placementKey: opts.placementKey, factors: map, device: opts.device }), base };
}
