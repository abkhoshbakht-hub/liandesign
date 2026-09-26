"use client";

import { m } from "framer-motion";
import Link from "next/link";
import { Check, ArrowLeft, Star } from "lucide-react";

const plans = [
  { name: "پایه", price: "۵,۰۰۰,۰۰۰", period: "تومان", desc: "برای کسب‌وکارهای کوچک", features: ["طراحی ریسپانسیو", "سئوی پایه", "فرم تماس", "پشتیبانی ۳ ماه"], popular: false, href: "/estimator" },
  { name: "حرفه‌ای", price: "۱۲,۰۰۰,۰۰۰", period: "تومان", desc: "برای کسب‌وکارهای متوسط", features: ["طراحی اختصاصی", "سئوی پیشرفته", "پنل مدیریت محتوا", "درگاه پرداخت", "پشتیبانی ۶ ماه"], popular: true, href: "/estimator" },
  { name: "سازمانی", price: "۳۵,۰۰۰,۰۰۰", period: "تومان", desc: "برای سازمان‌ها و شرکت‌ها", features: ["طراحی کاملاً اختصاصی", "سئوی حرفه‌ای", "پنل مدیریت پیشرفته", "درگاه پرداخت", "چندزبانه", "پشتیبانی ۱ سال"], popular: false, href: "/estimator" },
];

export default function PricingPage() {
  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6">
        <m.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">تعرفه</span>
          <h1 className="text-4xl md:text-5xl font-lalezar text-gray-900 dark:text-white mb-4">تعرفه طراحی سایت</h1>
          <p className="text-sm text-gray-500 dark:text-white/40">قیمت‌گذاری شفاف و منصفانه</p>
        </m.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <m.div key={plan.name} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} className={`glass-card p-8 ${plan.popular ? "border-cyan/40 glow-cyan" : ""}`}>
              {plan.popular && (
                <div className="flex items-center gap-2 bg-cyan/10 text-cyan px-3 py-1 rounded-full text-xs font-bold mb-4 w-fit">
                  <Star size={12} fill="currentColor" />
                  محبوب‌ترین
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h2>
              <p className="text-xs text-gray-500 dark:text-white/40 mb-6">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-cyan font-jakarta">{plan.price}</span>
                <span className="text-xs text-gray-500 dark:text-white/40 mr-2">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/60">
                    <Check size={14} className="text-cyan" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href} className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-colors ${plan.popular ? "bg-cyan text-obsidian hover:bg-cyan/90" : "bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10"}`}>
                شروع سفارش
                <ArrowLeft size={14} />
              </Link>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
