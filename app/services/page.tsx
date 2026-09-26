"use client";

import { m } from "framer-motion";
import Link from "next/link";
import { Globe, Code2, ShoppingCart, Search, ArrowLeft } from "lucide-react";

const services = [
  { icon: Globe, title: "طراحی سایت اختصاصی", desc: "کدنویسی خالص با Next.js 15 و TypeScript. سرعت بالا و امنیت کامل.", href: "/services/custom", features: ["طراحی ریسپانسیو", "سئوی پیشرفته", "امنیت بالا", "سرعت بالا"] },
  { icon: ShoppingCart, title: "فروشگاه اینترنتی", desc: "فروشگاه فوق‌سریع با درگاه پرداخت و پنل مدیریت کامل.", href: "/services/ecommerce", features: ["درگاه پرداخت", "مدیریت محصولات", "گزارش فروش", "پشتیبانی ۲۴/۷"] },
  { icon: Code2, title: "طراحی با وردپرس", desc: "سایت حرفه‌ای با وردپرس برای کسب‌وکارهای کوچک و متوسط.", href: "/services/wordpress", features: ["قالب‌های حرفه‌ای", "افزونه‌های کاربردی", "آموزش رایگان", "پشتیبانی فنی"] },
  { icon: Search, title: "سئو و بهینه‌سازی", desc: "تضمین نمره ۱۰۰ در Google PageSpeed و رتبه اول گوگل.", href: "/services/seo", features: ["تحلیل رقبا", "بهینه‌سازی محتوا", "لینک‌سازی", "گزارش ماهانه"] },
];

export default function ServicesPage() {
  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6">
        <m.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">خدمات ما</span>
          <h1 className="text-4xl md:text-5xl font-lalezar text-gray-900 dark:text-white mb-4">خدمات طراحی وب</h1>
          <p className="text-sm text-gray-500 dark:text-white/40">خدمات حرفه‌ای طراحی وب برای کسب‌وکار شما</p>
        </m.div>

        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, i) => (
            <m.div key={service.title} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} className="group glass-card p-8 hover:border-cyan/30 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-cyan/10 flex items-center justify-center mb-6 group-hover:bg-cyan/20 transition-colors">
                <service.icon size={26} className="text-cyan" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-cyan transition-colors">{service.title}</h2>
              <p className="text-sm text-gray-500 dark:text-white/50 leading-relaxed mb-6">{service.desc}</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {service.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/40">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan/50"></div>
                    {f}
                  </div>
                ))}
              </div>
              <Link href={service.href} className="inline-flex items-center gap-2 text-sm text-cyan hover:text-cyan/80 transition-colors">
                مشاهده جزئیات
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              </Link>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
