"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/data/coupons";
import { manualProvider } from "@/services/payment/manual";

// ── Phase B: Refund مستقل (§56) + لاگ تلاش پرداخت ──

async function actor() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  return user?.id ? { id: user.id, role: user.role ?? "CUSTOMER" } : null;
}

export async function logPaymentAttempt(
  orderId: string,
  status: string,
  payload?: Record<string, unknown>
): Promise<void> {
  try {
    await db.paymentAttempt.create({
      data: { orderId, status, reference: null, payload: payload ? JSON.parse(JSON.stringify(payload)) : null },
    });
  } catch {
    /* ignore */
  }
}

export async function requestRefund(
  orderId: string,
  reason: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const a = await actor();
  if (!a) return { ok: false, error: "FORBIDDEN" };
  const order = await db.order.findFirst({ where: { id: orderId, userId: a.id } });
  if (!order) return { ok: false, error: "FORBIDDEN" };
  if (order.status !== "PAID") return { ok: false, error: "فقط سفارش پرداخت‌شده قابل استرداد است" };
  const existing = await db.refund.findFirst({
    where: { orderId, status: { in: ["REQUESTED", "APPROVED", "PROCESSING"] } },
  });
  if (existing) return { ok: false, error: "درخواست بازی برای این سفارش ثبت شده است" };
  await db.refund.create({
    data: { orderId, amount: order.total, status: "REQUESTED", reason: reason.trim() || null, createdBy: a.id },
  });
  await db.auditLog.create({ data: { action: "refund.request", entity: "Order", entityId: orderId, actorId: a.id } });
  return { ok: true };
}

export async function listRefundsAdmin(status?: string) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  return db.refund.findMany({
    where: status ? { status: status as never } : {},
    include: { order: { select: { number: true, total: true, user: { select: { name: true, email: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function reviewRefund(
  id: string,
  decision: "APPROVED" | "REJECTED"
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  const refund = await db.refund.findUnique({ where: { id } });
  if (!refund) return { ok: false, error: "یافت نشد" };
  if (refund.status !== "REQUESTED") return { ok: false, error: "این درخواست قبلاً بررسی شده است" };
  await db.$transaction(async (tx) => {
    await tx.refund.update({ where: { id }, data: { status: decision } });
    await tx.auditLog.create({ data: { action: `refund.${decision.toLowerCase()}`, entity: "Refund", entityId: id, actorId: admin.id } });
  });
  return { ok: true };
}

export async function completeRefund(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  const refund = await db.refund.findUnique({
    where: { id },
    include: { order: { include: { payment: true } } },
  });
  if (!refund) return { ok: false, error: "یافت نشد" };
  if (refund.status !== "APPROVED") return { ok: false, error: "ابتدا باید تأیید شود" };

  await db.refund.update({ where: { id }, data: { status: "PROCESSING" } });
  try {
    if (refund.order.payment?.reference) {
      await manualProvider.refundPayment(refund.order.payment.reference);
    } else {
      await db.order.update({ where: { id: refund.orderId }, data: { status: "REFUNDED" } });
    }
    await db.refund.update({ where: { id }, data: { status: "COMPLETED" } });
    await db.auditLog.create({ data: { action: "refund.complete", entity: "Refund", entityId: id, actorId: admin.id } });
    return { ok: true };
  } catch {
    await db.refund.update({ where: { id }, data: { status: "APPROVED" } });
    return { ok: false, error: "خطا در استرداد" };
  }
}

export async function listPaymentsAdmin() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  return db.payment.findMany({
    include: {
      order: { select: { number: true, total: true, status: true, user: { select: { name: true, email: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}
