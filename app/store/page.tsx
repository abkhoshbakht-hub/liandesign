import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ProductCard from "@/components/store/ProductCard";
import AdSlot from "@/components/ads/AdSlot";
import { getProductCategories, getProducts } from "@/lib/data/products";
import { getSponsoredProducts } from "@/lib/data/ads-engine";
import { logSponsoredViews } from "@/lib/data/ads-track";
import { getViewer } from "@/lib/ads/viewer";

export const metadata: Metadata = {
  title: "فروشگاه دیجیتال",
  description: "قالب آماده، UI Kit، فایل Figma و دارایی‌های طراحی وب",
};

export default async function StorePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const categories = await getProductCategories();
  const viewer = getViewer();
  const [products, sponsored] = await Promise.all([
    getProducts({ category: searchParams.category || undefined }),
    getSponsoredProducts({ limit: 2, viewer }),
  ]);
  if (sponsored.length > 0) {
    await logSponsoredViews(sponsored.map((s) => ({ campaignId: s.campaignId, placementKey: s.placementId })));
  }

  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">فروشگاه دیجیتال</span>
          <h1 className="text-4xl md:text-5xl font-lalezar text-gray-900 dark:text-white mb-4">دارایی‌های طراحی وب</h1>
          <p className="text-sm text-gray-500 dark:text-white/40">بخرید، دانلود کنید، استفاده کنید — مال شماست</p>
        </div>

        <AdSlot placement="store.top" viewer={viewer} className="max-w-3xl mx-auto mb-10" />

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <Link
            href="/store"
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-colors",
              !searchParams.category ? "bg-cyan text-obsidian" : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/50 hover:bg-gray-200 dark:hover:bg-white/10"
            )}
          >
            همه
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/store?category=${c.slug}`}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-colors",
                searchParams.category === c.slug
                  ? "bg-cyan text-obsidian"
                  : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/50 hover:bg-gray-200 dark:hover:bg-white/10"
              )}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {sponsored.length > 0 && (
          <div className="mb-10">
            <p className="text-xs text-gold mb-4 text-center">پیشنهادهای تبلیغاتی</p>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {sponsored.map((s) => (
                <ProductCard key={`sp-${s.product.id}`} product={s.product} sponsored adItemId={s.itemId} />
              ))}
            </div>
          </div>
        )}

        {products.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-500 dark:text-white/50 text-sm">محصولی در این دسته نیست.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
