"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleBlogPost, deleteBlogPost } from "@/lib/data/blog";

export default function BlogToggle({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    await toggleBlogPost(id);
    router.refresh();
    setBusy(false);
  }

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors disabled:opacity-50 ${
        published ? "bg-cyan/10 text-cyan" : "bg-white/5 text-white/40"
      }`}
    >
      {published ? "منتشر شده" : "پیش‌نویس"}
    </button>
  );
}

export function BlogDelete({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (!confirm("مقاله حذف شود؟")) return;
    setBusy(true);
    await deleteBlogPost(id);
    router.refresh();
    setBusy(false);
  }

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
    >
      حذف
    </button>
  );
}
