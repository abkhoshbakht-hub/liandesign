import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowRight, Download, ShoppingCart } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatToman } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import ProductCard from "@/components/store/ProductCard";
import AddProductButton from "@/components/store/AddProductButton";
import ReviewList from "@/components/reviews/ReviewList";
import ReviewForm from "@/components/reviews/ReviewForm";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "محصول پیدا نشد" };
  return { title: product.name, description: product.description ?? "" };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const session = await getServerSession(authOptions);
  const related = await getRelatedProducts(product.categoryId, product.id);

  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6">
        <Link href="/store" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 hover:text-cyan transition-colors mb-8">
          <ArrowRight size={14} />
          بازگشت به فروشگاه
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Badge>{product.category.name}</Badge>
              <Badge variant="gold">{formatToman(product.price)}</Badge>
            </div>
            <h1 className="text-4xl font-lalezar text-gray-900 dark:text-white mb-4">{product.name}</h1>
            <p className="text-gray-500 dark:text-white/50 leading-relaxed mb-8">{product.description}</p>

            <Card className="p-6">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Download size={14} className="text-cyan" />
                تحویل فایل
              </h2>
              <p className="text-xs text-gray-500 dark:text-white/50 leading-relaxed">
                پس از خرید و تأیید پرداخت، لینک دانلود در داشبورد شما (بخش دانلودها) فعال می‌شود.
              </p>
            </Card>

            <div className="mt-8 space-y-6">
              <ReviewList productId={product.id} />
              <ReviewForm productId={product.id} isLoggedIn={!!session?.user} />
            </div>
          </div>

          <div className="h-fit lg:sticky lg:top-24">
            <Card className="p-6">
              <div className="text-3xl font-bold text-cyan font-jakarta mb-1">{formatToman(product.price)}</div>
              <div className="text-[11px] text-gray-400 dark:text-white/30 mb-6">پرداخت یک‌بار — مالکیت دائم</div>
              <div className="space-y-2">
                <AddProductButton productId={product.id} />
                <Button asChild variant="secondary" className="w-full">
                  <Link href="/checkout">
                    <ShoppingCart size={14} />
                    مشاهده سبد
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">محصولات مشابه</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
