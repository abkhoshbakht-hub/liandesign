"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatToman } from "@/lib/format";
import { buyCredit } from "@/lib/data/ads-shop";

export default function CreditForm({ min }: { min: number }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setDone(false);
    const res = await buyCredit(parseInt(amount || "0", 10));
    if (!res.ok) setError(res.error === "LOGIN_REQUIRED" ? "ابتدا وارد شوید" : res.error);
    else {
      setDone(true);
      setAmount("");
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap gap-2 items-end">
      <div className="space-y-1">
        <label className="text-[11px] text-white/40">مبلغ شارژ (تومان) — حداقل {formatToman(min)}</label>
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" dir="ltr" placeholder="30000000" className="w-48 font-jakarta" required />
      </div>
      <Button type="submit" size="sm" disabled={busy}>
        {busy ? "..." : "شارژ کردیت"}
      </Button>
      {error && <p className="text-[11px] text-red-400 w-full">{error}</p>}
      {done && <p className="text-[11px] text-cyan w-full">سفارش شارژ ثبت شد. پس از پرداخت در «سفارش‌های من» پیگیری کنید.</p>}
    </form>
  );
}
