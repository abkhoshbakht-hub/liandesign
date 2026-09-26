"use server";

import { createHash } from "node:crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/data/coupons";
import { transitionCampaign } from "@/lib/data/ads-engine";
import { validateCreative } from "@/lib/ads/creative";
import { manualProvider } from "@/services/payment/manual";
import { logEvent } from "@/lib/analytics";
import { logPaymentAttempt } from "@/lib/data/refunds";

// ── Phase 4: Two-layer contract (§37-39) + payment link (§40) + creative review (§54-55) ──

async function actor() {
  const { getTestActor } = await import("@/lib/test-actor");
  const test = getTestActor();
  if (test) return test;
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  return user?.id ? { id: user.id, role: user.role ?? "CUSTOMER" } : null;
}

async function ownedCampaign(campaignId: string, userId: string) {
  return db.campaign.findFirst({
    where: { id: campaignId, advertiser: { userId } },
    include: {
      items: true,
      advertiser: true,
      creatives: true,
    },
  });
}

export function stableStringify(obj: unknown): string {
  if (obj === null || obj === undefined) return JSON.stringify(obj);
  if (typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(",")}]`;
  const sorted = Object.keys(obj as Record<string, unknown>)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stableStringify((obj as Record<string, unknown>)[k])}`)
    .join(",");
  return `{${sorted}}`;
}

function snapshotHash(payload: unknown): string {
  return createHash("sha256").update(stableStringify(payload)).digest("hex");
}

async function buildPayload(campaignId: string) {
  const c = await db.campaign.findUnique({
    where: { id: campaignId },
    include: {
      items: true,
      advertiser: { select: { company: true, phone: true } },
      creatives: { select: { id: true, kind: true, linkUrl: true, width: true, height: true, status: true } },
    },
  });
  if (!c) throw new Error("کمپین یافت نشد");
  const policy = await db.policyVersion.findFirst({ where: { active: true }, orderBy: { createdAt: "desc" } });
  return {
    contract: "advertising",
    campaign: {
      id: c.id,
      title: c.title,
      status: c.status,
      pricingModel: c.pricingModel,
      budget: c.budget,
      startsAt: c.startsAt,
      endsAt: c.endsAt,
    },
    items: c.items.map((i) => ({
      kind: i.kind,
      placementId: i.placementId,
      websiteId: i.websiteId,
      productId: i.productId,
      categoryId: i.categoryId,
      keyword: i.keyword,
      bid: i.bid,
      price: i.price,
    })),
    advertiser: c.advertiser,
    creatives: c.creatives,
    policy: policy ? { version: policy.version, title: policy.title } : null,
    issuedAt: new Date().toISOString(),
  };
}

async function ensureContractTx(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  campaignId: string,
  policyId: string | null
) {
  let contract = await tx.advertisingContract.findFirst({
    where: { campaignId },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });
  if (!contract) {
    contract = await tx.advertisingContract.create({
      data: { campaignId, policyId, versions: { create: { version: 1 } } },
      include: { versions: true },
    });
  }
  const version = contract.versions[0] ?? (await tx.contractVersion.create({ data: { contractId: contract.id, version: 1 } }));
  return { contract, version };
}

// ── Layer 1: pre-acceptance (owner) ──

export async function preAcceptContract(
  campaignId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const a = await actor();
  if (!a) return { ok: false, error: "FORBIDDEN" };
  const c = await ownedCampaign(campaignId, a.id);
  if (!c) return { ok: false, error: "FORBIDDEN" };
  if (c.status !== "APPROVED") {
    const already = await db.contractAcceptance.findFirst({
      where: { kind: "PRE", version: { contract: { campaignId } } },
    });
    if (already) return { ok: true }; // idempotent (§72)
    return { ok: false, error: "کمپین در وضعیت پذیرش نیست" };
  }

  // Risk-based verification (§44): بودجه بالا → هویت لازم
  const threshold = (await db.pricingRule.findUnique({ where: { key: "verification_threshold" } }))?.value ?? 10000000;
  if (c.budget >= threshold && (!c.advertiser.company || !c.advertiser.phone)) {
    return { ok: false, error: "برای این مبلغ، نام شرکت و تلفن لازم است" };
  }
  await logEvent("pre_acceptance_started", { campaignId }, a.id);

  try {
    await db.$transaction(async (tx) => {
      const { contract, version } = await ensureContractTx(tx, campaignId, null);
      const payload = await buildPayload(campaignId);
      await tx.contractSnapshot.create({
        data: { versionId: version.id, payload: JSON.parse(stableStringify(payload)), hash: snapshotHash(payload), final: false },
      });
      await tx.contractAcceptance.create({ data: { versionId: version.id, userId: a.id, kind: "PRE", method: "ELECTRONIC" } });
      await tx.advertisingContract.update({ where: { id: contract.id }, data: { preAcceptedAt: new Date() } });
      await tx.auditLog.create({ data: { action: "contract.pre_accept", entity: "Campaign", entityId: campaignId, actorId: a.id } });
    });
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "خطا در پذیرش" };
  }

  const s1 = await transitionCampaign(campaignId, "PRE_ACCEPTED");
  if (!s1.ok) return s1;
  const s2 = await transitionCampaign(campaignId, "PAYMENT_PENDING");
  if (s2.ok) await logEvent("pre_acceptance_completed", { campaignId }, a.id);
  return s2;
}

// ── Payment link (§40): campaign → Order (reuse existing infra, no rebuild) ──

function makeNumber(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

export async function createCampaignOrder(
  campaignId: string
): Promise<{ ok: true; number: string } | { ok: false; error: string }> {
  const a = await actor();
  if (!a) return { ok: false, error: "FORBIDDEN" };
  const c = await ownedCampaign(campaignId, a.id);
  if (!c) return { ok: false, error: "FORBIDDEN" };
  if (c.status !== "PAYMENT_PENDING") return { ok: false, error: "کمپین در وضعیت پرداخت نیست" };
  if (c.orderId) {
    const existing = await db.order.findUnique({ where: { id: c.orderId } });
    if (existing) return { ok: true, number: existing.number };
  }

  const order = await db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        number: makeNumber("ADS"),
        userId: a.id,
        status: "PENDING",
        total: c.budget,
        items: {
          create: [{ websiteId: null, productId: null, packageName: `کمپین تبلیغاتی: ${c.title}`, price: c.budget }],
        },
      },
    });
    await tx.invoice.create({ data: { orderId: created.id, number: makeNumber("INV"), total: c.budget } });
    await tx.campaign.update({ where: { id: campaignId }, data: { orderId: created.id } });
    await tx.auditLog.create({ data: { action: "campaign.order", entity: "Campaign", entityId: campaignId, actorId: a.id } });
    return created;
  });

  await manualProvider.createPayment({ orderId: order.id, amount: c.budget });
  await logPaymentAttempt(order.id, "PENDING", { amount: c.budget, campaignId });
  await logEvent("checkout_started", { campaignId, orderId: order.id }, a.id);
  return { ok: true, number: order.number };
}

// Admin confirms an already-PAID order (existing orders UI sets PAID), then advances the campaign.
export async function confirmPaymentReceived(
  campaignId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  const c = await db.campaign.findUnique({ where: { id: campaignId } });
  if (!c) return { ok: false, error: "کمپین یافت نشد" };
  if (c.status !== "PAYMENT_PENDING") return { ok: false, error: "کمپین در وضعیت پرداخت نیست" };
  if (!c.orderId) return { ok: false, error: "سفارشی ثبت نشده است" };
  const order = await db.order.findUnique({ where: { id: c.orderId } });
  if (!order || order.status !== "PAID") return { ok: false, error: "پرداخت سفارش تأیید نشده است" };

  const s1 = await transitionCampaign(campaignId, "PAYMENT_RECEIVED");
  if (!s1.ok) return s1;
  const s2 = await transitionCampaign(campaignId, "FINAL_APPROVAL_PENDING");
  if (s2.ok) await logEvent("payment_completed", { campaignId }, admin.id);
  return s2;
}

// ── Layer 2: final approval (admin, configurable method) ──

export async function finalApproveCampaign(
  campaignId: string,
  method = "ADMIN_REVIEW"
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  const c = await db.campaign.findUnique({ where: { id: campaignId } });
  if (!c) return { ok: false, error: "کمپین یافت نشد" };
  if (c.status !== "FINAL_APPROVAL_PENDING") {
    const already = await db.contractAcceptance.findFirst({
      where: { kind: "FINAL", version: { contract: { campaignId } } },
    });
    if (already) return { ok: true }; // idempotent (§72)
    return { ok: false, error: "کمپین در انتظار تأیید نهایی نیست" };
  }
  await logEvent("final_approval_started", { campaignId }, admin.id);

  try {
    await db.$transaction(async (tx) => {
      const { contract, version } = await ensureContractTx(tx, campaignId, null);
      const payload = await buildPayload(campaignId);
      await tx.contractSnapshot.create({
        data: { versionId: version.id, payload: JSON.parse(stableStringify(payload)), hash: snapshotHash(payload), final: true },
      });
      await tx.contractAcceptance.create({ data: { versionId: version.id, userId: admin.id, kind: "FINAL", method } });
      await tx.advertisingContract.update({
        where: { id: contract.id },
        data: { finalApprovedAt: new Date(), approvalMethod: method },
      });
      await tx.auditLog.create({ data: { action: "contract.final_approve", entity: "Campaign", entityId: campaignId, actorId: admin.id } });
    });
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "خطا در تأیید نهایی" };
  }

  const s1 = await transitionCampaign(campaignId, "FINAL_APPROVED");
  if (!s1.ok) return s1;
  const s2 = await transitionCampaign(campaignId, "EFFECTIVE");
  if (s2.ok) await logEvent("final_approval_completed", { campaignId }, admin.id);
  return s2;
}

// ── Creative review (§54-55) ──

export async function listCreativesAdmin(status?: string) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  return db.creative.findMany({
    where: status ? { status } : {},
    include: { campaign: { select: { id: true, title: true, status: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function reviewCreative(
  id: string,
  status: "APPROVED" | "REJECTED"
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  const creative = await db.creative.findUnique({ where: { id } });
  if (!creative) return { ok: false, error: "کریتیو یافت نشد" };
  const errors = validateCreative({
    kind: creative.kind,
    fileUrl: creative.fileUrl,
    html: creative.html,
    linkUrl: creative.linkUrl,
    width: creative.width,
    height: creative.height,
  });
  if (status === "APPROVED" && errors.length > 0) {
    return { ok: false, error: errors[0] };
  }
  await db.$transaction(async (tx) => {
    await tx.creative.update({ where: { id }, data: { status } });
    await tx.creativeVersion.create({ data: { creativeId: id, fileUrl: creative.fileUrl, version: Date.now() } });
    await tx.auditLog.create({ data: { action: `creative.${status.toLowerCase()}`, entity: "Creative", entityId: id, actorId: admin.id } });
  });
  const owner = await db.creative.findUnique({
    where: { id },
    select: { campaign: { select: { title: true, advertiser: { select: { userId: true } } } } },
  });
  if (owner) {
    const { notify } = await import("@/lib/data/ads-engine");
    await notify(
      owner.campaign.advertiser.userId,
      status === "APPROVED" ? "کریتیو تأیید شد" : "کریتیو رد شد",
      `کمپین «${owner.campaign.title}»`
    );
  }
  return { ok: true };
}

// ── Advertiser profile (risk-based verification §44) ──

export async function updateAdvertiserProfile(data: {
  company?: string;
  phone?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const a = await actor();
  if (!a) return { ok: false, error: "FORBIDDEN" };
  await db.advertiserProfile.upsert({
    where: { userId: a.id },
    create: { userId: a.id, company: data.company?.trim() || null, phone: data.phone?.trim() || null },
    update: {
      ...(data.company !== undefined && { company: data.company.trim() || null }),
      ...(data.phone !== undefined && { phone: data.phone.trim() || null }),
    },
  });
  return { ok: true };
}

// ── Campaign detail (owner or admin) ──

export async function getCampaignDetail(campaignId: string) {
  const a = await actor();
  if (!a) throw new Error("FORBIDDEN");
  const c = await db.campaign.findUnique({
    where: { id: campaignId },
    include: {
      items: true,
      creatives: true,
      advertiser: { select: { userId: true, company: true, phone: true } },
      contracts: {
        include: { versions: { include: { snapshots: { orderBy: { createdAt: "desc" } }, acceptances: true }, orderBy: { version: "desc" } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!c) return null;
  if (a.role !== "ADMIN" && c.advertiser.userId !== a.id) throw new Error("FORBIDDEN");
  const order = c.orderId
    ? await db.order.findUnique({ where: { id: c.orderId }, include: { payment: true, invoice: true } })
    : null;
  return { ...c, order };
}
