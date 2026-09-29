import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "TIDAMAX — گالری نمونه‌کار",
  description: "گالری تصاویر فروشگاه اینترنتی TIDAMAX — نمونه‌کار لیان دیزاین",
};

const SHOTS = [
  { src: "/previews/thumbs/tidamax/01-home.png", title: "صفحه اصلی", desc: "اسلایدر محصولات، دسته‌بندی‌ها و مزایای فروشگاه" },
  { src: "/previews/thumbs/tidamax/02-shop.png", title: "فروشگاه", desc: "لیست محصولات با فیلتر دسته‌بندی، قیمت و افزودن به سبد" },
  { src: "/previews/thumbs/tidamax/04-about.png", title: "درباره ما", desc: "معرفی برند و تاریخچه TIDAMAX" },
  { src: "/previews/thumbs/tidamax/05-contact.png", title: "تماس با ما", desc: "فرم تماس و راه‌های ارتباطی" },
  { src: "/previews/thumbs/tidamax/03-cart.png", title: "سبد خرید", desc: "مدیریت سبد خرید و مراحل تسویه حساب" },
];

export default function TidamaxGalleryPage() {
  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6">
        <Link href="/websites" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 hover:text-cyan transition-colors mb-8">
          <ArrowRight size={14} />
          بازگشت به نمونه‌کارها
        </Link>

        <div className="text-center mb-10">
          <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">فروشگاه اینترنتی</span>
          <h1 className="text-4xl md:text-5xl font-lalezar text-gray-900 dark:text-white mb-4">TIDAMAX</h1>
          <p className="text-sm text-gray-500 dark:text-white/40 max-w-2xl mx-auto">
            فروشگاه اینترنتی اختصاصی با وردپرس و ووکامرس — سبد خرید، درگاه پرداخت، فاکتور و بارکد
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <span className="text-[10px] bg-gold/10 text-gold px-3 py-1 rounded-full font-bold">PHP + WordPress</span>
            <span className="text-[10px] bg-cyan/10 text-cyan px-3 py-1 rounded-full">WooCommerce</span>
            <span className="text-[10px] bg-cyan/10 text-cyan px-3 py-1 rounded-full">MySQL</span>
            <span className="text-[10px] bg-cyan/10 text-cyan px-3 py-1 rounded-full">درگاه پرداخت</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {SHOTS.map((shot, i) => (
            <div key={shot.src} className="group glass-card overflow-hidden">
              <div className="relative aspect-[16/10] bg-gray-100 dark:bg-white/5 overflow-hidden">
                <Image
                  src={shot.src}
                  alt={shot.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  priority={i < 2}
                />
              </div>
              <div className="p-5">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-cyan transition-colors">
                  {shot.title}
                </h2>
                <p className="text-xs text-gray-500 dark:text-white/40 leading-relaxed">{shot.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/contact"
            className="inline-block bg-cyan text-obsidian px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-cyan/90 transition-colors"
          >
            سفارش سایت فروشگاهی مشابه
          </Link>
        </div>
      </div>
    </section>
  );
}
