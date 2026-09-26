"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { reviewCreative } from "@/lib/data/ads-contract";

export default function CreativeReview({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick(status: "APPROVED" | "REJECTED") {
    setBusy(true);
    setError(null);
    const res = await reviewCreative(id, status);
    if (!res.ok) setError(res.error);
    else router.refresh();
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => onClick("APPROVED")} disabled={busy} title="تأیید" className="p-2 rounded-lg text-cyan hover:bg-cyan/10 transition-colors disabled:opacity-50">
        <Check size={14} />
      </button>
      <button onClick={() => onClick("REJECTED")} disabled={busy} title="رد" className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50">
        <X size={14} />
      </button>
      {error && <span className="text-[10px] text-red-400">{error}</span>}
    </div>
  );
}
