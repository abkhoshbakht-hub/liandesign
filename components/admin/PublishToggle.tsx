"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { togglePublish } from "@/lib/data/admin";
import { cn } from "@/lib/utils";

export default function PublishToggle({
  kind,
  id,
  published,
}: {
  kind: "website" | "product";
  id: string;
  published: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    await togglePublish(kind, id);
    router.refresh();
    setBusy(false);
  }

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={cn(
        "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors disabled:opacity-50",
        published ? "bg-cyan/10 text-cyan" : "bg-white/5 text-white/40 hover:bg-white/10"
      )}
    >
      {published ? "منتشر شده" : "پیش‌نویس"}
    </button>
  );
}
