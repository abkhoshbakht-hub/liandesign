"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function requireAdmin(): Promise<{ id: string } | null> {
  const { getTestActor } = await import("@/lib/test-actor");
  const test = getTestActor();
  if (test) return test.role === "ADMIN" ? { id: test.id } : null;
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || user.role !== "ADMIN") return null;
  return { id: user.id };
}

export async function validateCoupon(
  code: string
): Promise<{ ok: true; percent: number } | { ok: false; error: string }> {
  const clean = code.trim().toUpperCase();
  if (!clean) return { ok: false, error: "کد تخفیف را وارد کنید" };
  const coupon = await db.coupon.findUnique({ where: { code: clean } });
  if (!coupon || !coupon.active) return { ok: false, error: "کد تخفیف معتبر نیست" };
  if (coupon.percent < 1 || coupon.percent > 90) return { ok: false, error: "کد تخفیف معتبر نیست" };
  return { ok: true, percent: coupon.percent };
}

export async function listCoupons() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  return db.coupon.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createCoupon(
  code: string,
  percent: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  const clean = code.trim().toUpperCase();
  if (clean.length < 3 || clean.length > 32) return { ok: false, error: "کد باید ۳ تا ۳۲ حرف باشد" };
  if (!Number.isInteger(percent) || percent < 1 || percent > 90) {
    return { ok: false, error: "درصد باید بین ۱ تا ۹۰ باشد" };
  }
  try {
    await db.coupon.create({ data: { code: clean, percent, active: true } });
    return { ok: true };
  } catch {
    return { ok: false, error: "این کد قبلاً ثبت شده است" };
  }
}

export async function toggleCoupon(id: string): Promise<{ ok: boolean }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false };
  const coupon = await db.coupon.findUnique({ where: { id } });
  if (!coupon) return { ok: false };
  await db.coupon.update({ where: { id }, data: { active: !coupon.active } });
  return { ok: true };
}

export async function deleteCoupon(id: string): Promise<{ ok: boolean }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false };
  await db.coupon.delete({ where: { id } });
  return { ok: true };
}
