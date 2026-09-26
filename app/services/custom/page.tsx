"use client";

import { m } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

const features = ["طراحی ریسپانسیو", "سئوی پیشرفته", "امنیت بالا", "سرعت بالا", "پنل مدیریت محتوا", "اتصال شبکه‌های اجتماعی", "فرم تماس پیشرفته", " نقشه تعاملی", "گالری تصاویر", "وبلاگ حرفه‌ای"];

export default function CustomServicePage() {
  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6">
        <m.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
          <Link href="/services" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 hover:text-cyan transition-colors mb-8">
            <ArrowLeft size={14} />
            بازگشت به خدمات
          </Link>
          <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">طراحی سایت اختصاصی</span>
          <h1 className="text-4xl md:text-5xl font-lalezar text-gray-900 dark:text-white mb-6">طراحی سایت اختصاصی</h1>
          <p className="text-lg text-gray-500 dark:text-white/50 leading-relaxed mb-10">
            کدنویسی خالص با Next.js 15 و TypeScript. سایت شما از صفر تا صد به صورت اختصاصی طراحی و توسعه داده می‌شود.
          </p>

          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-8 mb-8 rounded-xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">امکانات این سرویس</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-3 text-sm text-gray-600 dark:text-white/60">
                  <div className="w-5 h-5 rounded-full bg-cyan/10 flex items-center justify-center">
                    <Check size={12} className="text-cyan" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-8 rounded-xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">قیمت‌گذاری</h2>
            <p className="text-sm text-gray-500 dark:text-white/50 mb-6">هزینه طراحی سایت اختصاصی از ۱۲,۰۰۰,۰۰۰ تومان شروع می‌شود.</p>
            <Link href="/estimator" className="inline-flex items-center gap-2 bg-cyan text-obsidian px-6 py-3 rounded-xl text-sm font-bold hover:bg-cyan/90 transition-colors">
              محاسبه آنلاین هزینه
              <ArrowLeft size={14} />
            </Link>
          </div>
        </m.div>
      </div>
    </section>
  );
}
