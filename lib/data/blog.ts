"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/data/coupons";

// ── Phase C: Blog CMS ──

export async function getBlogCategories() {
  return db.blogCategory.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getBlogPosts(category?: string) {
  return db.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      ...(category ? { category: { slug: category } } : {}),
    },
    include: { category: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBlogPost(slug: string) {
  return db.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { category: { select: { name: true, slug: true } } },
  });
}

export async function listBlogPostsAdmin() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  return db.blogPost.findMany({
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function listBlogCategoriesAdmin() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  return db.blogCategory.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createBlogCategory(data: {
  name: string;
  slug: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  try {
    await db.blogCategory.create({ data });
    return { ok: true };
  } catch {
    return { ok: false, error: "slug تکراری است" };
  }
}

export async function saveBlogPost(data: {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  body: string;
  categoryId: string;
  status?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "FORBIDDEN" };
  if (data.title.trim().length < 3) return { ok: false, error: "عنوان کوتاه است" };
  if (data.body.trim().length < 10) return { ok: false, error: "متن کوتاه است" };
  try {
    if (data.id) {
      const p = await db.blogPost.update({
        where: { id: data.id },
        data: {
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          body: data.body,
          categoryId: data.categoryId,
          status: (data.status as never) ?? undefined,
        },
      });
      return { ok: true, id: p.id };
    }
    const p = await db.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        body: data.body,
        categoryId: data.categoryId,
        status: (data.status as never) ?? "DRAFT",
      },
    });
    return { ok: true, id: p.id };
  } catch {
    return { ok: false, error: "slug تکراری است" };
  }
}

export async function toggleBlogPost(id: string): Promise<{ ok: boolean }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false };
  const p = await db.blogPost.findUnique({ where: { id } });
  if (!p) return { ok: false };
  await db.blogPost.update({
    where: { id },
    data: { status: p.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" },
  });
  return { ok: true };
}

export async function deleteBlogPost(id: string): Promise<{ ok: boolean }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false };
  await db.blogPost.delete({ where: { id } });
  return { ok: true };
}

export async function getBlogPostAdmin(id: string) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("FORBIDDEN");
  return db.blogPost.findUnique({ where: { id } });
}
