"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/data/coupons";

// ── Phase 1: foundation data layer (placements, inventory, pricing) ──

export async function requireAdvertiser() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) return null;
  return db.advertiserProfile.findUnique({ where: { userId: user.id } });
}

export async function getOrCreateAdvertiser(userId: string) {
  const existing = await db.advertiserProfile.findUnique({ where: { userId } });
  if (existing) return existing;
  return db.advertiserProfile.create({ data: { userId } });
}

// ── Placements (admin) ──

export async function listPlacements() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  return db.adPlacement.findMany({
    include: { _count: { select: { inventories: true } } },
    orderBy: { key: "asc" },
  });
}

export async function createPlacement(data: {
  key: string;
  name: string;
  description?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  try {
    const p = await db.adPlacement.create({ data });
    return { ok: true, id: p.id };
  } catch {
    return { ok: false, error: "این کلید قبلاً ثبت شده است" };
  }
}

export async function togglePlacement(id: string): Promise<{ ok: boolean }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false };
  const p = await db.adPlacement.findUnique({ where: { id } });
  if (!p) return { ok: false };
  await db.adPlacement.update({ where: { id }, data: { active: !p.active } });
  return { ok: true };
}

export async function listActivePlacements() {
  return db.adPlacement.findMany({
    where: { active: true },
    select: { id: true, key: true, name: true, description: true },
    orderBy: { key: "asc" },
  });
}

// ── Policies (admin, §56) ──

export async function listPoliciesAdmin() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  return db.policyVersion.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createPolicy(data: {
  version: string;
  title: string;
  body: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  if (!data.version.trim() || !data.title.trim() || !data.body.trim()) {
    return { ok: false, error: "همه فیلدها لازم است" };
  }
  try {
    await db.policyVersion.create({ data });
    return { ok: true };
  } catch {
    return { ok: false, error: "این نسخه قبلاً ثبت شده است" };
  }
}

export async function togglePolicy(id: string): Promise<{ ok: boolean }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false };
  const p = await db.policyVersion.findUnique({ where: { id } });
  if (!p) return { ok: false };
  await db.policyVersion.update({ where: { id }, data: { active: !p.active } });
  return { ok: true };
}

// ── Inventory (admin) ──

export async function listInventory(placementId?: string) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  return db.adInventory.findMany({
    where: placementId ? { placementId } : {},
    include: { placement: { select: { key: true, name: true } } },
    orderBy: [{ period: "desc" }, { placementId: "asc" }],
    take: 200,
  });
}

export async function setInventoryCapacity(data: {
  placementId: string;
  period: string;
  capacity: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  if (!Number.isInteger(data.capacity) || data.capacity < 0) {
    return { ok: false, error: "ظرفیت نامعتبر است" };
  }
  await db.adInventory.upsert({
    where: { placementId_period: { placementId: data.placementId, period: data.period } },
    create: { placementId: data.placementId, period: data.period, capacity: data.capacity },
    update: { capacity: data.capacity },
  });
  return { ok: true };
}

// ── Pricing (reads are public — §20 availability; writes are admin) ──

export async function getActivePricingRules() {
  return db.pricingRule.findMany({ where: { active: true } });
}

export async function getActivePricingFactors() {
  return db.pricingFactor.findMany({ where: { active: true } });
}

export async function listPricingAdmin() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  const [rules, factors] = await Promise.all([
    db.pricingRule.findMany({ orderBy: { key: "asc" } }),
    db.pricingFactor.findMany({ orderBy: { key: "asc" } }),
  ]);
  return { rules, factors };
}

export async function setPricingRule(
  key: string,
  value: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  const { pricingRuleSchema, firstError } = await import("@/lib/validations/ads");
  const parsed = pricingRuleSchema.safeParse({ key, value });
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  await db.pricingRule.upsert({
    where: { key: parsed.data.key },
    create: { key: parsed.data.key, label: parsed.data.key, value: parsed.data.value },
    update: { value: parsed.data.value },
  });
  return { ok: true };
}

export async function setPricingFactor(
  key: string,
  factor: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  const { pricingFactorSchema, firstError } = await import("@/lib/validations/ads");
  const parsed = pricingFactorSchema.safeParse({ key, factor });
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  await db.pricingFactor.upsert({
    where: { key: parsed.data.key },
    create: { key: parsed.data.key, label: parsed.data.key, factor: parsed.data.factor },
    update: { factor: parsed.data.factor },
  });
  return { ok: true };
}
