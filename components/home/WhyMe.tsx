"use client";

import { m } from "framer-motion";
import { Shield, Zap, TrendingUp, Headphones } from "lucide-react";

const reasons = [
  { icon: Shield, title: "طراحی اختصاصی", desc: "هیچ قالب آماده‌ای استفاده نمی‌کنیم." },
  { icon: Zap, title: "سرعت بالا", desc: "سایت شما با بالاترین سرعت لود می‌شه." },
  { icon: TrendingUp, title: "سئو حرفه‌ای", desc: "سایت شما برای گوگل بهینه‌سازی می‌شه." },
  { icon: Headphones, title: "پشتیبانی دائم", desc: "پشتیبانی رایگان بعد از تحویل پروژه." },
];

export default function WhyMe() {
  return (
    <section className="py-24 bg-gray-100 dark:bg-obsidian-50">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <m.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">چرا لیان دیزاین؟</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">ما بهترین‌ها رو می‌سازیم</h2>
            <p className="text-sm text-gray-500 dark:text-white/50 leading-relaxed">با سال‌ها تجربه و تیمی حرفه‌ای، پروژه شما رو با بالاترین کیفیت تحویل می‌دیم.</p>
          </m.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {reasons.map((r, i) => (
              <m.div key={r.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} className="glass-card p-6 group hover:border-cyan/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center mb-4 group-hover:bg-cyan/20 transition-colors">
                  <r.icon size={18} className="text-cyan" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 group-hover:text-cyan transition-colors">{r.title}</h3>
                <p className="text-xs text-gray-500 dark:text-white/50">{r.desc}</p>
              </m.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
