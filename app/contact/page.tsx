"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { Send, Phone, MessageCircle, Mic, MicOff, Calendar } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", message: "" });
  const [isRecording, setIsRecording] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="py-32 bg-white dark:bg-obsidian min-h-screen transition-colors">
      <div className="container mx-auto px-6">
        <m.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">تماس با ما</span>
          <h1 className="text-4xl md:text-5xl font-lalezar text-gray-900 dark:text-white mb-4">ارتباط با لیان دیزاین</h1>
          <p className="text-sm text-gray-600 dark:text-white/40">مشاوره رایگان و ثبت سفارش آنلاین</p>
        </m.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">فرم تماس سریع</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-600 dark:text-white/40 block mb-2">نام و نام خانوادگی</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-cyan/40 transition-colors" placeholder="نام خود را وارد کنید" required />
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-white/40 block mb-2">شماره تماس</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-cyan/40 transition-colors font-jakarta" placeholder="۰۹۱۲-۱۲۳-۴۵۶۷" required dir="ltr" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-white/40 block mb-2">ایمیل (اختیاری)</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-cyan/40 transition-colors font-jakarta" placeholder="email@example.com" dir="ltr" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-white/40 block mb-2">پیام شما</label>
                  <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={4} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-cyan/40 transition-colors resize-none" placeholder="پیام خود را بنویسید..." required></textarea>
                </div>
                <button type="submit" className="w-full bg-cyan text-obsidian py-3 rounded-xl text-sm font-bold hover:bg-cyan/90 transition-colors flex items-center justify-center gap-2">
                  <Send size={14} />
                  {submitted ? "ارسال شد!" : "ارسال پیام"}
                </button>
              </form>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mic size={18} className="text-cyan" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Voice Brief (پیام صوتی)</h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-white/40 mb-4">اگر تایپ کردن براتون سخته، پیام صوتی بفرستید.</p>
              <button onClick={() => setIsRecording(!isRecording)} className={`w-full py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${isRecording ? "bg-red-500 text-white" : "bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10"}`}>
                {isRecording ? <><MicOff size={14} /> توقف ضبط</> : <><Mic size={14} /> شروع ضبط صدا</>}
              </button>
            </div>
          </m.div>

          <m.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Phone size={18} className="text-cyan" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">تماس تلفنی</h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-white/40 mb-4">برای مشاوره فوری با ما تماس بگیرید.</p>
              <a href="tel:+989938866331" className="block bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white py-3 rounded-xl text-sm font-bold text-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors font-jakarta" dir="ltr">
                ۰۹۹۳-۸۸۶-۶۳۳۱
              </a>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle size={18} className="text-[#25D366]" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">واتساپ</h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-white/40 mb-4">پیام مستقیم در واتساپ.</p>
              <a href="https://wa.me/989938866331" target="_blank" rel="noopener noreferrer" className="block bg-[#25D366] text-white py-3 rounded-xl text-sm font-bold text-center hover:bg-[#25D366]/90 transition-colors">
                ارسال پیام در واتساپ
              </a>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar size={18} className="text-cyan" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">رزرو جلسه حضوری</h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-white/40 mb-4">جلسه حضوری در استودیو لیان دیزاین بوشهر.</p>
              <a href="https://wa.me/989938866331?text=%D8%B1%D8%B2%D8%B1%D9%88%20%D8%AC%D9%84%D8%B3%D9%87%20%D8%AD%D8%B6%D9%88%D8%B1%DB%8C" target="_blank" rel="noopener noreferrer" className="block bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white py-3 rounded-xl text-sm font-bold text-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                رزرو جلسه
              </a>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">آدرس استودیو</h3>
              <p className="text-xs text-gray-600 dark:text-white/40 leading-relaxed">
                بوشهر، شهرک نیایش
              </p>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
