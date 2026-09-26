"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { Globe, Code2, ShoppingCart, Search, ArrowLeft } from "lucide-react";

const services = [
  { icon: Globe, title: "طراحی سایت اختصاصی", desc: "کدنویسی خالص با Next.js 15 و TypeScript. سرعت بالا و امنیت کامل.", href: "/services/custom" },
  { icon: ShoppingCart, title: "فروشگاه اینترنتی", desc: "فروشگاه فوق‌سریع با درگاه پرداخت و پنل مدیریت کامل.", href: "/services/ecommerce" },
  { icon: Code2, title: "طراحی با وردپرس", desc: "سایت حرفه‌ای با وردپرس برای کسب‌وکارهای کوچک و متوسط.", href: "/services/wordpress" },
  { icon: Search, title: "سئو و بهینه‌سازی", desc: "تضمین نمره ۱۰۰ در Google PageSpeed و رتبه اول گوگل.", href: "/services/seo" },
];

export default function Services() {
  return (
    <section className="py-24 bg-gray-100 dark:bg-obsidian-50">
      <div className="container mx-auto px-6">
        <m.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">خدمات ما</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">چه خدماتی ارائه می‌دیم؟</h2>
        </m.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <m.div key={service.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="group glass-card p-6 hover:border-cyan/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center mb-5 group-hover:bg-cyan/20 transition-colors">
                <service.icon size={22} className="text-cyan" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 group-hover:text-cyan transition-colors">{service.title}</h3>
              <p className="text-sm text-gray-500 dark:text-white/50 leading-relaxed mb-5">{service.desc}</p>
              <Link href={service.href} className="inline-flex items-center gap-2 text-xs text-cyan/70 hover:text-cyan transition-colors">
                مشاهده جزئیات
                <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
              </Link>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
