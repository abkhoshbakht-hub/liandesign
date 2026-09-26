"use client";

import { m } from "framer-motion";
import { Shield, Zap, TrendingUp, Headphones, MapPin, Phone, Mail, Clock } from "lucide-react";

const reasons = [
  { icon: Shield, title: "طراحی اختصاصی", desc: "هیچ قالب آماده‌ای استفاده نمی‌کنیم." },
  { icon: Zap, title: "سرعت بالا", desc: "سایت شما با بالاترین سرعت لود می‌شه." },
  { icon: TrendingUp, title: "سئو حرفه‌ای", desc: "سایت شما برای گوگل بهینه‌سازی می‌شه." },
  { icon: Headphones, title: "پشتیبانی دائم", desc: "پشتیبانی رایگان بعد از تحویل پروژه." },
];

export default function AboutPage() {
  return (
    <section className="py-32 bg-white dark:bg-obsidian min-h-screen transition-colors">
      <div className="container mx-auto px-6">
        <m.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">درباره ما</span>
          <h1 className="text-4xl md:text-5xl font-lalezar text-gray-900 dark:text-white mb-4">لیان دیزاین</h1>
          <p className="text-sm text-gray-600 dark:text-white/40 max-w-2xl mx-auto">استودیو طراحی وب حرفه‌ای در بوشهر. تیمی جوان و خلاق با هدف تبدیل شدن به معتبرترین پلتفرم طراحی وب در ایران و حوزه خلیج فارس.</p>
        </m.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">چرا لیان دیزاین؟</h2>
            <p className="text-sm text-gray-600 dark:text-white/50 leading-relaxed mb-6">
              ما با سال‌ها تجربه در زمینه طراحی وب، تیمی حرفه‌ای و خلاق را گرد هم آوردیم تا بهترین خدمات را به مشتریان خود ارائه دهیم.
            </p>
            <p className="text-sm text-gray-600 dark:text-white/50 leading-relaxed">
              هدف ما تبدیل شدن به معتبرترین، زیباترین و سریع‌ترین پلتفرم سفارش و خرید قالب‌های وب اختصاصی در ایران و کشورهای حوزه خلیج فارس است.
            </p>
          </m.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {reasons.map((r, i) => (
              <m.div key={r.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.08 }} className="glass-card p-6 group hover:border-cyan/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center mb-4 group-hover:bg-cyan/20 transition-colors">
                  <r.icon size={18} className="text-cyan" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 group-hover:text-cyan transition-colors">{r.title}</h3>
                <p className="text-xs text-gray-600 dark:text-white/50">{r.desc}</p>
              </m.div>
            ))}
          </div>
        </div>

        <m.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="glass-card p-10">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 text-center">ارتباط با ما</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center">
                <MapPin size={20} className="text-cyan" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">آدرس</div>
                <div className="text-xs text-gray-600 dark:text-white/40">بوشهر، شهرک نیایش</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center">
                <Phone size={20} className="text-cyan" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">تلفن</div>
                <div className="text-xs text-gray-600 dark:text-white/40 font-jakarta" dir="ltr">۰۹۹۳-۸۸۶-۶۳۳۱</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center">
                <Mail size={20} className="text-cyan" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">ایمیل</div>
                <div className="text-xs text-gray-600 dark:text-white/40">ab.khoshbakht@gmail.com</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center">
                <Clock size={20} className="text-cyan" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">ساعات کاری</div>
                <div className="text-xs text-gray-600 dark:text-white/40">شنبه تا پنج‌شنبه، ۹ الی ۱۸</div>
              </div>
            </div>
          </div>
        </m.div>
      </div>
    </section>
  );
}
