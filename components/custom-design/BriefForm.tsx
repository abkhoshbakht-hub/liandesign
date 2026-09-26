"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTicket, logCustomDesignRequest } from "@/lib/data/tickets";

const FIELDS = [
  { name: "businessType", label: "نوع کسب‌وکار", placeholder: "مثلاً رستوران، کلینیک، فروشگاه" },
  { name: "goal", label: "هدف سایت", placeholder: "مثلاً فروش آنلاین، جذب مشتری" },
  { name: "pages", label: "صفحات موردنیاز", placeholder: "مثلاً خانه، درباره ما، تماس، فروشگاه" },
  { name: "features", label: "امکانات", placeholder: "مثلاً رزرو آنلاین، درگاه پرداخت" },
  { name: "style", label: "سبک ظاهری", placeholder: "مثلاً مدرن، مینیمال، لوکس" },
  { name: "budget", label: "بودجه تقریبی (تومان)", placeholder: "مثلاً ۲۰٬۰۰۰٬۰۰۰", dir: "ltr" as const },
  { name: "timeline", label: "زمان‌بندی", placeholder: "مثلاً یک ماهه" },
  { name: "references", label: "سایت‌های مرجع", placeholder: "آدرس سایت‌هایی که می‌پسندید" },
];

export default function BriefForm() {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const body = [...FIELDS.map((f) => `${f.label}: ${values[f.name]?.trim() || "—"}`), `توضیحات: ${description.trim() || "—"}`].join("\n");
    const res = await createTicket("درخواست طراحی اختصاصی", body);
    if (!res.ok) {
      setError(res.error);
      setBusy(false);
    } else {
      await logCustomDesignRequest(res.id);
      router.push(`/dashboard/tickets/${res.id}`);
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <div key={f.name} className="space-y-2">
            <label className="text-xs text-white/40">{f.label}</label>
            <Input
              value={values[f.name] ?? ""}
              onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
              placeholder={f.placeholder}
              dir={f.dir}
            />
          </div>
        ))}
        <div className="space-y-2 sm:col-span-2">
          <label className="text-xs text-white/40">توضیحات تکمیلی</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="هر نکته‌ای که به طراحی بهتر کمک می‌کند..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan/40 focus:ring-2 focus:ring-cyan/20 resize-none"
          />
        </div>
        {error && <p className="text-xs text-red-400 sm:col-span-2">{error}</p>}
        <Button type="submit" className="sm:col-span-2" disabled={busy}>
          {busy ? "در حال ثبت..." : "ارسال درخواست طراحی"}
        </Button>
      </form>
    </Card>
  );
}
