import { db } from "@/lib/db";

export async function getProductCategories() {
  return db.productCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function getProducts(opts: { q?: string; category?: string }) {
  const { q, category } = opts;
  return db.product.findMany({
    where: {
      status: "PUBLISHED",
      ...(category ? { category: { slug: category } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { description: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export type ProductWithCategory = Awaited<ReturnType<typeof getProducts>>[number];

export async function getProductBySlug(slug: string) {
  return db.product.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { category: true },
  });
}

export async function getRelatedProducts(categoryId: string, excludeId: string) {
  return db.product.findMany({
    where: { status: "PUBLISHED", categoryId, NOT: { id: excludeId } },
    include: { category: true },
    take: 3,
    orderBy: { createdAt: "desc" },
  });
}
