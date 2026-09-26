"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateMyName, changeMyPassword } from "@/lib/data/settings";

export default function SettingsForms({ name, email }: { name?: string | null; email?: string | null }) {
  const router = useRouter();
  const [n, setN] = useState(name ?? "");
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onName(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    const res = await updateMyName(n);
    if (!res.ok) setErr(res.error);
    else {
      setMsg("نام ذخیره شد");
      router.refresh();
    }
    setBusy(false);
  }

  async function onPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    const res = await changeMyPassword(cur, next);
    if (!res.ok) setErr(res.error);
    else {
      setMsg("رمز عبور تغییر کرد");
      setCur("");
      setNext("");
    }
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="text-sm font-bold text-white mb-1">حساب کاربری</div>
        <p className="text-[11px] text-white/30 mb-4 font-jakarta" dir="ltr">{email}</p>
        <form onSubmit={onName} className="flex flex-wrap gap-2 items-end">
          <div className="space-y-2">
            <label className="text-xs text-white/40">نام نمایشی</label>
            <Input value={n} onChange={(e) => setN(e.target.value)} className="w-56" />
          </div>
          <Button type="submit" size="sm" disabled={busy}>ذخیره</Button>
        </form>
      </Card>
      <Card className="p-6">
        <div className="text-sm font-bold text-white mb-4">تغییر رمز عبور</div>
        <form onSubmit={onPassword} className="flex flex-wrap gap-2 items-end">
          <div className="space-y-2">
            <label className="text-xs text-white/40">رمز فعلی</label>
            <Input value={cur} onChange={(e) => setCur(e.target.value)} type="password" dir="ltr" className="w-44" required />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-white/40">رمز جدید</label>
            <Input value={next} onChange={(e) => setNext(e.target.value)} type="password" dir="ltr" className="w-44" required />
          </div>
          <Button type="submit" size="sm" disabled={busy}>تغییر رمز</Button>
        </form>
      </Card>
      {msg && <p className="text-xs text-cyan">{msg}</p>}
      {err && <p className="text-xs text-red-400">{err}</p>}
    </div>
  );
}
