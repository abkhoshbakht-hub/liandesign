import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export type WebsiteSort = "newest" | "popular" | "price-asc" | "price-desc";

export const getCategories = unstable_cache(
  async () => {
    return db.websiteCategory.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { websites: true } } },
    });
  },
  ["website-categories"],
  { revalidate: 300, tags: ["categories"] }
);

export const getPublishedWebsiteCount = cache(async () => {
  return db.website.count({ where: { status: "PUBLISHED" } });
});

const getWebsitesCached = cache(async (q: string | undefined, category: string | undefined, sort: WebsiteSort) => {
  // NOTE: "popular" maps to newest until view analytics land (growth phase).
  const orderBy =
    sort === "price-asc"
      ? { basePrice: "asc" as const }
      : sort === "price-desc"
        ? { basePrice: "desc" as const }
        : { createdAt: "desc" as const };

  return db.website.findMany({
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
    include: {
      category: true,
      packages: { orderBy: { price: "asc" } },
    },
    orderBy,
  });
});

export async function getWebsites(opts: {
  q?: string;
  category?: string;
  sort?: WebsiteSort;
}) {
  const { q, category, sort = "newest" } = opts;
  return getWebsitesCached(q, category, sort);
}

export type WebsiteWithRelations = Awaited<ReturnType<typeof getWebsites>>[number];

export async function getWebsiteBySlug(slug: string) {
  return db.website.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: true,
      packages: { orderBy: { price: "asc" } },
    },
  });
}

export async function getRelatedWebsites(categoryId: string, excludeId: string) {
  return db.website.findMany({
    where: { status: "PUBLISHED", categoryId, NOT: { id: excludeId } },
    include: { category: true, packages: { orderBy: { price: "asc" } } },
    take: 3,
    orderBy: { createdAt: "desc" },
  });
}
