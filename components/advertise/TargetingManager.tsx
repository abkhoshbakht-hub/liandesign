"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addTargetingRule, removeTargetingRule, setFrequencyCap } from "@/lib/data/ads-engine";

export interface Rule {
  id: string;
  type: string;
  value: string;
}

const TYPE_FA: Record<string, string> = { DEVICE: "دستگاه", CATEGORY: "دسته‌بندی", TIME: "زمان" };

export default function TargetingManager({
  campaignId,
  initialRules,
  initialCap,
  categories,
}: {
  campaignId: string;
  initialRules: Rule[];
  initialCap: number | null;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [type, setType] = useState("DEVICE");
  const [value, setValue] = useState("mobile");
  const [custom, setCustom] = useState("");
  const [cap, setCap] = useState(initialCap === null ? "" : String(initialCap));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onAdd() {
    setBusy(true);
    setError(null);
    const v = type === "TIME" ? custom : value;
    const res = await addTargetingRule(campaignId, type, v);
    if (!res.ok) setError(res.error);
    else {
      setCustom("");
      router.refresh();
    }
    setBusy(false);
  }

  async function onRemove(id: string) {
    setBusy(true);
    await removeTargetingRule(id);
    router.refresh();
    setBusy(false);
  }

  async function onSaveCap() {
    setBusy(true);
    setError(null);
    const res = await setFrequencyCap(campaignId, cap.trim() === "" ? null : parseInt(cap, 10));
    if (!res.ok) setError(res.error);
    else router.refresh();
    setBusy(false);
  }

  return (
    <Card className="p-5 space-y-4">
      <div className="text-sm font-bold text-white">تارگتینگ و سقف نمایش</div>

      <div className="space-y-2">
        {initialRules.length === 0 && <p className="text-[11px] text-white/30">قانونی نیست — تبلیغ به همه نمایش داده می‌شود.</p>}
        {initialRules.map((r) => (
          <div key={r.id} className="flex items-center gap-2 text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <span className="text-cyan font-bold">{TYPE_FA[r.type] ?? r.type}</span>
            <span className="text-white/60 font-jakarta" dir="auto">{r.value}</span>
            <button onClick={() => onRemove(r.id)} disabled={busy} className="mr-auto p-1 text-white/30 hover:text-red-400" title="حذف">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-end">
        <div className="space-y-1">
          <label className="text-[10px] text-white/30">نوع</label>
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setValue(e.target.value === "DEVICE" ? "mobile" : ""); }}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan/40"
          >
            <option value="DEVICE" className="bg-white dark:bg-obsidian">دستگاه</option>
            <option value="CATEGORY" className="bg-white dark:bg-obsidian">دسته‌بندی</option>
            <option value="TIME" className="bg-white dark:bg-obsidian">زمان</option>
          </select>
        </div>
        {type === "DEVICE" && (
          <div className="space-y-1">
            <label className="text-[10px] text-white/30">مقدار</label>
            <select value={value} onChange={(e) => setValue(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan/40">
              <option value="mobile" className="bg-white dark:bg-obsidian">موبایل</option>
              <option value="desktop" className="bg-white dark:bg-obsidian">دسکتاپ</option>
            </select>
          </div>
        )}
        {type === "CATEGORY" && (
          <div className="space-y-1">
            <label className="text-[10px] text-white/30">دسته</label>
            <select value={value} onChange={(e) => setValue(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan/40">
              <option value="" className="bg-white dark:bg-obsidian">انتخاب کنید</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-obsidian">{c.name}</option>
              ))}
            </select>
          </div>
        )}
        {type === "TIME" && (
          <div className="space-y-1">
            <label className="text-[10px] text-white/30">مقدار (weekday/weekend/hour:9-18)</label>
            <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="hour:9-18" dir="ltr" className="text-xs w-44" />
          </div>
        )}
        <Button size="sm" onClick={onAdd} disabled={busy}>افزودن</Button>
      </div>

      <div className="flex flex-wrap gap-2 items-end border-t border-white/10 pt-4">
        <div className="space-y-1">
          <label className="text-[10px] text-white/30">سقف نمایش روزانه (خالی = پیش‌فرض سیستم)</label>
          <Input value={cap} onChange={(e) => setCap(e.target.value)} type="number" dir="ltr" placeholder="۳" className="text-xs w-28 font-jakarta" />
        </div>
        <Button size="sm" variant="secondary" onClick={onSaveCap} disabled={busy}>ذخیره سقف</Button>
      </div>
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </Card>
  );
}
