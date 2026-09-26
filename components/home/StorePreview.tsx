"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { ExternalLink, ShoppingCart, Star, Eye } from "lucide-react";

const templates = [
  { id: 1, name: "قالب فروشگاهی نوین", category: "فروشگاهی", price: "۱,۲۰۰,۰۰۰", originalPrice: "۱,۸۰۰,۰۰۰", rating: 4.9, sales: 127, speed: "1.2s", languages: ["FA", "EN"], lighthouse: 100, frameworks: ["Next.js", "TypeScript"] },
  { id: 2, name: "قالب شرکتی آریا", category: "شرکتی", price: "۹۸۰,۰۰۰", originalPrice: "۱,۵۰۰,۰۰۰", rating: 4.8, sales: 89, speed: "0.9s", languages: ["FA", "EN", "AR"], lighthouse: 98, frameworks: ["Next.js", "Tailwind"] },
  { id: 3, name: "قالب پورتفولیو کریتیو", category: "پورتفولیو", price: "۸۵۰,۰۰۰", originalPrice: "۱,۲۰۰,۰۰۰", rating: 4.9, sales: 156, speed: "0.8s", languages: ["FA", "EN"], lighthouse: 100, frameworks: ["Next.js", "Framer Motion"] },
];

export default function StorePreview() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-obsidian">
      <div className="container mx-auto px-6">
        <m.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="flex items-end justify-between mb-14">
          <div>
            <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">فروشگاه قالب</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">قالب‌های آماده سایت</h2>
          </div>
          <Link href="/store" className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 hover:text-cyan transition-colors">
            مشاهده همه
            <ExternalLink size={14} />
          </Link>
        </m.div>

        <div className="grid md:grid-cols-3 gap-6">
          {templates.map((tpl, i) => (
            <m.div key={tpl.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="group glass-card overflow-hidden">
              <div className="relative h-48 bg-gradient-to-br from-cyan/10 to-cyan-50/10 flex items-center justify-center">
                <span className="text-4xl opacity-20 group-hover:opacity-40 transition-opacity">{tpl.category === "فروشگاهی" ? "🛒" : tpl.category === "شرکتی" ? "🏢" : "💼"}</span>
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                  <Link href={`/store/${tpl.id}`} className="flex-1 bg-cyan text-obsidian py-2 rounded-lg text-xs font-bold text-center hover:bg-cyan/90 transition-colors">
                    <Eye size={12} className="inline ml-1" />
                    پیش‌نمایش
                  </Link>
                  <Link href={`/store/${tpl.id}`} className="flex-1 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white py-2 rounded-lg text-xs font-bold text-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                    <ShoppingCart size={12} className="inline ml-1" />
                    خرید
                  </Link>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-bold">{tpl.category}</span>
                  <div className="flex items-center gap-1 text-[10px] text-gold">
                    <Star size={10} fill="currentColor" />
                    {tpl.rating}
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">{tpl.name}</h3>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-lg font-bold text-cyan font-jakarta">{tpl.price}</span>
                  <span className="text-xs text-gray-400 dark:text-white/30 line-through font-jakarta">{tpl.originalPrice}</span>
                  <span className="text-[10px] text-gray-400 dark:text-white/30">تومان</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-gray-500 dark:text-white/40">
                  <span>⚡ {tpl.speed}</span>
                  <span>🎯 Lighthouse {tpl.lighthouse}</span>
                  <span>{tpl.sales} فروش</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {tpl.languages.map((lang) => (
                    <span key={lang} className="text-[10px] bg-cyan/10 text-cyan px-2 py-0.5 rounded-full">{lang}</span>
                  ))}
                  {tpl.frameworks.map((fw) => (
                    <span key={fw} className="text-[10px] bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/50 px-2 py-0.5 rounded-full">{fw}</span>
                  ))}
                </div>
              </div>
            </m.div>
          ))}
        </div>

        <div className="md:hidden mt-6 text-center">
          <Link href="/store" className="text-sm text-gray-500 dark:text-white/40 hover:text-cyan transition-colors">
            مشاهده همه قالب‌ها →
          </Link>
        </div>
      </div>
    </section>
  );
}
