import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone, ArrowLeft, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatToman } from "@/lib/format";
import { listActivePlacements, getActivePricingRules } from "@/lib/data/ads";
import { getAvailability } from "@/lib/data/ads-engine";
import { listPackagesPublic, listServicesPublic, buyPackage, buyService, getCreditOffer, getCreditBalance } from "@/lib/data/ads-shop";
import { logEvent } from "@/lib/analytics";
import CreditForm from "@/components/advertise/CreditForm";

export const metadata: Metadata = {
  title: "تبلیغات در لیان دیزاین",
  description: "کمپین تبلیغاتی بسازید: نمایش در مارکت‌پلیس، جستجوی اسپانسری و اسپانسرشیپ دسته",
};

function currentPeriod() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const PRODUCTS = [
  { title: "سایت اسپانسری", desc: "سایت شما بالای لیست مارکت‌پلیس با لیبل تبلیغاتی" },
  { title: "جستجوی اسپانسری", desc: "با کلیدواژه و پیشنهاد CPC بالای نتایج جستجو" },
  { title: "اسپانسرشیپ دسته", desc: "بنر اختصاصی بالای صفحه دسته‌بندی" },
  { title: "محصول اسپانسری", desc: "محصول شما بالای فروشگاه دیجیتال" },
];

export default async function AdvertisePage() {
  const [placements, rules, packages, services, offer, balance] = await Promise.all([
    listActivePlacements(),
    getActivePricingRules(),
    listPackagesPublic(),
    listServicesPublic(),
    getCreditOffer(),
    getCreditBalance(),
  ]);
  const period = currentPeriod();
  const availability = await Promise.all(placements.map((p) => getAvailability(p.key, period)));
  const cpm = rules.find((r) => r.key === "base_cpm")?.value;
  const cpc = rules.find((r) => r.key === "base_cpc")?.value;
  if (packages.length > 0) await logEvent("package_view", { count: packages.length });

  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-cyan tracking-widest uppercase mb-3">
            <Megaphone size={14} />
            تبلیغات
          </span>
          <h1 className="text-4xl md:text-5xl font-lalezar text-gray-900 dark:text-white mb-4">کسب‌وکارتان را جلوی خریداران بگذارید</h1>
          <p className="text-sm text-gray-500 dark:text-white/40 max-w-xl mx-auto leading-relaxed">
            کمپین بسازید، بودجه تعیین کنید و در مارکت‌پلیس لیان دیزاین دیده شوید.
            {cpm ? ` CPM پایه از ${formatToman(cpm)}` : ""}{cpc ? ` — CPC پایه از ${formatToman(cpc)}` : ""}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link
              href="/advertise/new"
              className="inline-flex items-center gap-2 bg-cyan text-obsidian px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
            >
              ساخت کمپین
              <ArrowLeft size={16} />
            </Link>
            <Link
              href="/advertise/dashboard"
              className="inline-flex items-center gap-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-6 py-3 rounded-xl text-sm font-bold hover:border-cyan/30 transition-colors"
            >
              کمپین‌های من
            </Link>
            <Link
              href="/advertise/custom"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-gray-500 dark:text-white/50 hover:text-cyan transition-colors"
            >
              درخواست کمپین سفارشی
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {PRODUCTS.map((p) => (
            <Card key={p.title} className="p-5">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle size={15} className="text-cyan mt-0.5 shrink-0" />
                <div className="text-sm font-bold text-gray-900 dark:text-white">{p.title}</div>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-white/40 leading-relaxed">{p.desc}</p>
            </Card>
          ))}
        </div>

        {packages.length > 0 && (
          <div id="packages" className="mb-12">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white text-center mb-2">پکیج‌های کمپین</h2>
            <p className="text-xs text-gray-500 dark:text-white/40 text-center mb-6">یک پکیج بخرید — کمپین آماده برایتان ساخته می‌شود</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.map((p) => (
                <Card key={p.id} className="p-5 flex flex-col">
                  <div className="text-base font-bold text-gray-900 dark:text-white mb-1">{p.name}</div>
                  <p className="text-[11px] text-gray-500 dark:text-white/40 leading-relaxed mb-3">{p.description}</p>
                  <div className="text-lg font-bold text-cyan font-jakarta mb-4">{formatToman(p.price)}</div>
                  <form action={buyPackage.bind(null, p.slug)} className="mt-auto">
                    <button type="submit" className="w-full bg-cyan text-obsidian px-4 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity">
                      خرید پکیج
                    </button>
                  </form>
                </Card>
              ))}
            </div>
          </div>
        )}

        {services.length > 0 && (
          <div id="services" className="mb-12">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white text-center mb-2">سرویس‌های تبلیغاتی</h2>
            <p className="text-xs text-gray-500 dark:text-white/40 text-center mb-6">طراحی و اجرا را به ما بسپارید</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {services.map((s) => (
                <Card key={s.id} className="p-5 flex flex-col">
                  <div className="text-base font-bold text-gray-900 dark:text-white mb-1">{s.name}</div>
                  <p className="text-[11px] text-gray-500 dark:text-white/40 leading-relaxed mb-3">{s.description}</p>
                  <div className="text-lg font-bold text-gold font-jakarta mb-4">{formatToman(s.price)}</div>
                  <form action={buyService.bind(null, s.slug)} className="mt-auto">
                    <button type="submit" className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:border-cyan/30 transition-colors">
                      سفارش سرویس
                    </button>
                  </form>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Card className="p-6 mb-12">
          <div className="text-base font-bold text-gray-900 dark:text-white mb-1">اعتبار تبلیغات (کردیت)</div>
          <p className="text-[11px] text-gray-500 dark:text-white/40 leading-relaxed mb-4">
            شارژ کنید و بعداً خرج کنید. خرید بالای {formatToman(offer.threshold)} شامل {offer.percent.toLocaleString("fa-IR")}٪ بونوس می‌شود. انقضا: یک سال.
            {balance > 0 && <> موجودی شما: <span className="text-cyan font-jakarta font-bold">{formatToman(balance)}</span></>}
          </p>
          <CreditForm min={offer.min} />
        </Card>

        <Card className="p-6">
          <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">ظرفیت این دوره ({period})</div>
          <p className="text-[11px] text-gray-400 dark:text-white/30 mb-4">موجودی به‌روز هر جایگاه تبلیغاتی</p>
          <div className="space-y-2">
            {placements.map((p, i) => {
              const a = availability[i];
              return (
                <div key={p.id} className="flex justify-between text-sm bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5">
                  <span className="text-gray-500 dark:text-white/60">{p.name}</span>
                  <span className="text-gray-900 dark:text-white font-jakarta">
                    {a ? `${a.remaining.toLocaleString("fa-IR")} / ${a.capacity.toLocaleString("fa-IR")}` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </section>
  );
}
