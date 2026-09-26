import Link from "next/link";
import { Eye } from "lucide-react";
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
  return (
    <Card
      className={`overflow-hidden group hover:border-cyan/30 transition-colors flex flex-col ${
        sponsored ? "border-gold/40" : ""
      }`}
    >
      <div className="h-36 bg-gradient-to-br from-gold/10 to-cyan/10 flex items-center justify-center relative">
        <span className="text-4xl opacity-20 group-hover:opacity-40 transition-opacity">📦</span>
        {sponsored && (
          <span className="absolute top-3 right-3 bg-gold text-obsidian text-[10px] font-bold px-2.5 py-1 rounded-full">
            تبلیغاتی
          </span>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-2">
          <Badge>{product.category.name}</Badge>
          <Badge variant="gold">{formatToman(product.price)}</Badge>
        </div>
        <CardTitle className="group-hover:text-cyan transition-colors">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2">{product.description}</CardDescription>
      </CardHeader>
      <CardFooter className="gap-2 mt-auto">
        <Button asChild size="sm" variant="secondary" className="flex-1">
          <Link href={detailHref}>
            <Eye size={14} />
            جزئیات
          </Link>
        </Button>
        <div className="flex-1">
          <AddProductButton productId={product.id} />
        </div>
      </CardFooter>
    </Card>
  );
}
