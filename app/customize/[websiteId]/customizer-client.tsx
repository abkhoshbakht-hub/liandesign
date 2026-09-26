"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Save, ShoppingCart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  computeDelta,
  type CustomizationOptionDTO,
  type CustomValues,
} from "@/lib/customizer-utils";
import { formatToman } from "@/lib/format";
import { addCustomToCart } from "@/lib/cart";

function deltaLabel(n: number): string {
  return n === 0 ? "رایگان" : `+${n.toLocaleString("fa-IR")} تومان`;
}

export default function CustomizerClient({
  website,
  options,
  initial,
  isLoggedIn,
  loginHref,
}: {
  website: { id: string; name: string; slug: string; basePrice: number };
  options: CustomizationOptionDTO[];
  initial: CustomValues | null;
  isLoggedIn: boolean;
  loginHref: string;
}) {
  const router = useRouter();
  const draftKey = `lian-customize-${website.id}`;
  const [values, setValues] = useState<CustomValues>(initial ?? {});
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);

  // Guest draft survives the login round-trip.
  useEffect(() => {
    if (initial) return;
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) setValues(JSON.parse(raw) as CustomValues);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(draftKey, JSON.stringify(values));
    } catch {
      /* ignore */
    }
  }, [values, draftKey]);

  const total = useMemo(
    () => website.basePrice + computeDelta(options, values),
    [options, values, website.basePrice]
  );

  const colorOpt = options.find((o) => o.key === "primaryColor");
  const fontOpt = options.find((o) => o.key === "font");
  const pageOpt = options.find((o) => o.key === "pages");
  const featureOpt = options.find((o) => o.key === "features");

  function toggleMulti(key: "pages" | "features", value: string) {
    setValues((v) => {
      const list = [...((v[key] as string[] | undefined) ?? [])];
      const i = list.indexOf(value);
      if (i >= 0) list.splice(i, 1);
      else list.push(value);
      return { ...v, [key]: list };
    });
  }

  async function onSave() {
    setBusy(true);
    setStatus(null);
    const res = await fetch("/api/customize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ websiteId: website.id, values }),
    }).then((r) => r.json() as Promise<{ ok: boolean; error?: string }>);
    if (!res.ok) {
      setStatus(res.error ?? "خطایی رخ داد");
    } else {
      setStatus("saved");
    }
    setBusy(false);
  }

  async function onAdd() {
    setBusy(true);
    setStatus(null);
    const res = await addCustomToCart(website.id, values, total);
    if (!res.ok) setStatus(res.error);
    else {
      setAdded(true);
      try {
        localStorage.removeItem(draftKey);
      } catch {
        /* ignore */
      }
      router.refresh();
    }
    setBusy(false);
  }

  const primary = values.primaryColor ?? colorOpt?.choices[0]?.value ?? "#00F5D4";

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <h3 className="text-sm font-bold text-white mb-4">برند</h3>
          {colorOpt && (
            <div className="mb-5">
              <div className="text-xs text-white/40 mb-2">رنگ اصلی</div>
              <div className="flex gap-3">
                {colorOpt.choices.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={`${c.label} — ${deltaLabel(c.priceDelta)}`}
                    onClick={() => setValues((v) => ({ ...v, primaryColor: c.value }))}
                    className={cn(
                      "w-10 h-10 rounded-xl border-2 transition-all",
                      primary === c.value ? "border-white scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>
          )}
          {fontOpt && (
            <div>
              <div className="text-xs text-white/40 mb-2">فونت</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {fontOpt.choices.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setValues((v) => ({ ...v, font: c.value }))}
                    className={cn(
                      "p-3 rounded-xl text-right text-sm border transition-all",
                      (values.font ?? fontOpt.choices[0]?.value) === c.value
                        ? "border-cyan/40 bg-cyan/10 text-white"
                        : "border-white/10 bg-white/5 text-white/60 hover:border-white/20"
                    )}
                  >
                    <div className="font-bold">{c.label}</div>
                    <div className="text-[11px] opacity-60 mt-1">{deltaLabel(c.priceDelta)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-bold text-white mb-4">محتوای کسب‌وکار</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-xs text-white/40">نام کسب‌وکار</label>
              <Input
                value={values.businessName ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, businessName: e.target.value }))}
                placeholder="مثلاً رستوران شب‌های بوشهر"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">تلفن</label>
              <Input
                value={values.phone ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
                placeholder="۰۹..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">آدرس</label>
              <Input
                value={values.address ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, address: e.target.value }))}
                placeholder="بوشهر..."
              />
            </div>
          </div>
        </Card>

        {pageOpt && (
          <Card className="p-6">
            <h3 className="text-sm font-bold text-white mb-4">{pageOpt.label}</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {pageOpt.choices.map((c) => {
                const on = (values.pages ?? []).includes(c.value);
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => toggleMulti("pages", c.value)}
                    className={cn(
                      "p-3 rounded-xl text-right text-sm border transition-all",
                      on ? "border-cyan/40 bg-cyan/10 text-white" : "border-white/10 bg-white/5 text-white/60 hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      <span className={cn("w-4 h-4 rounded border flex items-center justify-center", on ? "bg-cyan border-cyan" : "border-white/30")}>
                        {on && <Check size={10} className="text-obsidian" />}
                      </span>
                      {c.label}
                    </div>
                    <div className="text-[11px] opacity-60 mt-1 mr-6">{deltaLabel(c.priceDelta)}</div>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {featureOpt && (
          <Card className="p-6">
            <h3 className="text-sm font-bold text-white mb-4">{featureOpt.label}</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {featureOpt.choices.map((c) => {
                const on = (values.features ?? []).includes(c.value);
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => toggleMulti("features", c.value)}
                    className={cn(
                      "p-3 rounded-xl text-right text-sm border transition-all",
                      on ? "border-cyan/40 bg-cyan/10 text-white" : "border-white/10 bg-white/5 text-white/60 hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      <span className={cn("w-4 h-4 rounded border flex items-center justify-center", on ? "bg-cyan border-cyan" : "border-white/30")}>
                        {on && <Check size={10} className="text-obsidian" />}
                      </span>
                      {c.label}
                    </div>
                    <div className="text-[11px] opacity-60 mt-1 mr-6">{deltaLabel(c.priceDelta)}</div>
                  </button>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      <div className="h-fit lg:sticky lg:top-24">
        <Card className="p-6 border-cyan/20">
          <h3 className="text-sm font-bold text-white mb-4">پیش‌نمایش زنده برند</h3>
          <div className="rounded-xl overflow-hidden border border-white/10 mb-4">
            <div className="px-4 py-3 text-sm font-bold text-obsidian" style={{ backgroundColor: primary }}>
              {values.businessName?.trim() || website.name}
            </div>
            <div className="p-4 bg-obsidian-50">
              <div className="h-2 rounded-full mb-2" style={{ backgroundColor: primary, opacity: 0.8 }} />
              <div className="h-2 rounded-full w-2/3 bg-white/10" />
              <div className="text-[10px] text-white/30 mt-3">فونت: {values.font === "brand" ? "اختصاصی برند" : "وزیرمتن"}</div>
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-white/10 pt-4 mb-4">
            <span className="text-sm text-white/50">جمع کل:</span>
            <span className="text-2xl font-bold text-cyan font-jakarta">{formatToman(total)}</span>
          </div>
          {status && status !== "saved" && <p className="text-xs text-red-400 mb-3">{status}</p>}
          {status === "saved" && <p className="text-xs text-cyan mb-3">ذخیره شد ✓</p>}
          {isLoggedIn ? (
            <div className="space-y-2">
              <Button className="w-full" disabled={busy} onClick={onSave}>
                <Save size={14} />
                {busy ? "..." : "ذخیره شخصی‌سازی"}
              </Button>
              {added ? (
                <Button asChild variant="gold" className="w-full">
                  <Link href="/checkout">
                    <ShoppingCart size={14} />
                    رفتن به سبد
                  </Link>
                </Button>
              ) : (
                <Button variant="secondary" className="w-full" disabled={busy} onClick={onAdd}>
                  <ShoppingCart size={14} />
                  افزودن به سبد با این کانفیگ
                </Button>
              )}
            </div>
          ) : (
            <div>
              <Button asChild className="w-full">
                <Link href={loginHref}>ورود برای ذخیره و خرید</Link>
              </Button>
              <p className="text-[11px] text-white/30 mt-3">انتخاب‌هایتان در همین مرورگر نگه داشته می‌شود و بعد از ورود برمی‌گردد.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
