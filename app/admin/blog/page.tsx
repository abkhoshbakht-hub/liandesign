import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listBlogPostsAdmin, listBlogCategoriesAdmin, createBlogCategory } from "@/lib/data/blog";
import InlineForm from "@/components/admin/InlineForm";
import BlogToggle, { BlogDelete } from "@/components/admin/BlogControls";

export default async function AdminBlog() {
  const [posts, categories] = await Promise.all([listBlogPostsAdmin(), listBlogCategoriesAdmin()]);

  async function addCategory(values: Record<string, string>) {
    "use server";
    const res = await createBlogCategory({ name: values.name, slug: values.slug });
    return res.ok ? { ok: true } : { ok: false, error: res.error };
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-white">دسته‌بندی‌ها ({categories.length.toLocaleString("fa-IR")})</div>
          <InlineForm
            label="دسته جدید"
            fields={[
              { name: "name", placeholder: "نام" },
              { name: "slug", placeholder: "slug", dir: "ltr" },
            ]}
            action={addCategory}
          />
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] text-white/40">
          {categories.map((c) => (
            <span key={c.id} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
              {c.name} — {c._count.posts.toLocaleString("fa-IR")} مقاله
            </span>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-bold text-white">مقالات ({posts.length.toLocaleString("fa-IR")})</div>
          <Button asChild size="sm" variant="secondary">
            <Link href="/admin/blog/new">مقاله جدید</Link>
          </Button>
        </div>
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex-1">
                <div className="text-sm font-bold text-white">{p.title}</div>
                <div className="text-[11px] text-white/40 mt-1">
                  {p.category.name} — <span className="font-jakarta" dir="ltr">{p.slug}</span>
                </div>
              </div>
              {p.status !== "PUBLISHED" && <Badge variant="gold">پیش‌نویس</Badge>}
              <Link href={`/admin/blog/${p.id}`} className="text-[11px] text-cyan hover:underline">
                ویرایش
              </Link>
              <BlogToggle id={p.id} published={p.status === "PUBLISHED"} />
              <BlogDelete id={p.id} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
