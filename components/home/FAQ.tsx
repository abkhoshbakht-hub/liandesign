"use client";

import { m } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "چقدر طول می‌کشه سایت آماده بشه؟", a: "بسته به نوع پروژه، بین ۳ تا ۱۴ روز کاری زمان می‌بره." },
  { q: "آیا سایت ریسپانسیو هست؟", a: "بله، تمام سایت‌های ما کاملاً ریسپانسیو هستند." },
  { q: "آیا پشتیبانی دارید؟", a: "بله، بعد از تحویل پروژه پشتیبانی رایگان دارید." },
  { q: "هزینه سایت چقدره؟", a: "از ۵ میلیون تومان شروع می‌شه و بسته به امکانات متغیره." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 bg-gray-100 dark:bg-obsidian-50">
      <div className="container mx-auto px-6">
        <m.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">سوالات متداول</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">سؤالات شما</h2>
        </m.div>

        <div className="max-w-2xl mx-auto">
          {faqs.map((faq, i) => (
            <m.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }} className="border-b border-gray-200 dark:border-white/10">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between py-5 text-left hover:text-cyan transition-colors">
                 <span className="text-sm font-bold text-gray-900 dark:text-white">{faq.q}</span>
                 <ChevronDown size={16} className={`text-gray-500 dark:text-white/40 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-200 ${open === i ? "max-h-40 pb-5" : "max-h-0"}`}>
                 <p className="text-sm text-gray-500 dark:text-white/50 leading-relaxed">{faq.a}</p>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
