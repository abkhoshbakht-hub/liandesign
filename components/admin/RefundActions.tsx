"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reviewRefund, completeRefund } from "@/lib/data/refunds";

export default function RefundActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true);
    setError(null);
    const res = await fn();
    if (!res.ok) setError(res.error ?? "خطا");
    else router.refresh();
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-2">
      {status === "REQUESTED" && (
        <>
          <button onClick={() => run(() => reviewRefund(id, "APPROVED"))} disabled={busy} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white/5 text-white/60 hover:text-cyan transition-colors disabled:opacity-50">
            تأیید
          </button>
          <button onClick={() => run(() => reviewRefund(id, "REJECTED"))} disabled={busy} className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50">
            رد
          </button>
        </>
      )}
      {status === "APPROVED" && (
        <button onClick={() => run(() => completeRefund(id))} disabled={busy} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-cyan/10 text-cyan hover:bg-cyan/20 transition-colors disabled:opacity-50">
          انجام استرداد
        </button>
      )}
      {error && <span className="text-[10px] text-red-400">{error}</span>}
    </div>
  );
}
