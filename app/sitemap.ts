import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://liandesign.ir";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/about", "/contact", "/blog", "/websites", "/store", "/ai-finder", "/custom-design", "/privacy", "/terms", "/advertise"].map(
    (p) => ({ url: `${BASE}${p}`, lastModified: new Date() })
  );

  const [websites, webCats, products, prodCats] = await Promise.all([
    db.website.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    db.websiteCategory.findMany({ select: { slug: true } }),
    db.product.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    db.productCategory.findMany({ select: { slug: true } }),
  ]);

  return [
    ...staticRoutes,
    ...webCats.map((c) => ({ url: `${BASE}/websites/category/${c.slug}`, lastModified: new Date() })),
    ...websites.map((w) => ({ url: `${BASE}/websites/${w.slug}`, lastModified: w.updatedAt })),
    ...products.map((p) => ({ url: `${BASE}/store/${p.slug}`, lastModified: p.updatedAt })),
    ...prodCats.map((c) => ({ url: `${BASE}/store?category=${c.slug}`, lastModified: new Date() })),
  ];
}
