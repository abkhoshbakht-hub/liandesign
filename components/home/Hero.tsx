import Link from "next/link";
import { Search, ArrowLeft, Sparkles, Gauge, BadgeCheck, ShoppingBag, CheckCircle, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatToman } from "@/lib/format";
import { getPublishedWebsiteCount } from "@/lib/data/websites";

export default async function Hero() {
  const [websitesCount, productsCount, ordersCount, reviewsCount, minPrice] = await Promise.all([
    getPublishedWebsiteCount(),
    db.product.count({ where: { status: "PUBLISHED" } }),
    db.order.count({ where: { status: "PAID" } }),
    db.review.count({ where: { status: "APPROVED" } }),
    db.website.aggregate({ where: { status: "PUBLISHED" }, _min: { basePrice: true } }),
  ]);

  const pkgInclude = { packages: { take: 3, orderBy: { price: "asc" as const } }, category: true };
  const site =
    (await db.website.findFirst({ where: { slug: "novin-shop", status: "PUBLISHED" }, include: pkgInclude })) ??
    (await db.website.findFirst({ where: { status: "PUBLISHED" }, include: pkgInclude, orderBy: { createdAt: "asc" } }));

  const stats = [
    { value: websitesCount.toLocaleString("fa-IR"), label: "سایت آماده" },
    { value: productsCount.toLocaleString("fa-IR"), label: "محصول دیجیتال" },
    { value: ordersCount.toLocaleString("fa-IR"), label: "سفارش موفق" },
    { value: reviewsCount.toLocaleString("fa-IR"), label: "نظر تأییدشده" },
  ];

  return (
    <section className="relative overflow-hidden bg-gray-50 dark:bg-obsidian">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-50/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-10 right-1/4 w-[350px] h-[350px] bg-gold/10 rounded-full blur-[110px]"></div>
      </div>

      <div className="container mx-auto px-6 py-28 relative z-10 text-center">
        <Badge className="mb-6 text-sm md:text-base px-5 py-2">
          <Sparkles size={15} className="ml-1.5" />
          طراحی سایت در سراسر ایران
        </Badge>

        <h1 className="text-4xl md:text-6xl font-lalezar text-gray-900 dark:text-white leading-[1.4] mb-6">
          <span
            className="block animate-slide-up"
            style={{ animationDelay: "0.4s", animationDuration: "1.4s", animationFillMode: "both" }}
          >
            اول ببین، بعد بخر
          </span>
          <span
            className="block gradient-text animate-slide-up"
            style={{ animationDelay: "1.6s", animationDuration: "1.4s", animationFillMode: "both" }}
          >
            ببین، بپسند، تحویل بگیر
          </span>
        </h1>

        <p className="text-sm md:text-base text-gray-500 dark:text-white/50 leading-relaxed mb-8 max-w-2xl mx-auto">
          از بین {websitesCount.toLocaleString("fa-IR")} سایت آماده با دموی زنده انتخاب کن، رنگ و صفحاتش را به
          سلیقه خودت تغییر بده و در سریع‌ترین زمان ممکن با فاکتور رسمی تحویل بگیر.
        </p>

        <form action="/websites" method="get" className="flex gap-2 max-w-xl mx-auto mb-4">
          <input
            name="q"
            placeholder="دنبال چه سایتی هستید؟ مثلاً فروشگاهی..."
            className="flex-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-cyan/40 focus:ring-2 focus:ring-cyan/20"
          />
          <button
            type="submit"
            className="flex items-center gap-2 bg-cyan text-obsidian px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shrink-0"
          >
            <Search size={16} />
            جستجو
          </button>
        </form>

        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <Link
            href="/websites"
            className="inline-flex items-center gap-2 bg-cyan text-obsidian px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
          >
            مشاهده سایت‌های آماده
            <ArrowLeft size={16} />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-6 py-3 rounded-xl text-sm font-bold hover:border-cyan/30 transition-colors"
          >
            <Phone size={16} />
            مشاوره رایگان
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-10">
          {["دموی زنده قبل از خرید", "قیمت شفاف", "فاکتور رسمی"].map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-white/60">
              <CheckCircle size={14} className="text-cyan" />
              {t}
            </span>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-16 text-right">
          {[
            { n: "۱", t: "انتخاب", d: "سایت آماده را با دموی زنده ببین" },
            { n: "۲", t: "شخصی‌سازی", d: "رنگ، فونت و صفحات به سلیقه تو" },
            { n: "۳", t: "تحویل", d: "سریع، با فاکتور رسمی و پشتیبانی" },
          ].map((s) => (
            <div key={s.n} className="glass-card p-4 flex items-start gap-3">
              <span className="w-8 h-8 shrink-0 rounded-full bg-cyan text-obsidian text-sm font-extrabold flex items-center justify-center">
                {s.n}
              </span>
              <span>
                <span className="block text-sm font-bold text-gray-900 dark:text-white">{s.t}</span>
                <span className="block text-[11px] text-gray-500 dark:text-white/40 mt-1 leading-relaxed">{s.d}</span>
              </span>
            </div>
          ))}
        </div>

        {/* ── موکاپ مرورگر ── */}
        <div className="relative max-w-3xl mx-auto">
          <div className="glass-card overflow-hidden text-right">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-white/10">
              <span className="w-3 h-3 rounded-full bg-red-400/70" />
              <span className="w-3 h-3 rounded-full bg-gold/70" />
              <span className="w-3 h-3 rounded-full bg-cyan/70" />
              <span className="mr-3 flex-1 bg-gray-100 dark:bg-white/5 rounded-lg px-3 py-1 text-[11px] text-gray-400 dark:text-white/30 font-jakarta" dir="ltr">
                liandesign.ir/websites/{site?.slug ?? "novin-shop"}
              </span>
            </div>
            {site ? (
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan to-gold flex items-center justify-center text-obsidian text-xs font-extrabold">
                      {site.name.slice(0, 1)}
                    </span>
                    <span className="text-sm font-extrabold text-gray-900 dark:text-white">{site.name}</span>
                    <span className="text-[10px] text-gray-500 dark:text-white/40">{site.category.name}</span>
                  </div>
                  <span className="bg-cyan text-obsidian text-[11px] font-bold px-4 py-1.5 rounded-lg">
                    خرید
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white leading-relaxed">{site.name}</div>
                  {site.description && (
                    <p className="text-[11px] md:text-xs text-gray-500 dark:text-white/50 leading-relaxed max-w-md">
                      {site.description.slice(0, 100)}
                    </p>
                  )}
                  <div className="h-2 w-40 rounded-full bg-gradient-to-l from-cyan to-gold/60" />
                </div>
                {site.packages.length > 0 && (
                  <div className="grid sm:grid-cols-3 gap-3 pt-1">
                    {site.packages.map((p, i) => (
                      <div
                        key={p.id}
                        className={`relative rounded-xl border p-3 space-y-1.5 ${
                          i === 0 ? "border-cyan/50 bg-cyan/5" : "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10"
                        }`}
                      >
                        {i === 0 && (
                          <span className="absolute -top-2.5 right-3 bg-cyan text-obsidian text-[9px] font-bold px-2 py-0.5 rounded-full">
                            اقتصادی‌ترین
                          </span>
                        )}
                        <div className="text-xs font-bold text-gray-900 dark:text-white">{p.name}</div>
                        <div className="text-[10px] text-gray-500 dark:text-white/40">
                          {p.features.length.toLocaleString("fa-IR")} امکان
                        </div>
                        <div className="text-xs font-extrabold text-cyan font-jakarta">{formatToman(p.price)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-xs text-gray-500 dark:text-white/40 text-center">به‌زودی سایت‌های آماده اینجا نمایش داده می‌شوند.</div>
            )}
          </div>

          <Card className="absolute -right-4 md:-right-10 top-16 p-3 flex items-center gap-2 animate-float">
            <Gauge size={18} className="text-cyan" />
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900 dark:text-white font-jakarta">۱۰۰</div>
              <div className="text-[10px] text-gray-500 dark:text-white/40">نمره PageSpeed</div>
            </div>
          </Card>
          <Card className="absolute -left-4 md:-left-10 bottom-16 p-3 flex items-center gap-2 animate-float">
            <ShoppingBag size={18} className="text-gold" />
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900 dark:text-white font-jakarta">
                {minPrice._min.basePrice ? formatToman(minPrice._min.basePrice) : "—"}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-white/40">قیمت از</div>
            </div>
          </Card>
          <Card className="absolute right-8 -bottom-5 px-3 py-2 flex items-center gap-2">
            <BadgeCheck size={16} className="text-cyan" />
            <span className="text-[11px] font-bold text-gray-900 dark:text-white">خرید تأییدشده با فاکتور رسمی</span>
          </Card>
        </div>

        {/* ── نوار آمار ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-16">
          {stats.map((s) => (
            <div key={s.label} className="glass-card p-5">
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white font-jakarta">{s.value}</div>
              <div className="text-[11px] text-gray-500 dark:text-white/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
