"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestRefund } from "@/lib/data/refunds";

export default function RefundButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await requestRefund(orderId, reason);
    if (!res.ok) {
      setError(res.error);
      setBusy(false);
    } else {
      setDone(true);
      router.refresh();
    }
  }

  if (done) return <p className="text-[11px] text-cyan">درخواست استرداد ثبت شد و در حال بررسی است.</p>;
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-[11px] text-white/40 hover:text-cyan transition-colors">
        درخواست استرداد
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap gap-2 items-center">
      <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="دلیل استرداد" className="text-xs flex-1 min-w-40" />
      <Button type="submit" size="sm" variant="secondary" disabled={busy}>
        ثبت درخواست
      </Button>
      {error && <p className="text-[11px] text-red-400 w-full">{error}</p>}
    </form>
  );
}
