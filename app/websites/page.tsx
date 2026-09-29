import type { Metadata } from "next";
import Link from "next/link";
import { Eye } from "lucide-react";
import WebsiteCard from "@/components/website/WebsiteCard";
import AdSlot from "@/components/ads/AdSlot";
import WebsiteFilters from "@/components/website/WebsiteFilters";
import ReferralBanner from "@/components/website/ReferralBanner";
import { getCategories, getWebsites, type WebsiteSort } from "@/lib/data/websites";
import { getSponsoredWebsites, getSponsoredSearch } from "@/lib/data/ads-engine";
import { logSponsoredViews } from "@/lib/data/ads-track";
import { getViewer } from "@/lib/ads/viewer";
import { logEvent } from "@/lib/analytics";
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

const PORTFOLIO_PROJECTS = [
  { id: 1, title: "شرکت آریاتک", category: "شرکتی", framework: "HTML/CSS/JS", speed: "0.6s", lighthouse: 100, href: "/previews/ariatech/index.html", image: "/previews/thumbs/ariatech.png" },
  { id: 2, title: "بامارکت", category: "فروشگاهی", framework: "React 19 + Vite", speed: "0.9s", lighthouse: 100, href: "/previews/baamarket-demo.html", image: "/previews/thumbs/baamarket.png" },
  { id: 3, title: "لیان", category: "رستورانی", framework: "React 19 + Vite", speed: "0.8s", lighthouse: 100, href: "/previews/lian-demo.html", image: "/previews/thumbs/lian.png" },
  { id: 4, title: "درمانیکا", category: "پزشکی", framework: "React 19 + Vite", speed: "0.8s", lighthouse: 100, href: "/previews/darmanika-demo.html", image: "/previews/thumbs/darmanika.png" },
  { id: 5, title: "گالری امیر", category: "پورتفولیو", framework: "HTML/CSS/JS", speed: "0.5s", lighthouse: 100, href: "/previews/gallery-amir/index.html", image: "/previews/thumbs/gallery-amir.png" },
  { id: 6, title: "پلتفرم‌یار", category: "نرم‌افزاری", framework: "Next.js 15 + React 19", speed: "0.7s", lighthouse: 100, href: "/previews/platformyar-demo.html", image: "/previews/thumbs/platformyar.png" },
  { id: 7, title: "کریتیوا", category: "آژانس", framework: "Next.js 15 + React 19", speed: "0.7s", lighthouse: 100, href: "/previews/creativo-demo.html", image: "/previews/thumbs/creativo.png" },
  { id: 8, title: "نوسفر", category: "آژانس", framework: "React 19 + Vite", speed: "0.8s", lighthouse: 100, href: "/previews/novasphere-demo.html", image: "/previews/thumbs/novasphere.png" },
  { id: 9, title: "رها", category: "نرم‌افزاری", framework: "PHP + WordPress", speed: "0.6s", lighthouse: 100, href: "/previews/roha/index.html", image: "/previews/thumbs/roha.png" },
  { id: 10, title: "FreeZone", category: "سامانه", framework: "React 19 + Vite", speed: "0.8s", lighthouse: 100, href: "/previews/freezone-demo.html", image: "/previews/thumbs/freezone.png" },
  { id: 11, title: "TIDAMAX", category: "فروشگاهی", framework: "PHP + WordPress", speed: "0.7s", lighthouse: 100, href: "/portfolio/tidamax", image: "/previews/thumbs/tidamax.png" },
];

const SORTS: WebsiteSort[] = ["newest", "popular", "price-asc", "price-desc"];

export default async function WebsitesPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; sort?: string; source?: string; campaign?: string };
}) {
  const sort: WebsiteSort = SORTS.includes((searchParams.sort ?? "") as WebsiteSort)
    ? (searchParams.sort as WebsiteSort)
    : "newest";

  const q = searchParams.q?.trim() || undefined;
  const categories = await getCategories();
  const categoryId = searchParams.category
    ? (categories.find((c) => c.slug === searchParams.category)?.id ?? null)
    : null;
  const viewer = getViewer(categoryId);
  const [websites, sponsored, sponsoredSearch] = await Promise.all([
    getWebsites({ q, category: searchParams.category || undefined, sort }),
    q ? Promise.resolve([]) : getSponsoredWebsites({ limit: 2, viewer }),
    q ? getSponsoredSearch(q, "website", 2, viewer) : Promise.resolve([]),
  ]);
  const searchHits = sponsoredSearch
    .filter((i) => !!i.website)
    .map((i) => ({ website: i.website!, itemId: i.id, campaignId: i.campaignId, placementId: i.placementId }));
  await logSponsoredViews([
    ...sponsored.map((s) => ({ campaignId: s.campaignId, placementKey: s.placementId })),
    ...searchHits.map((s) => ({ campaignId: s.campaignId, placementKey: s.placementId })),
  ]);

  if (searchParams.source) {
    await doctorSiteService.logInbound({ source: searchParams.source, campaign: searchParams.campaign });
  }
  if (searchParams.q?.trim()) {
    await logEvent("search", { q: searchParams.q.trim() });
  }

  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">لیان دیزاین</span>
          <h1 className="text-4xl md:text-5xl font-lalezar text-gray-900 dark:text-white mb-4">نمونه کارها</h1>
          <p className="text-sm text-gray-500 dark:text-white/40">پروژه‌های موفق و سایت‌های آماده — ببینید، انتخاب کنید، بخرید</p>
        </div>

        {/* ── بخش نمونه‌کارها ── */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">پروژه‌های اخیر ما</h2>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-1">نمونه‌هایی از پروژه‌های موفق لیان دیزاین</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PORTFOLIO_PROJECTS.map((project) => (
              <div key={project.id} className="group glass-card overflow-hidden">
                <div className="relative h-48 bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                  {project.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                      <span className="block w-full bg-gray-200/80 dark:bg-white/10 text-gray-500 dark:text-white/50 py-2.5 rounded-lg text-xs font-bold text-center cursor-not-allowed">
                        به‌زودی منتشر می‌شود
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-bold">{project.category}</span>
                    <span className="text-[10px] bg-cyan/10 text-cyan px-2 py-0.5 rounded-full">{project.framework}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 group-hover:text-cyan transition-colors">{project.title}</h3>
                  <div className="flex items-center gap-4 text-[10px] text-gray-500 dark:text-white/40">
                    <span>⚡ {project.speed}</span>
                    <span>🎯 Lighthouse {project.lighthouse}</span>
                  </div>
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

        <ReferralBanner />

        <AdSlot placement="marketplace.top" viewer={viewer} className="max-w-3xl mx-auto mb-10" />

        <div className="mb-10">
          <WebsiteFilters
            categories={categories}
            current={{ q: searchParams.q, category: searchParams.category, sort }}
          />
        </div>

        {searchHits.length > 0 && (
          <div className="mb-10">
            <p className="text-xs text-gold mb-4">نتایج تبلیغاتی</p>
            <div className="grid md:grid-cols-2 gap-6">
              {searchHits.map((s) => (
                <WebsiteCard key={`sp-${s.website.id}`} website={s.website} sponsored adItemId={s.itemId} />
              ))}
            </div>
          </div>
        )}

        {sponsored.length > 0 && (
          <div className="mb-10">
            <p className="text-xs text-gold mb-4">پیشنهادهای تبلیغاتی</p>
            <div className="grid md:grid-cols-2 gap-6">
              {sponsored.map((s) => (
                <WebsiteCard key={`sp-${s.website.id}`} website={s.website} sponsored adItemId={s.itemId} />
              ))}
            </div>
          </div>
        )}

        {websites.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-500 dark:text-white/50 text-sm">سایتی با این مشخصات پیدا نشد. جستجو را تغییر دهید.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 dark:text-white/30 mb-6">{websites.length.toLocaleString("fa-IR")} سایت پیدا شد</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {websites.map((w) => (
                <WebsiteCard key={w.id} website={w} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
