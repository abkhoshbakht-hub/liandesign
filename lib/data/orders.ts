"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCart, clearCart } from "@/lib/cart";
import { getReferral } from "@/lib/referral";
import { logEvent } from "@/lib/analytics";
import { manualProvider } from "@/services/payment/manual";
import { logPaymentAttempt } from "@/lib/data/refunds";

function makeNumber(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

export async function placeOrder(
  couponCode?: string
): Promise<{ ok: true; number: string } | { ok: false; error: string }> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return { ok: false, error: "LOGIN_REQUIRED" };

  const cart = await getCart();
  if (cart.length === 0) return { ok: false, error: "EMPTY" };

  // Re-validate every price from the database — never trust the cookie.
  const items: {
    websiteId: string | null;
    productId: string | null;
    packageName: string;
    price: number;
    config: unknown;
  }[] = [];
  for (const item of cart) {
    if (item.kind === "product" || item.productId) {
      if (!item.productId) return { ok: false, error: "آیتم سبد معتبر نیست" };
      const product = await db.product.findFirst({
        where: { id: item.productId, status: "PUBLISHED" },
      });
      if (!product) return { ok: false, error: "محصولی از سبد دیگر موجود نیست" };
      if (item.price !== product.price) return { ok: false, error: "قیمت سبد معتبر نیست" };
      items.push({ websiteId: null, productId: product.id, packageName: "تکی", price: product.price, config: null });
      continue;
    }
    const website = await db.website.findFirst({
      where: { id: item.websiteId, status: "PUBLISHED" },
      include: { packages: true },
    });
    if (!website) return { ok: false, error: "سایتی از سبد دیگر موجود نیست" };

    if (item.customization) {
      // Customized item: recompute from DB options and require exact match.
      const { sanitizeValues, computeDelta } = await import("@/lib/customizer-utils");
      const rows = await db.customizationOption.findMany({ where: { active: true } });
      const options = rows.map((o) => ({
        key: o.key,
        label: o.label,
        type: o.type as "COLOR" | "FONT" | "PAGE" | "FEATURE",
        choices: o.choices as { value: string; label: string; priceDelta: number }[],
      }));
      const clean = sanitizeValues(options, item.customization);
      const expected = website.basePrice + computeDelta(options, clean);
      if (item.price !== expected) return { ok: false, error: "قیمت سبد معتبر نیست" };
      items.push({ websiteId: website.id, productId: null, packageName: "شخصی‌سازی‌شده", price: expected, config: clean });
    } else {
      const pkg = website.packages.find((p) => p.name === item.packageName);
      if (!pkg) return { ok: false, error: "پکیجی از سبد دیگر معتبر نیست" };
      items.push({ websiteId: website.id, productId: null, packageName: pkg.name, price: pkg.price, config: null });
    }
  }

  const subtotal = items.reduce((sum, i) => sum + i.price, 0);

  // Coupon is re-validated here — never trust the client preview.
  let discount = 0;
  let appliedCoupon: string | null = null;
  if (couponCode?.trim()) {
    const clean = couponCode.trim().toUpperCase();
    const coupon = await db.coupon.findUnique({ where: { code: clean } });
    if (!coupon || !coupon.active || coupon.percent < 1 || coupon.percent > 90) {
      return { ok: false, error: "کد تخفیف معتبر نیست" };
    }
    discount = Math.round((subtotal * coupon.percent) / 100);
    appliedCoupon = coupon.code;
  }
  const total = subtotal - discount;
  const ref = getReferral();

  const order = await db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        number: makeNumber("LD"),
        userId,
        status: "PENDING",
        total,
        discount,
        couponCode: appliedCoupon,
        referralSource: ref?.source ?? null,
        referralCampaign: ref?.campaign ?? null,
        items: {
          create: items.map((i) => ({
            websiteId: i.websiteId,
            productId: i.productId,
            packageName: i.packageName,
            price: i.price,
            config: i.config ? JSON.parse(JSON.stringify(i.config)) : null,
          })),
        },
      },
    });
    await tx.invoice.create({
      data: { orderId: created.id, number: makeNumber("INV"), total },
    });
    return created;
  });

  await manualProvider.createPayment({ orderId: order.id, amount: total });
  await logPaymentAttempt(order.id, "PENDING", { amount: total });
  await logEvent("payment_started", { orderId: order.id, total }, userId);
  await clearCart();
  await logEvent("purchase", { orderId: order.id, total }, userId);

  return { ok: true, number: order.number };
}

export async function getUserOrders(userId: string) {
  return db.order.findMany({
    where: { userId },
    include: {
      items: { include: { website: true, product: true } },
      payment: true,
      invoice: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderByNumber(userId: string, number: string) {
  return db.order.findFirst({
    where: { number, userId },
    include: {
      items: { include: { website: true, product: true } },
      payment: true,
      invoice: true,
    },
  });
}
