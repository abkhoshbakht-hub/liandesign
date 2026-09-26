import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import WebsiteCard from "@/components/website/WebsiteCard";
import AdSlot from "@/components/ads/AdSlot";
import { getCategories, getWebsites } from "@/lib/data/websites";
import { getCategorySponsorship, getSponsoredWebsites } from "@/lib/data/ads-engine";
import { logSponsoredViews } from "@/lib/data/ads-track";
import { getViewer } from "@/lib/ads/viewer";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === params.slug);
  return {
    title: category ? `سایت‌های ${category.name}` : "دسته‌بندی",
    description: category?.description ?? "سایت‌های آماده لیان دیزاین",
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === params.slug);
  if (!category) notFound();

  const viewer = getViewer(category.id);
  const [websites, sponsorship, sponsored] = await Promise.all([
    getWebsites({ category: params.slug, sort: "newest" }),
    getCategorySponsorship(category.id, viewer),
    getSponsoredWebsites({ categoryId: category.id, limit: 2, viewer }),
  ]);
  const sponsorHref = sponsorship
    ? `/api/ads/go?item=${sponsorship.id}&to=${encodeURIComponent(
        sponsorship.website ? `/websites/${sponsorship.website.slug}` : "/websites"
      )}`
    : "/websites";
  if (sponsorship || sponsored.length > 0) {
    await logSponsoredViews([
      ...(sponsorship ? [{ campaignId: sponsorship.campaignId, placementKey: sponsorship.placementId }] : []),
      ...sponsored.map((s) => ({ campaignId: s.campaignId, placementKey: s.placementId })),
    ]);
  }

  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6">
        <Link href="/websites" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 hover:text-cyan transition-colors mb-8">
          <ArrowRight size={14} />
          همه سایت‌ها
        </Link>
        <h1 className="text-4xl md:text-5xl font-lalezar text-gray-900 dark:text-white mb-4">سایت‌های {category.name}</h1>
        <p className="text-sm text-gray-500 dark:text-white/40 mb-10">{category.description}</p>

        <AdSlot placement="category.top" viewer={viewer} className="max-w-3xl mx-auto mb-10" />

        {sponsorship && (
          <Link
            href={sponsorHref}
            className="block glass-card p-5 mb-10 border-gold/40 hover:border-gold/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="bg-gold text-obsidian text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0">
                اسپانسر دسته
              </span>
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">{sponsorship.campaign.title}</div>
                {sponsorship.website && (
                  <div className="text-[11px] text-gray-500 dark:text-white/40 mt-1">{sponsorship.website.name}</div>
                )}
              </div>
            </div>
          </Link>
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
            <p className="text-gray-500 dark:text-white/50 text-sm">هنوز سایتی در این دسته منتشر نشده است.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websites.map((w) => (
              <WebsiteCard key={w.id} website={w} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
