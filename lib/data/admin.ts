"use server";

import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/data/coupons";
import { db } from "@/lib/db";

const ORDER_STATUSES = ["PENDING", "PROCESSING", "PAID", "FAILED", "REFUNDED", "CANCELLED"] as const;
export type OrderStatusInput = (typeof ORDER_STATUSES)[number];

const WEBSITE_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type WebsiteStatusInput = (typeof WEBSITE_STATUSES)[number];

export async function getAdminStats() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");

  const [revenue, ordersByStatus, usersCount, websitesCount, websitesPublished, productsCount, pendingReviews, openTickets] =
    await Promise.all([
      db.order.aggregate({ where: { status: "PAID" }, _sum: { total: true } }),
      db.order.groupBy({ by: ["status"], _count: { status: true } }),
      db.user.count(),
      db.website.count(),
      db.website.count({ where: { status: "PUBLISHED" } }),
      db.product.count(),
      db.review.count({ where: { status: "PENDING" } }),
      db.ticket.count({ where: { status: "OPEN" } }),
    ]);

  const topGroups = await db.orderItem.groupBy({
    by: ["websiteId"],
    where: { websiteId: { not: null } },
    _count: { websiteId: true },
    orderBy: { _count: { websiteId: "desc" } },
    take: 5,
  });
  const topWebsites = await db.website.findMany({
    where: { id: { in: topGroups.map((g) => g.websiteId as string) } },
    select: { id: true, name: true },
  });

  return {
    revenue: revenue._sum.total ?? 0,
    ordersByStatus,
    usersCount,
    websitesCount,
    websitesPublished,
    productsCount,
    pendingReviews,
    openTickets,
    topWebsites: topGroups.map((g) => ({
      name: topWebsites.find((w) => w.id === g.websiteId)?.name ?? "—",
      count: g._count.websiteId,
    })),
  };
}

export async function listOrdersAdmin() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  return db.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { website: { select: { name: true } }, product: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function setOrderStatus(
  id: string,
  status: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, error: "وضعیت نامعتبر است" };
  }
  const order = await db.order.update({ where: { id }, data: { status: status as OrderStatusInput } });
  if (status === "PAID") {
    const { logEvent } = await import("@/lib/analytics");
    await logEvent("payment_success", { orderId: id }, order.userId);
  }
  return { ok: true };
}

export async function listWebsitesAdmin() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  return db.website.findMany({
    include: { category: { select: { name: true } }, _count: { select: { packages: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function listProductsAdmin() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  return db.product.findMany({
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function togglePublish(
  kind: "website" | "product",
  id: string
): Promise<{ ok: boolean }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false };
  if (kind === "website") {
    const w = await db.website.findUnique({ where: { id } });
    if (!w) return { ok: false };
    await db.website.update({
      where: { id },
      data: { status: w.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" },
    });
    revalidateTag("categories");
  } else {
    const p = await db.product.findUnique({ where: { id } });
    if (!p) return { ok: false };
    await db.product.update({
      where: { id },
      data: { status: p.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" },
    });
  }
  return { ok: true };
}

export async function listUsersAdmin() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  return db.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function setUserRole(
  id: string,
  role: "CUSTOMER" | "ADMIN"
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  if (id === admin.id && role !== "ADMIN") {
    return { ok: false, error: "نمی‌توانید دسترسی خودتان را بگیرید" };
  }
  await db.user.update({ where: { id }, data: { role } });
  return { ok: true };
}

export async function listReviewsAdmin(status?: "PENDING" | "APPROVED" | "REJECTED") {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  return db.review.findMany({
    where: status ? { status } : {},
    include: {
      user: { select: { name: true, email: true } },
      website: { select: { name: true } },
      product: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function moderateReview(
  id: string,
  status: "APPROVED" | "REJECTED"
): Promise<{ ok: boolean }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false };
  await db.review.update({ where: { id }, data: { status } });
  return { ok: true };
}

export async function deleteReview(id: string): Promise<{ ok: boolean }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false };
  await db.review.delete({ where: { id } });
  return { ok: true };
}

// ── Websites CRUD ──

export async function createWebsite(data: {
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  demoUrl?: string;
  categoryId: string;
  status?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  try {
    const w = await db.website.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        basePrice: data.basePrice,
        demoUrl: data.demoUrl,
        categoryId: data.categoryId,
        status: (data.status as WebsiteStatusInput) ?? "DRAFT",
      },
    });
    revalidateTag("categories");
    return { ok: true, id: w.id };
  } catch (e: any) {
    if (e?.code === "P2002") return { ok: false, error: "slug تکراری است" };
    return { ok: false, error: "خطا در ایجاد سایت" };
  }
}

export async function updateWebsite(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    basePrice?: number;
    demoUrl?: string;
    categoryId?: string;
    status?: string;
  }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  try {
    await db.website.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.basePrice !== undefined && { basePrice: data.basePrice }),
        ...(data.demoUrl !== undefined && { demoUrl: data.demoUrl }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.status !== undefined && { status: data.status as WebsiteStatusInput }),
      },
    });
    revalidateTag("categories");
    return { ok: true };
  } catch (e: any) {
    if (e?.code === "P2002") return { ok: false, error: "slug تکراری است" };
    return { ok: false, error: "خطا در بروزرسانی" };
  }
}

export async function deleteWebsite(id: string): Promise<{ ok: boolean }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false };
  await db.website.delete({ where: { id } });
  revalidateTag("categories");
  return { ok: true };
}

// ── Website Packages CRUD ──

export async function createPackage(
  websiteId: string,
  data: { name: string; price: number; features: string[] }
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  const p = await db.websitePackage.create({
    data: { name: data.name, price: data.price, features: data.features, websiteId },
  });
  return { ok: true, id: p.id };
}

export async function updatePackage(
  id: string,
  data: { name?: string; price?: number; features?: string[] }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  await db.websitePackage.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.features !== undefined && { features: data.features }),
    },
  });
  return { ok: true };
}

export async function deletePackage(id: string): Promise<{ ok: boolean }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false };
  await db.websitePackage.delete({ where: { id } });
  return { ok: true };
}

// ── Products CRUD ──

export async function createProduct(data: {
  name: string;
  slug: string;
  description?: string;
  price: number;
  fileUrl?: string;
  categoryId: string;
  status?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  try {
    const p = await db.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        fileUrl: data.fileUrl,
        categoryId: data.categoryId,
        status: (data.status as WebsiteStatusInput) ?? "DRAFT",
      },
    });
    return { ok: true, id: p.id };
  } catch (e: any) {
    if (e?.code === "P2002") return { ok: false, error: "slug تکراری است" };
    return { ok: false, error: "خطا در ایجاد محصول" };
  }
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    price?: number;
    fileUrl?: string;
    categoryId?: string;
    status?: string;
  }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  try {
    await db.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.fileUrl !== undefined && { fileUrl: data.fileUrl }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.status !== undefined && { status: data.status as WebsiteStatusInput }),
      },
    });
    return { ok: true };
  } catch (e: any) {
    if (e?.code === "P2002") return { ok: false, error: "slug تکراری است" };
    return { ok: false, error: "خطا در بروزرسانی" };
  }
}

export async function deleteProduct(id: string): Promise<{ ok: boolean }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false };
  await db.product.delete({ where: { id } });
  return { ok: true };
}

// ── Website Categories CRUD ──

export async function listWebsiteCategories() {
  return db.websiteCategory.findMany({
    include: { _count: { select: { websites: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createWebsiteCategory(data: {
  name: string;
  slug: string;
  description?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  try {
    const c = await db.websiteCategory.create({ data });
    revalidateTag("categories");
    return { ok: true, id: c.id };
  } catch (e: any) {
    if (e?.code === "P2002") return { ok: false, error: "slug تکراری است" };
    return { ok: false, error: "خطا در ایجاد دسته‌بندی" };
  }
}

export async function updateWebsiteCategory(
  id: string,
  data: { name?: string; slug?: string; description?: string }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  try {
    await db.websiteCategory.update({ where: { id }, data });
    revalidateTag("categories");
    return { ok: true };
  } catch (e: any) {
    if (e?.code === "P2002") return { ok: false, error: "slug تکراری است" };
    return { ok: false, error: "خطا در بروزرسانی" };
  }
}

export async function deleteWebsiteCategory(id: string): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false };
  try {
    await db.websiteCategory.delete({ where: { id } });
    revalidateTag("categories");
    return { ok: true };
  } catch {
    return { ok: false, error: "این دسته‌بندی سایت دارد" };
  }
}

// ── Product Categories CRUD ──

export async function listProductCategories() {
  return db.productCategory.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createProductCategory(data: {
  name: string;
  slug: string;
  description?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  try {
    const c = await db.productCategory.create({ data });
    return { ok: true, id: c.id };
  } catch (e: any) {
    if (e?.code === "P2002") return { ok: false, error: "slug تکراری است" };
    return { ok: false, error: "خطا در ایجاد دسته‌بندی" };
  }
}

export async function updateProductCategory(
  id: string,
  data: { name?: string; slug?: string; description?: string }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  try {
    await db.productCategory.update({ where: { id }, data });
    return { ok: true };
  } catch (e: any) {
    if (e?.code === "P2002") return { ok: false, error: "slug تکراری است" };
    return { ok: false, error: "خطا در بروزرسانی" };
  }
}

export async function deleteProductCategory(id: string): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false };
  try {
    await db.productCategory.delete({ where: { id } });
    return { ok: true };
  } catch {
    return { ok: false, error: "این دسته‌بندی محصول دارد" };
  }
}
