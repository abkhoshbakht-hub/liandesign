"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatToman } from "@/lib/format";
import { submitSponsoredCampaign, getWizardQuote } from "@/lib/data/ads-engine";

export interface WizardData {
  websites: { id: string; name: string; slug: string }[];
  products: { id: string; name: string; slug: string }[];
  categories: { id: string; name: string; slug: string }[];
  placements: { id: string; key: string; name: string }[];
}

const DRAFT_KEY = "lian-ads-draft";

const KINDS = [
  { value: "SPONSORED_WEBSITE", label: "سایت اسپانسری", desc: "نمایش در مارکت‌پلیس با لیبل تبلیغاتی" },
  { value: "FEATURED_WEBSITE", label: "سایت ویژه", desc: "جایگاه برتر مارکت‌پلیس" },
  { value: "SPONSORED_PRODUCT", label: "محصول اسپانسری", desc: "نمایش در فروشگاه دیجیتال" },
  { value: "SPONSORED_SEARCH", label: "جستجوی اسپانسری", desc: "با کلیدواژه و مدل CPC" },
  { value: "CATEGORY_SPONSOR", label: "اسپانسر دسته", desc: "بنر بالای صفحه دسته‌بندی" },
  { value: "DISPLAY", label: "بنر نمایشی", desc: "بنر تصویری در جایگاه‌های سایت" },
];

export default function WizardForm({ data }: { data: WizardData }) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<"visibility" | "clicks">("visibility");
  const [kind, setKind] = useState("SPONSORED_WEBSITE");
  const [title, setTitle] = useState("");
  const [websiteId, setWebsiteId] = useState("");
  const [productId, setProductId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [bid, setBid] = useState("");
  const [budget, setBudget] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [quote, setQuote] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [placementId, setPlacementId] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const loaded = useRef(false);

  // پیش‌نویس خودکار (§45): ذخیره محلی + ادامه بعداً
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.step) setStep(d.step);
      if (d.goal) setGoal(d.goal);
      if (d.kind) setKind(d.kind);
      if (d.title) setTitle(d.title);
      if (d.websiteId) setWebsiteId(d.websiteId);
      if (d.productId) setProductId(d.productId);
      if (d.categoryId) setCategoryId(d.categoryId);
      if (d.keyword) setKeyword(d.keyword);
      if (d.bid) setBid(d.bid);
      if (d.budget) setBudget(d.budget);
      if (d.startsAt) setStartsAt(d.startsAt);
      if (d.endsAt) setEndsAt(d.endsAt);
      if (d.placementId) setPlacementId(d.placementId);
      if (d.fileUrl) setFileUrl(d.fileUrl);
      if (d.linkUrl) setLinkUrl(d.linkUrl);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!loaded.current || doneId) return;
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ step, goal, kind, title, websiteId, productId, categoryId, keyword, bid, budget, startsAt, endsAt, placementId, fileUrl, linkUrl })
      );
    } catch {
      /* ignore */
    }
  }, [step, goal, kind, title, websiteId, productId, categoryId, keyword, bid, budget, startsAt, endsAt, placementId, fileUrl, linkUrl, doneId]);

  async function onUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/ads/creative-upload", { method: "POST", body: form });
      const json = await res.json();
      if (!json.ok) setError(json.error ?? "خطا در آپلود");
      else setFileUrl(json.url);
    } catch {
      setError("خطا در آپلود");
    }
    setUploading(false);
  }

  async function goPreview() {
    setError(null);
    if (title.trim().length < 3) return setError("عنوان کمپین کوتاه است");
    if (!budget || parseInt(budget, 10) <= 0) return setError("بودجه نامعتبر است");
    setBusy(true);
    const model = kind === "SPONSORED_SEARCH" ? "CPC" : "CPM";
    const res = await getWizardQuote({ model, placementKey: "marketplace.native" });
    setQuote(res.ok ? res.unit : null);
    setBusy(false);
    setStep(4);
  }

  async function onSubmit() {
    setBusy(true);
    setError(null);
    const res = await submitSponsoredCampaign({
      title,
      kind,
      websiteId: websiteId || undefined,
      productId: productId || undefined,
      categoryId: categoryId || undefined,
      keyword: keyword || undefined,
      bid: bid ? parseInt(bid, 10) : undefined,
      budget: parseInt(budget, 10),
      startsAt: startsAt || undefined,
      endsAt: endsAt || undefined,
      placementId: placementId || undefined,
      creative: kind === "DISPLAY" ? { fileUrl: fileUrl || undefined, linkUrl: linkUrl || undefined } : undefined,
    });
    if (!res.ok) {
      setError(res.error);
      setBusy(false);
    } else {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      setDoneId(res.id);
    }
  }

  if (doneId) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto">
        <CheckCircle size={40} className="text-cyan mx-auto mb-4" />
        <div className="text-lg font-bold text-white mb-2">کمپین ثبت شد</div>
        <p className="text-xs text-white/50 leading-relaxed mb-6">
          کمپین شما در حال بررسی است. پس از تأیید، مراحل قرارداد و پرداخت اعلام می‌شود.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/advertise/dashboard" className="text-sm text-cyan hover:underline">
            مشاهده کمپین‌های من
          </Link>
          <Link href="/advertise#services" className="text-sm text-white/50 hover:text-cyan transition-colors">
            افزودن لندینگ‌پیج و بنر
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/10">
            <div className={`h-full rounded-full transition-all ${s <= step ? "bg-cyan" : ""}`} />
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card className="p-6 space-y-4">
          <div className="text-base font-bold text-white">هدف کمپین چیست؟</div>
          {[
            { v: "visibility", t: "دیده شدن", d: "نمایش در مارکت‌پلیس و دسته‌بندی‌ها" },
            { v: "clicks", t: "جذب کلیک", d: "جستجوی اسپانسری با مدل CPC" },
          ].map((g) => (
            <button
              key={g.v}
              onClick={() => { setGoal(g.v as typeof goal); if (g.v === "clicks") setKind("SPONSORED_SEARCH"); }}
              className={`w-full text-right p-4 rounded-xl border transition-colors ${
                goal === g.v ? "border-cyan/50 bg-cyan/5" : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="text-sm font-bold text-white">{g.t}</div>
              <div className="text-[11px] text-white/40 mt-1">{g.d}</div>
            </button>
          ))}
          <Button onClick={() => setStep(2)} className="w-full">ادامه</Button>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6 space-y-3">
          <div className="text-base font-bold text-white mb-2">نوع تبلیغ را انتخاب کنید</div>
          {KINDS.map((k) => (
            <button
              key={k.value}
              onClick={() => setKind(k.value)}
              className={`w-full text-right p-4 rounded-xl border transition-colors ${
                kind === k.value ? "border-cyan/50 bg-cyan/5" : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="text-sm font-bold text-white">{k.label}</div>
              <div className="text-[11px] text-white/40 mt-1">{k.desc}</div>
            </button>
          ))}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep(1)}><ArrowRight size={14} /></Button>
            <Button onClick={() => setStep(3)} className="flex-1">ادامه</Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="p-6 space-y-4">
          <div className="text-base font-bold text-white mb-2">جزئیات کمپین</div>
          <div className="space-y-2">
            <label className="text-xs text-white/40">عنوان کمپین</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً فروش ویژه تابستان" />
          </div>
          {(kind === "SPONSORED_WEBSITE" || kind === "FEATURED_WEBSITE") && (
            <div className="space-y-2">
              <label className="text-xs text-white/40">سایت</label>
              <select value={websiteId} onChange={(e) => setWebsiteId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan/40">
                <option value="" className="bg-white dark:bg-obsidian">انتخاب کنید</option>
                {data.websites.map((w) => (
                  <option key={w.id} value={w.id} className="bg-white dark:bg-obsidian">{w.name}</option>
                ))}
              </select>
            </div>
          )}
          {kind === "SPONSORED_PRODUCT" && (
            <div className="space-y-2">
              <label className="text-xs text-white/40">محصول</label>
              <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan/40">
                <option value="" className="bg-white dark:bg-obsidian">انتخاب کنید</option>
                {data.products.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-obsidian">{p.name}</option>
                ))}
              </select>
            </div>
          )}
          {kind === "CATEGORY_SPONSOR" && (
            <div className="space-y-2">
              <label className="text-xs text-white/40">دسته‌بندی</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan/40">
                <option value="" className="bg-white dark:bg-obsidian">انتخاب کنید</option>
                {data.categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-obsidian">{c.name}</option>
                ))}
              </select>
            </div>
          )}
          {kind === "SPONSORED_SEARCH" && (
            <>
              <div className="space-y-2">
                <label className="text-xs text-white/40">کلیدواژه</label>
                <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="مثلاً سایت فروشگاهی" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-white/40">پیشنهاد هر کلیک (تومان)</label>
                <Input value={bid} onChange={(e) => setBid(e.target.value)} type="number" dir="ltr" placeholder="15000" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-white/40">سایت مقصد (اختیاری)</label>
                <select value={websiteId} onChange={(e) => setWebsiteId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan/40">
                  <option value="" className="bg-white dark:bg-obsidian">بدون سایت خاص</option>
                  {data.websites.map((w) => (
                    <option key={w.id} value={w.id} className="bg-white dark:bg-obsidian">{w.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          {kind === "DISPLAY" && (
            <>
              <div className="space-y-2">
                <label className="text-xs text-white/40">جایگاه نمایش</label>
                <select value={placementId} onChange={(e) => setPlacementId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan/40">
                  <option value="" className="bg-white dark:bg-obsidian">انتخاب کنید</option>
                  {data.placements.map((p) => (
                    <option key={p.id} value={p.key} className="bg-white dark:bg-obsidian">{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-white/40">فایل بنر (PNG/JPG/WebP/GIF تا ۲ مگ)</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(e) => onUpload(e.target.files?.[0])}
                  className="w-full text-xs text-white/60 file:bg-cyan file:text-obsidian file:border-0 file:rounded-lg file:px-4 file:py-2 file:text-xs file:font-bold file:ml-3"
                />
                {uploading && <p className="text-[11px] text-white/40">در حال آپلود...</p>}
                {fileUrl && <p className="text-[11px] text-cyan">آپلود شد ✓</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs text-white/40">لینک مقصد کلیک</label>
                <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} dir="ltr" placeholder="https://..." />
              </div>
            </>
          )}
          <div className="space-y-2">
            <label className="text-xs text-white/40">بودجه کل (تومان)</label>
            <Input value={budget} onChange={(e) => setBudget(e.target.value)} type="number" dir="ltr" placeholder="5000000" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs text-white/40">شروع (اختیاری)</label>
              <Input value={startsAt} onChange={(e) => setStartsAt(e.target.value)} type="date" dir="ltr" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/40">پایان (اختیاری)</label>
              <Input value={endsAt} onChange={(e) => setEndsAt(e.target.value)} type="date" dir="ltr" />
            </div>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep(2)}><ArrowRight size={14} /></Button>
            <Button onClick={goPreview} disabled={busy} className="flex-1">
              {busy ? "..." : "پیش‌نمایش"}
            </Button>
          </div>
        </Card>
      )}

      {step === 4 && (
        <Card className="p-6 space-y-4">
          <div className="text-base font-bold text-white mb-2">پیش‌نمایش و ثبت</div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-white/40">عنوان</span><span className="text-white font-bold">{title}</span></div>
            <div className="flex justify-between"><span className="text-white/40">نوع</span><span className="text-white">{KINDS.find((k) => k.value === kind)?.label}</span></div>
            {quote !== null && (
              <div className="flex justify-between"><span className="text-white/40">برآورد هر واحد</span><span className="text-cyan font-jakarta font-bold">{formatToman(quote)}</span></div>
            )}
            <div className="flex justify-between"><span className="text-white/40">بودجه</span><span className="text-white font-jakarta font-bold">{formatToman(parseInt(budget || "0", 10))}</span></div>
          </div>
          {kind === "DISPLAY" && fileUrl && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-white/40">پیش‌نمایش دسکتاپ</div>
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <div className="flex items-center gap-1.5 px-3 py-2 bg-white/5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-gold/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan/70" />
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fileUrl} alt="پیش‌نمایش بنر" className="w-full h-auto" />
              </div>
              <div className="text-xs font-bold text-white/40">پیش‌نمایش موبایل</div>
              <div className="w-44 mx-auto rounded-2xl border border-white/10 overflow-hidden">
                <div className="px-3 py-2 bg-white/5 text-center text-[10px] text-white/30">موبایل</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fileUrl} alt="پیش‌نمایش بنر موبایل" className="w-full h-auto" />
              </div>
            </div>
          )}
          <p className="text-[11px] text-white/30 leading-relaxed">
            پس از ثبت، کمپین بررسی و سپس مراحل قرارداد و پرداخت اعلام می‌شود. قیمت نهایی پس از تأیید مشخص می‌گردد.
          </p>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep(3)}><ArrowRight size={14} /></Button>
            <Button onClick={onSubmit} disabled={busy} className="flex-1">
              {busy ? "در حال ثبت..." : "ثبت کمپین"}
              <ArrowLeft size={14} />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
