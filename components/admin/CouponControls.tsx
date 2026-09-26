"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createCoupon, toggleCoupon, deleteCoupon } from "@/lib/data/coupons";

export function CouponForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("10");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await createCoupon(code, parseInt(percent, 10));
    if (!res.ok) setError(res.error);
    else {
      setCode("");
      setPercent("10");
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap gap-2 items-end">
      <div className="space-y-1">
        <label className="text-[11px] text-white/40">کد</label>
        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="WELCOME10" className="w-40 font-jakarta" dir="ltr" required />
      </div>
      <div className="space-y-1">
        <label className="text-[11px] text-white/40">درصد</label>
        <Input value={percent} onChange={(e) => setPercent(e.target.value)} type="number" min={1} max={90} className="w-24 font-jakarta" dir="ltr" required />
      </div>
      <Button type="submit" size="sm" disabled={busy}>
        ساخت کوپن
      </Button>
      {error && <p className="text-[11px] text-red-400 w-full">{error}</p>}
    </form>
  );
}

export function CouponToggle({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    await toggleCoupon(id);
    router.refresh();
    setBusy(false);
  }

  async function onDelete() {
    if (!confirm("مطمئنی حذف بشه؟")) return;
    setBusy(true);
    await deleteCoupon(id);
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onClick}
        disabled={busy}
        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors disabled:opacity-50 ${
          active ? "bg-cyan/10 text-cyan" : "bg-white/5 text-white/40"
        }`}
      >
        {active ? "فعال" : "غیرفعال"}
      </button>
      <button
        onClick={onDelete}
        disabled={busy}
        className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
      >
        حذف
      </button>
    </div>
  );
}
