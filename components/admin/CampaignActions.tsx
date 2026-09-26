"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { transitionCampaign } from "@/lib/data/ads-engine";
import { finalApproveCampaign } from "@/lib/data/ads-contract";

const NEXT: Record<string, { to: string; label: string }[]> = {
  PENDING_REVIEW: [
    { to: "APPROVED", label: "تأیید" },
    { to: "REJECTED", label: "رد" },
  ],
  FINAL_APPROVAL_PENDING: [{ to: "FINAL_APPROVED", label: "تأیید نهایی" }],
  FINAL_APPROVED: [{ to: "EFFECTIVE", label: "مؤثر" }],
  EFFECTIVE: [{ to: "SCHEDULED", label: "زمان‌بندی" }],
  SCHEDULED: [{ to: "ACTIVE", label: "فعال‌سازی" }],
  ACTIVE: [
    { to: "PAUSED", label: "توقف" },
    { to: "COMPLETED", label: "اتمام" },
  ],
  PAUSED: [
    { to: "ACTIVE", label: "ادامه" },
    { to: "CANCELLED", label: "لغو" },
  ],
};

export default function CampaignActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const actions = NEXT[status] ?? [];

  if (actions.length === 0) return null;

  async function onClick(to: string) {
    setBusy(true);
    setError(null);
    const res = to === "FINAL_APPROVED" ? await finalApproveCampaign(id) : await transitionCampaign(id, to);
    if (!res.ok) setError(res.error);
    else router.refresh();
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-2">
      {actions.map((a) => (
        <button
          key={a.to}
          onClick={() => onClick(a.to)}
          disabled={busy}
          className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white/5 text-white/60 hover:text-cyan hover:bg-cyan/5 transition-colors disabled:opacity-50"
        >
          {a.label}
        </button>
      ))}
      {error && <span className="text-[10px] text-red-400">{error}</span>}
    </div>
  );
}
