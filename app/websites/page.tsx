import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Eye } from "lucide-react";
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

const PORTFOLIO_PROJECTS = [
  { id: 1, title: "فروشگاه نوین مارکت", category: "فروشگاهی", framework: "Next.js", speed: "1.1s", lighthouse: 100, href: "#" },
  { id: 2, title: "شرکت آریا تک", category: "شرکتی", framework: "Next.js", speed: "0.9s", lighthouse: 99, href: "#" },
  { id: 3, title: "هتل ساحلی بوشهر", category: "گردشگری", framework: "Next.js", speed: "1.0s", lighthouse: 100, href: "#" },
  { id: 4, title: "کلینیک زیبایی", category: "پزشکی", framework: "Next.js", speed: "0.8s", lighthouse: 100, href: "#" },
  { id: 5, title: "پورتفولیو طراح", category: "پورتفولیو", framework: "Next.js", speed: "0.7s", lighthouse: 100, href: "#" },
  { id: 6, title: "فروشگاه مد و پوشاک", category: "فروشگاهی", framework: "Next.js", speed: "1.2s", lighthouse: 98, href: "#" },
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
                <div className="relative h-48 bg-gradient-to-br from-cyan/10 to-cyan-50/10 flex items-center justify-center">
                  <span className="text-4xl opacity-20 group-hover:opacity-40 transition-opacity">{project.category === "فروشگاهی" ? "🛒" : project.category === "شرکتی" ? "🏢" : project.category === "گردشگری" ? "✈️" : project.category === "پزشکی" ? "🏥" : "💼"}</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                    <Link href={project.href} className="flex-1 bg-cyan text-obsidian py-2 rounded-lg text-xs font-bold text-center hover:bg-cyan/90 transition-colors">
                      <Eye size={12} className="inline ml-1" />
                      مشاهده
                    </Link>
                    <Link href={project.href} className="flex-1 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white py-2 rounded-lg text-xs font-bold text-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                      <ExternalLink size={12} className="inline ml-1" />
                      لینک سایت
                    </Link>
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
