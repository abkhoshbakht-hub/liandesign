"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { togglePolicy } from "@/lib/data/ads";

export default function PolicyToggle({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    await togglePolicy(id);
    router.refresh();
    setBusy(false);
  }

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors disabled:opacity-50 ${
        active ? "bg-cyan/10 text-cyan" : "bg-white/5 text-white/40"
      }`}
    >
      {active ? "فعال" : "غیرفعال"}
    </button>
  );
}
