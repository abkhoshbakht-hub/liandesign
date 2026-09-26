"use client";

import { m } from "framer-motion";
import { Search, Eye, SlidersHorizontal, ShoppingBag } from "lucide-react";

const steps = [
  { icon: Search, num: "۰۱", title: "پیدا کن", desc: "در کاتالوگ جستجو کن و سایت مناسب کسب‌وکارت را پیدا کن." },
  { icon: Eye, num: "۰۲", title: "ببین", desc: "دموی زنده را در موبایل و دسکتاپ ببین." },
  { icon: SlidersHorizontal, num: "۰۳", title: "شخصی‌سازی کن", desc: "رنگ، لوگو و امکانات را برای خودت تنظیم کن." },
  { icon: ShoppingBag, num: "۰۴", title: "بخر", desc: "سایت را بخر و صاحبش شو." },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-gray-100 dark:bg-obsidian-50">
      <div className="container mx-auto px-6">
        <m.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">چطور کار می‌کند؟</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">در ۴ قدم صاحب سایت شو</h2>
        </m.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <m.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="glass-card p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center mx-auto mb-4">
                <step.icon size={20} className="text-cyan" />
              </div>
              <span className="text-xs font-bold text-cyan/40 block mb-2 font-jakarta">{step.num}</span>
               <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
               <p className="text-sm text-gray-500 dark:text-white/50 leading-relaxed">{step.desc}</p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
