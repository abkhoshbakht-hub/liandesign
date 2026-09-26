import Link from "next/link";
import { Eye, SlidersHorizontal } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type WebsiteWithRelations } from "@/lib/data/websites";
import { formatToman } from "@/lib/format";

export default function WebsiteCard({
  website,
  sponsored = false,
  adItemId,
}: {
  website: WebsiteWithRelations;
  sponsored?: boolean;
  adItemId?: string;
}) {
  const viewHref =
    sponsored && adItemId
      ? `/api/ads/go?item=${adItemId}&to=${encodeURIComponent(`/websites/${website.slug}`)}`
      : `/websites/${website.slug}`;
  return (
    <Card
      className={`overflow-hidden group hover:border-cyan/30 transition-colors flex flex-col ${
        sponsored ? "border-gold/40" : ""
      }`}
    >
      <div className="h-36 bg-gradient-to-br from-cyan/10 to-cyan-50/10 flex items-center justify-center relative">
        <span className="text-4xl opacity-20 group-hover:opacity-40 transition-opacity">🌐</span>
        {sponsored && (
          <span className="absolute top-3 right-3 bg-gold text-obsidian text-[10px] font-bold px-2.5 py-1 rounded-full">
            تبلیغاتی
          </span>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-2">
          <Badge>{website.category.name}</Badge>
          <Badge variant="gold">از {formatToman(website.basePrice)}</Badge>
        </div>
        <CardTitle className="group-hover:text-cyan transition-colors">{website.name}</CardTitle>
        <CardDescription className="line-clamp-2">{website.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-[11px] text-white/30">{website.packages.length} پکیج قابل انتخاب</p>
      </CardContent>
      <CardFooter className="gap-2 mt-auto">
        <Button asChild size="sm" className="flex-1">
          <Link href={viewHref}>
            <Eye size={14} />
            مشاهده
          </Link>
        </Button>
        <Button asChild size="sm" variant="secondary" className="flex-1">
          <Link href={`/websites/${website.slug}/preview`}>
            <SlidersHorizontal size={14} />
            دمو
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
