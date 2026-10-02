import Link from "next/link";
import Image from "next/image";
import { Eye, Clock, FileDown, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatToman } from "@/lib/format";
import type { ProductWithCategory } from "@/lib/data/products";
import AddProductButton from "./AddProductButton";

export default function ProductCard({
  product,
  sponsored = false,
  adItemId,
}: {
  product: ProductWithCategory;
  sponsored?: boolean;
  adItemId?: string;
}) {
  const detailHref =
    sponsored && adItemId
      ? `/api/ads/go?item=${adItemId}&to=${encodeURIComponent(`/store/${product.slug}`)}`
      : `/store/${product.slug}`;

  // محصول واقعی = دمو و تصویر دارد | محصول در انتظار = هنوز آماده نیست
  const isReady = Boolean(product.demoUrl);
  const cover = product.images?.[0] ?? null;
  const total = product.price + (product.brandingPrice ?? 0);

  return (
    <Card
      className={`overflow-hidden group hover:border-cyan/30 transition-colors flex flex-col ${
        sponsored ? "border-gold/40" : ""
      }`}
    >
      <div className="h-40 bg-gray-100 dark:bg-white/5 flex items-center justify-center relative overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="text-4xl opacity-20 group-hover:opacity-40 transition-opacity">📦</span>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {sponsored && (
          <span className="absolute top-3 right-3 bg-gold text-obsidian text-[10px] font-bold px-2.5 py-1 rounded-full">
            تبلیغاتی
          </span>
        )}
        {!sponsored && isReady && (
          <span className="absolute top-3 right-3 bg-cyan text-obsidian text-[10px] font-bold px-2.5 py-1 rounded-full">
            آماده سفارش
          </span>
        )}
        {!sponsored && !isReady && (
          <span className="absolute top-3 right-3 bg-gray-700/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            به‌زودی
          </span>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge>{product.category.name}</Badge>
          <Badge variant="gold">{formatToman(total)}</Badge>
        </div>
        <CardTitle className="group-hover:text-cyan transition-colors">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2">{product.description}</CardDescription>

        {isReady && (
          <ul className="mt-3 space-y-1">
            <li className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-white/50">
              <FileDown size={12} className="shrink-0" />
              تحویل فایل کامل + برندسازی اختصاصی
            </li>
            <li className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-white/50">
              <Clock size={12} className="shrink-0" />
              تحویل نهایی: ۴۸ ساعت
            </li>
          </ul>
        )}
      </CardHeader>

      <CardFooter className="gap-2 mt-auto">
        <Button asChild size="sm" variant="secondary" className="flex-1">
          <Link href={detailHref}>
            <Eye size={14} />
            جزئیات
          </Link>
        </Button>
        <div className="flex-1">
          {isReady ? (
            <AddProductButton productId={product.id} />
          ) : (
            <span className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-gray-400 dark:text-white/30 bg-gray-100 dark:bg-white/5 py-2 rounded-lg">
              <Info size={12} />
              به‌زودی منتشر می‌شود
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}