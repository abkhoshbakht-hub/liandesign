"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WebsiteSort } from "@/lib/data/websites";

type Category = { name: string; slug: string };

function hrefFor(current: { q?: string; category?: string; sort?: string }, patch: { q?: string; category?: string; sort?: string }) {
  const params = new URLSearchParams();
  const q = patch.q !== undefined ? patch.q : current.q;
  const category = patch.category !== undefined ? patch.category : current.category;
  const sort = patch.sort !== undefined ? patch.sort : current.sort;
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (sort && sort !== "newest") params.set("sort", sort);
  const s = params.toString();
  return s ? `/websites?${s}` : "/websites";
}

export default function WebsiteFilters({
  categories,
  current,
}: {
  categories: Category[];
  current: { q?: string; category?: string; sort?: WebsiteSort };
}) {
  const router = useRouter();
  const [q, setQ] = useState(current.q ?? "");

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(hrefFor(current, { q: q.trim() || undefined }));
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجو: رستوران، فروشگاه، شرکتی..."
            className="pr-10"
          />
        </div>
        <Button type="submit" variant="secondary">
          جستجو
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={hrefFor(current, { category: undefined })}
          className={cn(
            "px-4 py-2 rounded-lg text-xs font-bold transition-colors",
            !current.category ? "bg-cyan text-obsidian" : "bg-white/5 text-white/50 hover:bg-white/10"
          )}
        >
          همه
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={hrefFor(current, { category: c.slug })}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-colors",
              current.category === c.slug
                ? "bg-cyan text-obsidian"
                : "bg-white/5 text-white/50 hover:bg-white/10"
            )}
          >
            {c.name}
          </Link>
        ))}
        <select
          value={current.sort ?? "newest"}
          onChange={(e) => router.push(hrefFor(current, { sort: e.target.value }))}
          className="mr-auto bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan/40"
        >
          <option value="newest">جدیدترین</option>
          <option value="popular">پربازدیدترین</option>
          <option value="price-asc">ارزان‌ترین</option>
          <option value="price-desc">گران‌ترین</option>
        </select>
      </div>
    </div>
  );
}
