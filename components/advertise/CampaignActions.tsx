"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  preAcceptContract,
  createCampaignOrder,
  updateAdvertiserProfile,
} from "@/lib/data/ads-contract";
import { payOrderWithCredit } from "@/lib/data/ads-shop";

export function PreAcceptButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setBusy(true);
    setError(null);
    const res = await preAcceptContract(id);
    if (!res.ok) {
      setError(res.error);
      setBusy(false);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={onClick} disabled={busy} className="w-full">
        {busy ? "در حال ثبت..." : "پذیرش قرارداد و ادامه به پرداخت"}
      </Button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function OrderButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [number, setNumber] = useState<string | null>(null);

  async function onClick() {
    setBusy(true);
    setError(null);
    const res = await createCampaignOrder(id);
    if (!res.ok) {
      setError(res.error);
      setBusy(false);
    } else {
      setNumber(res.number);
      router.refresh();
    }
  }

  return (
    <div className="space-y-2">
      {!number ? (
        <Button onClick={onClick} disabled={busy} className="w-full">
          {busy ? "در حال ثبت..." : "ثبت سفارش پرداخت"}
        </Button>
      ) : (
        <p className="text-xs text-cyan">سفارش {number} ثبت شد. پس از پرداخت، از همین‌جا پیگیری کنید.</p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function CreditPayButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (!confirm("پرداخت کامل با کردیت انجام شود؟")) return;
    setBusy(true);
    setError(null);
    const res = await payOrderWithCredit(orderId);
    if (!res.ok) {
      setError(res.error);
      setBusy(false);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={onClick} disabled={busy} variant="secondary" className="w-full">
        {busy ? "در حال پرداخت..." : "پرداخت با کردیت"}
      </Button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function ProfileForm({ company, phone }: { company?: string | null; phone?: string | null }) {
  const router = useRouter();
  const [c, setC] = useState(company ?? "");
  const [p, setP] = useState(phone ?? "");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function onSave() {
    setBusy(true);
    await updateAdvertiserProfile({ company: c, phone: p });
    setSaved(true);
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs text-white/40">نام شرکت (اختیاری)</label>
          <Input value={c} onChange={(e) => setC(e.target.value)} placeholder="شرکت..." />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-white/40">تلفن</label>
          <Input value={p} onChange={(e) => setP(e.target.value)} dir="ltr" placeholder="09..." />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={onSave} disabled={busy}>
          ذخیره مشخصات
        </Button>
        {saved && <span className="text-[11px] text-cyan">ذخیره شد</span>}
      </div>
    </div>
  );
}
