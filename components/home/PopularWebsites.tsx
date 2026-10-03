import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Eye } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// فقط برای سه کارت «محبوب‌ترین سایت‌ها» در صفحه اصلی
const FEATURED = [
  {
    slug: "baamarket",
    name: "بامارکت",
    category: "فروشگاهی",
    description: "فروشگاه اینترنتی با صفحه محصول، سبد خرید و ثبت سفارش.",
    image: "/previews/thumbs/baamarket.png",
    demo: "/previews/baamarket-demo.html",
  },
  {
    slug: "darmanika",
    name: "کلینیک دarmanika",
    category: "پزشکی و کلینیک",
    description: "وب‌سایت کلینیک تخصصی با معرفی پزشکان، تخصص‌ها و نوبت‌دهی آنلاین.",
    image: "/previews/thumbs/darmanika.png",
    demo: "/previews/darmanika-demo.html",
  },
  {
    slug: "lian",
    name: "رستوران لیان",
    category: "رستوران و کافه",
    description: "وب‌سایت رستوران و کافه با منوی تصویری، رزرو آنلاین و معرفی خدمات.",
    image: "/previews/thumbs/lian.png",
    demo: "/previews/lian-demo.html",
  },
];

export default function PopularWebsites() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-obsidian">
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">پربازدیدترین‌ها</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">محبوب‌ترین سایت‌ها</h2>
          </div>
          <Link
            href="/websites"
            className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 hover:text-cyan transition-colors"
          >
            مشاهده همه
            <ExternalLink size={14} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURED.map((site) => (
            <Card key={site.slug} className="overflow-hidden group hover:border-cyan/30 transition-colors flex flex-col">
              <div className="relative h-64 bg-gray-100 dark:bg-white/5 overflow-hidden">
                <Image
                  src={site.image}
                  alt={site.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute top-3 right-3 bg-obsidian/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {site.category}
                </span>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="group-hover:text-cyan transition-colors">{site.name}</CardTitle>
                <CardDescription className="line-clamp-2">{site.description}</CardDescription>
              </CardHeader>

              <CardFooter className="gap-2 mt-auto">
                <Button asChild size="sm" variant="secondary" className="flex-1">
                  <Link href="/websites">
                    <Eye size={14} />
                    مشاهده
                  </Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <a href={site.demo} target="_blank" rel="noopener noreferrer">
                    دمو زنده
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}