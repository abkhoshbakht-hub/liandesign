import type { Metadata } from "next";
import Link from "next/link";
import { Eye, RefreshCw, ShieldCheck } from "lucide-react";
import AdSlot from "@/components/ads/AdSlot";
import ReferralBanner from "@/components/website/ReferralBanner";
import { getViewer } from "@/lib/ads/viewer";
import { doctorSiteService } from "@/services/doctor-site/service";

export const metadata: Metadata = {
  title: "نمونه کارها",
  description: "نمونه‌کارها و سایت‌های آماده لیان دیزاین — پروژه‌های موفق و کاتالوگ سایت",
};

const CATEGORY_ICONS: Record<string, string> = {
  "فروشگاهی": "🛒",
  "شرکتی": "🏢",
  "رستورانی": "🍽️",
  "پزشکی": "🏥",
  "پورتفولیو": "🎨",
  "نرم‌افزاری": "💻",
  "آژانس": "🎯",
  "سامانه": "🗞️",
  "گردشگری": "✈️",
};

// ── نمونه‌کارها: پروژه‌های اخیر (طراحی‌شده توسط لیان‌دیزاین) ──
// delivered: پروژه تحویل‌شده به مشتری — قابل سفارش نسخه مشابه با برند جدید
type PortfolioProject = {
  id: number;
  title: string;
  category: string;
  framework: string;
  speed: string;
  lighthouse: number;
  price: string;
  hours: string;
  href: string;
  demoNote?: string;
  image: string;
  delivered: boolean;
};

const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  { id: 1, title: "شرکت آریاتک", category: "شرکتی", framework: "HTML/CSS/JS", speed: "0.6s", lighthouse: 100, price: "۹ میلیون", hours: "۴۰ تا ۶۰ ساعت", href: "#", demoNote: "این پروژه به‌صورت قالب فروشی ارائه می‌شود — دموی زنده ارائه نمی‌شود", image: "/previews/thumbs/ariatech.png", delivered: false },
  { id: 2, title: "بامارکت", category: "فروشگاهی", framework: "React 19 + Vite", speed: "0.9s", lighthouse: 100, price: "۱۴ میلیون", hours: "۹۰ تا ۱۳۰ ساعت", href: "/previews/baamarket-demo.html", image: "/previews/thumbs/baamarket.png", delivered: false },
  { id: 3, title: "لیان", category: "رستورانی", framework: "React 19 + Vite", speed: "0.8s", lighthouse: 100, price: "۱۲ میلیون", hours: "۷۰ تا ۱۰۰ ساعت", href: "/previews/lian-demo.html", image: "/previews/thumbs/lian.png", delivered: false },
  { id: 4, title: "درمانیکا", category: "پزشکی", framework: "React 19 + Vite", speed: "0.8s", lighthouse: 100, price: "۱۲ میلیون", hours: "۸۰ تا ۱۱۰ ساعت", href: "/previews/darmanika-demo.html", image: "/previews/thumbs/darmanika.png", delivered: false },
  { id: 5, title: "گالری امیر", category: "پورتفولیو", framework: "HTML/CSS/JS", speed: "0.5s", lighthouse: 100, price: "۹ میلیون", hours: "۳۰ تا ۵۰ ساعت", href: "#", demoNote: "این پروژه به‌صورت قالب فروشی ارائه می‌شود — دموی زنده ارائه نمی‌شود", image: "/previews/thumbs/gallery-amir.png", delivered: false },
  { id: 6, title: "آرایه مدرن", category: "شرکتی", framework: "Next.js 15 + React 19", speed: "0.7s", lighthouse: 100, price: "۱۶ میلیون", hours: "۹۰ تا ۱۴۰ ساعت", href: "/previews/arayemodern-demo.html", image: "/previews/thumbs/arayemodern.png", delivered: true },
];

// ── سایت‌های آماده: قابل خرید و شخصی‌سازی برای مشتری ──
const READY_SITES = [
  {
    id: 1,
    title: "TIDAMAX",
    category: "فروشگاهی",
    framework: "PHP + WordPress",
    summary: "فروشگاه اینترنتی با سبد خرید، درگاه پرداخت، فاکتور و بارکد — کاملاً فارسی و راست‌چین.",
    price: "۳۲.۵ میلیون تومان",
    hours: "۹۰ تا ۱۴۰ ساعت",
    href: "/portfolio/tidamax",
    image: "/previews/thumbs/tidamax.png",
    delivered: true,
  },
  {
    id: 2,
    title: "پلتفرم‌یار",
    category: "نرم‌افزاری",
    framework: "Next.js 15 + React 19",
    summary: "لندینگ SaaS با ۹ کامپوننت اختصاصی، فرم تماس و بخش تعرفه — مناسب ارائه محصول نرم‌افزاری.",
    price: "۱۱ میلیون تومان",
    hours: "۵۰ تا ۷۰ ساعت",
    href: "/previews/platformyar-demo.html",
    image: "/previews/thumbs/platformyar.png",
  },
  {
    id: 3,
    title: "کریتیوا",
    category: "آژانس",
    framework: "Next.js 15 + React 19",
    summary: "لندینگ آژانس دیجیتال با حالت تیره و روشن، گالری کار و بخش نظرات — مناسب شرکت‌های خدماتی.",
    price: "۱۰.۵ میلیون تومان",
    hours: "۵۰ تا ۷۰ ساعت",
    href: "/previews/creativo-demo.html",
    image: "/previews/thumbs/creativo.png",
  },
  {
    id: 4,
    title: "نوسفر",
    category: "آژانس",
    framework: "React 19 + Vite",
    summary: "وب‌سایت چندزبانه آژانس با صفحات خدمات، نمونه‌کار، درباره ما و تماس — مناسب شرکت‌های بین‌المللی.",
    price: "۱۰.۵ میلیون تومان",
    hours: "۷۰ تا ۱۰۰ ساعت",
    href: "/previews/novasphere-demo.html",
    image: "/previews/thumbs/novasphere.png",
  },
  {
    id: 5,
    title: "رها",
    category: "نرم‌افزاری",
    framework: "PHP + WordPress",
    summary: "نرم‌افزار حسابداری با قیمت‌گذاری، بیشنهاد هوشمند و پنل کاربری — مناسب کسب‌وکارهای نرم‌افزاری.",
    price: "۱۳.۵ میلیون تومان",
    hours: "۶۰ تا ۹۰ ساعت",
    href: "/previews/roha/index.html",
    image: "/previews/thumbs/roha.png",
  },
  {
    id: 6,
    title: "FreeZone",
    category: "سامانه",
    framework: "React 19 + Vite",
    summary: "پورتال خبری با دسته‌بندی، جستجو، تاریخ شمسی و حالت تیره — مناسب سازمان‌ها و شهرداری‌ها.",
    price: "۲۸ میلیون تومان",
    hours: "۱۲۰ تا ۱۸۰ ساعت",
    href: "/previews/freezone-demo.html",
    image: "/previews/thumbs/freezone.png",
    delivered: true,
  },
];

export default async function WebsitesPage({
  searchParams,
}: {
  searchParams: { source?: string; campaign?: string };
}) {
  const viewer = getViewer(null);

  if (searchParams.source) {
    await doctorSiteService.logInbound({ source: searchParams.source, campaign: searchParams.campaign });
  }

  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">لیان دیزاین</span>
          <h1 className="text-4xl md:text-5xl font-lalezar text-gray-900 dark:text-white mb-4">نمونه کارها و سایت‌های آماده</h1>
          <p className="text-sm text-gray-500 dark:text-white/40">پروژه‌های انجام‌شده و قالب‌های آماده برای سفارش</p>
        </div>

        {/* ── بخش نمونه‌کارها ── */}
        <div className="mb-16">
<div className="text-center mb-8">
            <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-2 block">نمونه‌کارها</span>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">پروژه‌های اخیر ما</h2>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-1">سایت‌هایی که برای مشتریان طراحی و اجرا کرده‌ایم</p>
          </div>
          <div className="flex items-center justify-center gap-2 mb-8 text-[11px] text-gray-500 dark:text-white/40">
            <ShieldCheck size={14} className="text-cyan" />
            <span>تمام سایت‌های لیان‌دیزاین با <strong className="text-cyan">یک ماه پشتیبانی رایگان</strong> تحویل می‌شوند</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PORTFOLIO_PROJECTS.map((project) => (
              <div key={project.id} className="group glass-card overflow-hidden">
<div className="relative h-64 bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                  {project.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-4xl opacity-20 group-hover:opacity-40 transition-opacity">{CATEGORY_ICONS[project.category] ?? "💼"}</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    {project.href !== "#" ? (
                      <a
                        href={project.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-cyan text-obsidian py-2.5 rounded-lg text-xs font-bold text-center hover:bg-cyan/90 transition-colors"
                      >
                        <Eye size={13} className="inline ml-1" />
                        مشاهده زنده
                      </a>
                    ) : (
<span className="block w-full bg-gray-200/80 dark:bg-white/10 text-gray-500 dark:text-white/50 py-2.5 px-2 rounded-lg text-[11px] font-bold text-center cursor-not-allowed leading-5">
                        {project.demoNote ?? "به‌زودی منتشر می‌شود"}
                      </span>
                    )}
                  </div>
                </div>
<div className="p-5">
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-bold">{project.category}</span>
                    <span className="text-[10px] bg-cyan/10 text-cyan px-2 py-0.5 rounded-full">{project.framework}</span>
                    {project.delivered && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                        ✓ تحویل‌شده
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 group-hover:text-cyan transition-colors">{project.title}</h3>
                  <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-gray-100 dark:border-white/5">
                    <div>
                      <div className="text-[9px] text-gray-400 dark:text-white/30 mb-0.5">شروع قیمت</div>
                      <div className="text-xs font-bold text-cyan">{project.price}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-[9px] text-gray-400 dark:text-white/30 mb-0.5">زمان اجرا</div>
                      <div className="text-[11px] text-gray-600 dark:text-white/60 font-medium">{project.hours}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-gray-500 dark:text-white/40">
                    <span>⚡ {project.speed}</span>
                    <span>🎯 Lighthouse {project.lighthouse}</span>
                    <span>🛡 ۱ ماه پشتیبانی</span>
                  </div>
                  {project.delivered && (
                    <a
                      href="/contact"
                      className="mt-3 flex items-center justify-center gap-1.5 w-full border border-cyan/40 text-cyan py-2 rounded-lg text-[11px] font-bold hover:bg-cyan/10 transition-colors"
                    >
                      <RefreshCw size={12} />
                      سفارش نسخه مشابه با برند شما
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── بخش سایت‌های آماده ── */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">سایت‌های آماده</h2>
          <p className="text-xs text-gray-500 dark:text-white/40 mt-1">پیدا کنید، ببینید، شخصی‌سازی کنید و بخرید</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {READY_SITES.map((site) => (
            <div key={site.id} className="group glass-card overflow-hidden flex flex-col">
              <div className="relative h-60 bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                {site.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={site.image}
                    alt={site.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="text-4xl opacity-20">{CATEGORY_ICONS[site.category] ?? "💼"}</span>
                )}
<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                  <span className="text-[10px] bg-cyan text-obsidian px-2.5 py-1 rounded-full font-bold">
                    قابل سفارشی‌سازی
                  </span>
                  <span className="text-[10px] bg-emerald-500/90 text-white px-2.5 py-1 rounded-full font-bold">
                    ۱ ماه پشتیبانی رایگان
                  </span>
                  {site.delivered && (
                    <span className="text-[10px] bg-white/90 text-gray-700 px-2.5 py-1 rounded-full font-bold">
                      ✓ تحویل‌شده به مشتری
                    </span>
                  )}
                </div>
<div className="absolute bottom-4 left-4 right-4 space-y-1.5">
                  {site.delivered ? (
                    <>
                      <a
                        href={site.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-white/15 backdrop-blur text-white py-2.5 rounded-lg text-xs font-bold text-center hover:bg-white/25 transition-colors"
                      >
                        <Eye size={13} className="inline ml-1" />
                        مشاهده نمونه
                      </a>
                      <a
                        href="/contact"
                        className="block w-full bg-cyan text-obsidian py-2.5 rounded-lg text-xs font-bold text-center hover:bg-cyan/90 transition-colors"
                      >
                        <RefreshCw size={13} className="inline ml-1" />
                        سفارش نسخه مشابه با برند شما
                      </a>
                    </>
                  ) : (
                    <a
                      href={site.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-cyan text-obsidian py-2.5 rounded-lg text-xs font-bold text-center hover:bg-cyan/90 transition-colors"
                    >
                      <Eye size={13} className="inline ml-1" />
                      پیش‌نمایش زنده
                    </a>
                  )}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-bold">{site.category}</span>
                  <span className="text-[10px] bg-cyan/10 text-cyan px-2 py-0.5 rounded-full">{site.framework}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 group-hover:text-cyan transition-colors">
                  {site.title}
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-white/40 leading-relaxed mb-4 flex-1">
                  {site.summary}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
                  <span className="text-xs text-gray-500 dark:text-white/40">از {site.price}</span>
                  <span className="text-[10px] text-gray-400 dark:text-white/30">⏱ {site.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <ReferralBanner />

        <AdSlot placement="marketplace.top" viewer={viewer} className="max-w-3xl mx-auto mb-10" />
      </div>
    </section>
  );
}
