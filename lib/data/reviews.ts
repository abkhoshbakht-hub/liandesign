"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export type ReviewTarget = { websiteId?: string; productId?: string };

export async function getApprovedReviews(target: ReviewTarget, take = 10) {
  const { websiteId, productId } = target;
  return db.review.findMany({
    where: {
      status: "APPROVED",
      ...(websiteId ? { websiteId } : {}),
      ...(productId ? { productId } : {}),
    },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getLatestApprovedReviews(take = 3) {
  return db.review.findMany({
    where: { status: "APPROVED" },
    include: {
      user: { select: { name: true } },
      website: { select: { name: true, slug: true } },
      product: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getRatingSummary(target: ReviewTarget): Promise<{ avg: number; count: number }> {
  const { websiteId, productId } = target;
  const agg = await db.review.aggregate({
    where: {
      status: "APPROVED",
      ...(websiteId ? { websiteId } : {}),
      ...(productId ? { productId } : {}),
    },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return { avg: agg._avg.rating ?? 0, count: agg._count.rating };
}

export async function submitReview(input: {
  websiteId?: string;
  productId?: string;
  rating: number;
  comment: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return { ok: false, error: "LOGIN_REQUIRED" };

  const { websiteId, productId, rating, comment } = input;
  if ((websiteId ? 1 : 0) + (productId ? 1 : 0) !== 1) {
    return { ok: false, error: "هدف نظر مشخص نیست" };
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "امتیاز باید بین ۱ تا ۵ باشد" };
  }
  const text = comment.trim().slice(0, 500);
  if (text.length < 2) return { ok: false, error: "متن نظر خیلی کوتاه است" };

  if (websiteId) {
    const exists = await db.website.findFirst({ where: { id: websiteId, status: "PUBLISHED" } });
    if (!exists) return { ok: false, error: "سایت پیدا نشد" };
  } else if (productId) {
    const exists = await db.product.findFirst({ where: { id: productId, status: "PUBLISHED" } });
    if (!exists) return { ok: false, error: "محصول پیدا نشد" };
  }

  // Verified = has a non-cancelled order containing this item.
  const purchase = await db.order.findFirst({
    where: {
      userId,
      NOT: { status: "CANCELLED" },
      items: {
        some: websiteId ? { websiteId } : { productId },
      },
    },
    select: { id: true },
  });

  const existing = await db.review.findFirst({
    where: { userId, ...(websiteId ? { websiteId } : { productId }) },
  });

  if (existing) {
    await db.review.update({
      where: { id: existing.id },
      data: { rating, comment: text, verified: !!purchase, status: "PENDING" },
    });
  } else {
    await db.review.create({
      data: {
        userId,
        websiteId: websiteId ?? null,
        productId: productId ?? null,
        rating,
        comment: text,
        verified: !!purchase,
        status: "PENDING",
      },
    });
  }
  return { ok: true };
}
