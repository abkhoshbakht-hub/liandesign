"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/data/coupons";
import { logEvent } from "@/lib/analytics";
import { manualProvider } from "@/services/payment/manual";
import { creditBonus } from "@/lib/ads/credits";
import { logPaymentAttempt } from "@/lib/data/refunds";

// ── Phase 6: Packages + Services + Credits (§12, §14, §27) ──

function makeNumber(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

async function buyerId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

async function createPaidOrderLike(userId: string, label: string, amount: number) {
  const order = await db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        number: makeNumber("ADS"),
        userId,
        status: "PENDING",
        total: amount,
        items: { create: [{ websiteId: null, productId: null, packageName: label, price: amount }] },
      },
    });
    await tx.invoice.create({ data: { orderId: created.id, number: makeNumber("INV"), total: amount } });
    return created;
  });
  await manualProvider.createPayment({ orderId: order.id, amount });
  await logPaymentAttempt(order.id, "PENDING", { amount });
  return order;
}

// ── Packages ──

export async function listPackagesPublic() {
  return db.campaignPackage.findMany({ where: { active: true }, orderBy: { price: "asc" } });
}

export async function buyPackage(slug: string): Promise<void> {
  const userId = await buyerId();
  if (!userId) redirect("/login?callbackUrl=/advertise");
  const pkg = await db.campaignPackage.findFirst({ where: { slug, active: true } });
  if (!pkg) redirect("/advertise");

  const profile = await db.advertiserProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
  const items = (pkg.items as { placement: string; kind: string }[]).filter(
    (i) => typeof i?.placement === "string" && typeof i?.kind === "string"
  );
  const campaign = await db.campaign.create({
    data: {
      advertiserId: profile.id,
      title: `پکیج ${pkg.name}`,
      status: "DRAFT",
      pricingModel: "PACKAGE",
      budget: pkg.price,
      items: {
        create: items.map((i) => ({ placementId: i.placement, kind: i.kind })),
      },
    },
  });
  await db.auditLog.create({ data: { action: "package.purchase", entity: "Campaign", entityId: campaign.id, actorId: userId } });
  await logEvent("package_purchase", { package: slug, campaignId: campaign.id }, userId);
  redirect(`/advertise/campaigns/${campaign.id}`);
}

// ── Services ──

export async function listServicesPublic() {
  return db.advertisingService.findMany({ where: { active: true }, orderBy: { price: "asc" } });
}

export async function buyService(slug: string): Promise<void> {
  const userId = await buyerId();
  if (!userId) redirect("/login?callbackUrl=/advertise");
  const service = await db.advertisingService.findFirst({ where: { slug, active: true } });
  if (!service) redirect("/advertise");
  const order = await createPaidOrderLike(userId, `خدمت تبلیغاتی: ${service.name}`, service.price);
  await logEvent("service_upsell_purchase", { service: slug, orderId: order.id }, userId);
  if (slug === "landing-page") {
    await logEvent("landing_page_upsell", { service: slug, orderId: order.id }, userId);
  }
  redirect("/dashboard/orders");
}

// ── Credits ──

const CREDIT_MIN = 1000000; // تومان

export async function getCreditOffer() {
  const [threshold, percent] = await Promise.all([
    db.pricingRule.findUnique({ where: { key: "credit_bonus_threshold" } }),
    db.pricingRule.findUnique({ where: { key: "credit_bonus_percent" } }),
  ]);
  return {
    min: CREDIT_MIN,
    threshold: threshold?.value ?? 30000000,
    percent: percent?.value ?? 10,
  };
}

export async function buyCredit(
  amount: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await buyerId();
  if (!userId) return { ok: false, error: "LOGIN_REQUIRED" };
  if (!Number.isInteger(amount) || amount < CREDIT_MIN) {
    return { ok: false, error: `حداقل مبلغ ${CREDIT_MIN.toLocaleString("fa-IR")} تومان است` };
  }
  const offer = await getCreditOffer();
  const { total } = creditBonus(amount, offer.threshold, offer.percent);

  const profile = await db.advertiserProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
  const order = await createPaidOrderLike(userId, "شارژ اعتبار تبلیغات", amount);
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  await db.advertisingCredit.create({
    data: { advertiserId: profile.id, amount: total, expiresAt },
  });
  await logEvent("credit_purchase", { amount, total, orderId: order.id }, userId);
  return { ok: true };
}

export async function getCreditBalance(): Promise<number> {
  const userId = await buyerId();
  if (!userId) return 0;
  const profile = await db.advertiserProfile.findUnique({ where: { userId } });
  if (!profile) return 0;
  const credits = await db.advertisingCredit.findMany({
    where: { advertiserId: profile.id, OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
  });
  return credits.reduce((s, c) => s + (c.amount - c.used), 0);
}

// ── Credit consumption (Phase 7) — FIFO از قدیمی‌ترین کردیت سالم ──

export async function useCredit(
  userId: string,
  amount: number
): Promise<{ ok: true; used: number } | { ok: false; error: string }> {
  if (!Number.isInteger(amount) || amount <= 0) return { ok: false, error: "مبلغ نامعتبر است" };
  const profile = await db.advertiserProfile.findUnique({ where: { userId } });
  if (!profile) return { ok: false, error: "پروفایل تبلیغ‌دهنده نیست" };

  try {
    let remaining = amount;
    await db.$transaction(async (tx) => {
      const credits = await tx.advertisingCredit.findMany({
        where: {
          advertiserId: profile.id,
          OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
        },
        orderBy: { createdAt: "asc" },
      });
      const available = credits.reduce((s, c) => s + (c.amount - c.used), 0);
      if (available < amount) throw new Error(`موجودی کافی نیست (${available.toLocaleString("fa-IR")})`);
      for (const c of credits) {
        if (remaining <= 0) break;
        const free = c.amount - c.used;
        if (free <= 0) continue;
        const take = Math.min(free, remaining);
        await tx.advertisingCredit.update({ where: { id: c.id }, data: { used: { increment: take } } });
        remaining -= take;
      }
      await tx.auditLog.create({
        data: { action: "credit.use", entity: "AdvertiserProfile", entityId: profile.id, actorId: userId },
      });
    });
    return { ok: true, used: amount };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "خطا در مصرف کردیت" };
  }
}

// پرداخت کامل سفارش کمپین با کردیت (مالک) — سپس تأیید ادمین طبق فلوی موجود
export async function payOrderWithCredit(
  orderId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await buyerId();
  if (!userId) return { ok: false, error: "LOGIN_REQUIRED" };
  const order = await db.order.findFirst({
    where: { id: orderId, userId, status: "PENDING", number: { startsWith: "ADS-" } },
    include: { payment: true },
  });
  if (!order) return { ok: false, error: "سفارش معتبر نیست" };

  const used = await useCredit(userId, order.total);
  if (!used.ok) return used;
  await db.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: "PAID" } });
    if (order.payment) {
      await tx.payment.update({ where: { id: order.payment.id }, data: { status: "PAID" } });
    }
  });
  await db.auditLog.create({ data: { action: "order.pay_credit", entity: "Order", entityId: orderId, actorId: userId } });
  return { ok: true };
}

// ── Admin ──

export async function listPackagesAdmin() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  return db.campaignPackage.findMany({ orderBy: { price: "asc" } });
}

export async function createPackage(data: {
  name: string;
  slug: string;
  description?: string;
  price: number;
  itemsJson: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  let items: unknown;
  try {
    items = JSON.parse(data.itemsJson);
  } catch {
    return { ok: false, error: "JSON آیتم‌ها نامعتبر است" };
  }
  if (!Array.isArray(items)) return { ok: false, error: "آیتم‌ها باید آرایه باشند" };
  try {
    await db.campaignPackage.create({
      data: { name: data.name, slug: data.slug, description: data.description, price: data.price, items },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "slug تکراری است" };
  }
}

export async function togglePackage(id: string): Promise<{ ok: boolean }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false };
  const p = await db.campaignPackage.findUnique({ where: { id } });
  if (!p) return { ok: false };
  await db.campaignPackage.update({ where: { id }, data: { active: !p.active } });
  return { ok: true };
}

export async function listServicesAdmin() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  return db.advertisingService.findMany({ orderBy: { price: "asc" } });
}

export async function createService(data: {
  name: string;
  slug: string;
  description?: string;
  price: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  try {
    await db.advertisingService.create({ data });
    return { ok: true };
  } catch {
    return { ok: false, error: "slug تکراری است" };
  }
}

export async function toggleService(id: string): Promise<{ ok: boolean }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false };
  const s = await db.advertisingService.findUnique({ where: { id } });
  if (!s) return { ok: false };
  await db.advertisingService.update({ where: { id }, data: { active: !s.active } });
  return { ok: true };
}

export async function listCreditsAdmin() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  return db.advertisingCredit.findMany({
    include: { advertiser: { select: { company: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function grantCredit(data: {
  userId: string;
  amount: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  if (!Number.isInteger(data.amount) || data.amount <= 0) return { ok: false, error: "مبلغ نامعتبر است" };
  const profile = await db.advertiserProfile.upsert({
    where: { userId: data.userId },
    create: { userId: data.userId },
    update: {},
  });
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  await db.advertisingCredit.create({ data: { advertiserId: profile.id, amount: data.amount, expiresAt } });
  await db.auditLog.create({ data: { action: "credit.grant", entity: "AdvertisingCredit", entityId: profile.id, actorId: admin.id } });
  return { ok: true };
}
