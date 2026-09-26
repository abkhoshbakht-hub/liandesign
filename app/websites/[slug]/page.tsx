import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowRight, Check, Eye, Phone, SlidersHorizontal, Scale } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import WebsiteCard from "@/components/website/WebsiteCard";
import AdSlot from "@/components/ads/AdSlot";
import AddToCartButton from "@/components/checkout/AddToCartButton";
import DoctorCta from "@/components/doctor-site/DoctorCta";
import ReviewList from "@/components/reviews/ReviewList";
import ReviewForm from "@/components/reviews/ReviewForm";
import { getRelatedWebsites, getWebsiteBySlug } from "@/lib/data/websites";
import { formatToman } from "@/lib/format";
import { logEvent } from "@/lib/analytics";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const website = await getWebsiteBySlug(params.slug);
  if (!website) return { title: "سایت پیدا نشد" };
  return {
    title: website.name,
    description: website.description ?? `خرید سایت آماده ${website.name}`,
    openGraph: {
      title: `${website.name} | لیان دیزاین`,
      description: website.description ?? "",
      type: "website",
    },
  };
}

export default async function WebsitePage({ params }: { params: { slug: string } }) {
  const website = await getWebsiteBySlug(params.slug);
  if (!website) notFound();

  await logEvent("website_view", { websiteId: website.id, slug: website.slug });

  const session = await getServerSession(authOptions);
  const related = await getRelatedWebsites(website.categoryId, website.id);

  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6">
        <Link href="/websites" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 hover:text-cyan transition-colors mb-8">
          <ArrowRight size={14} />
          بازگشت به سایت‌های آماده
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge>{website.category.name}</Badge>
                <Badge variant="gold">از {formatToman(website.basePrice)}</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-lalezar text-gray-900 dark:text-white mb-4">{website.name}</h1>
              <p className="text-gray-500 dark:text-white/50 leading-relaxed">{website.description}</p>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">پکیج‌ها</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {website.packages.map((p) => (
                  <div key={p.id} className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
                    <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">{p.name}</div>
                    <div className="text-xl font-bold text-cyan font-jakarta mb-4">{formatToman(p.price)}</div>
                    <ul className="space-y-2">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-gray-600 dark:text-white/60">
                          <Check size={12} className="text-cyan shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <AddToCartButton websiteId={website.id} packageName={p.name} />
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 dark:text-white/30 mt-4">
                تسویه آنلاین در فاز ۳ فعال می‌شود — فعلاً برای خرید با ما در تماس باشید.
              </p>
            </div>

            <AdSlot placement="website.detail.native" />

            <DoctorCta websiteId={website.id} websiteName={website.name} />

            <ReviewList websiteId={website.id} />
            <ReviewForm websiteId={website.id} isLoggedIn={!!session?.user} />
          </div>

          <div className="h-fit lg:sticky lg:top-24">
            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle>همین سایت را بخرید</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                <Button asChild className="w-full">
                  <Link href={`/websites/${website.slug}/preview`}>
                    <Eye size={16} />
                    مشاهده دموی زنده
                  </Link>
                </Button>
                <Button asChild variant="gold" className="w-full">
                  <Link href={`/customize/${website.id}`}>
                    <SlidersHorizontal size={16} />
                    شخصی‌سازی
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <Link href="/contact">
                    <Phone size={16} />
                    سفارش و مشاوره
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <Link href={`/compare?ids=${website.id}`}>
                    <Scale size={16} />
                    افزودن به مقایسه
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">سایت‌های مشابه</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((w) => (
                <WebsiteCard key={w.id} website={w} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
