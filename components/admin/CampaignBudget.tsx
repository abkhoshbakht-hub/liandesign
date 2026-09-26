"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCampaignBudget } from "@/lib/data/ads-engine";

export default function CampaignBudget({ id, budget }: { id: string; budget: number }) {
  const router = useRouter();
  const [value, setValue] = useState(String(budget));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSave() {
    setBusy(true);
    setError(null);
    const res = await setCampaignBudget(id, parseInt(value || "0", 10));
    if (!res.ok) setError(res.error);
    else router.refresh();
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        type="number"
        dir="ltr"
        className="w-28 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-jakarta focus:outline-none focus:border-cyan/40"
      />
      <button
        onClick={onSave}
        disabled={busy}
        className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white/5 text-white/60 hover:text-cyan transition-colors disabled:opacity-50"
      >
        ثبت بودجه
      </button>
      {error && <span className="text-[10px] text-red-400">{error}</span>}
    </div>
  );
}
