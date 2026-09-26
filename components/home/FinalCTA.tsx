"use client";

import { m } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-obsidian">
      <div className="container mx-auto px-6">
        <m.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/20 via-obsidian to-gold/10"></div>
          <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-cyan/10 rounded-full blur-[80px]"></div>
          <div className="relative z-10 p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-lalezar text-gray-900 dark:text-white mb-4">آماده‌ای سایتت رو بسازی؟</h2>
            <p className="text-sm text-gray-500 dark:text-white/60 mb-8 max-w-md mx-auto">همین الان مشاوره رایگان بگیر و پروژه‌ات رو شروع کن.</p>
            <Link href="/contact" className="group inline-flex items-center gap-2 bg-cyan text-obsidian px-8 py-3 rounded-xl font-bold text-sm hover:bg-cyan/90 transition-colors">
              شروع پروژه
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </m.div>
      </div>
    </section>
  );
}
