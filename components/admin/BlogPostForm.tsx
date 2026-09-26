"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveBlogPost } from "@/lib/data/blog";

export interface BlogFormData {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  categoryId: string;
  status: string;
}

export default function BlogPostForm({
  initial,
  categories,
}: {
  initial?: BlogFormData;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<BlogFormData>(
    initial ?? { title: "", slug: "", excerpt: "", body: "", categoryId: categories[0]?.id ?? "", status: "DRAFT" }
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof BlogFormData>(k: K, v: string) {
    setForm({ ...form, [k]: v });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await saveBlogPost(form);
    if (!res.ok) {
      setError(res.error);
      setBusy(false);
    } else {
      router.push("/admin/blog");
      router.refresh();
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-white/40">عنوان</label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-white/40">slug</label>
            <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} dir="ltr" required />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-white/40">دسته‌بندی</label>
            <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan/40">
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-obsidian">{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-white/40">وضعیت</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan/40">
              <option value="DRAFT" className="bg-white dark:bg-obsidian">پیش‌نویس</option>
              <option value="PUBLISHED" className="bg-white dark:bg-obsidian">منتشر شده</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-white/40">خلاصه</label>
          <Input value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-white/40">متن (هر پاراگراف در یک خط)</label>
          <textarea
            value={form.body}
            onChange={(e) => set("body", e.target.value)}
            rows={10}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan/40 focus:ring-2 focus:ring-cyan/20"
            required
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <Button type="submit" disabled={busy}>
          {busy ? "در حال ذخیره..." : "ذخیره مقاله"}
        </Button>
      </form>
    </Card>
  );
}
