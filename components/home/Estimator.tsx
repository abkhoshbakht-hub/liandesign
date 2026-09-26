"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { Calculator, ShoppingCart, MessageCircle, Check } from "lucide-react";
import Link from "next/link";

const projectTypes = [
  { id: "landing", label: "لندینگ پیج", price: 5000000 },
  { id: "corporate", label: "سایت شرکتی", price: 12000000 },
  { id: "ecommerce", label: "فروشگاه اینترنتی", price: 18000000 },
  { id: "portfolio", label: "پورتفولیو", price: 8000000 },
  { id: "blog", label: "وبلاگ/مجله", price: 10000000 },
  { id: "saas", label: "پلتفرم SaaS", price: 35000000 },
];

const languages = [
  { id: "fa", label: "فقط فارسی", price: 0 },
  { id: "fa-en", label: "فارسی + انگلیسی", price: 4000000 },
  { id: "fa-ar", label: "فارسی + عربی", price: 4000000 },
  { id: "fa-en-ar", label: "سه زبانه", price: 8000000 },
];

const features = [
  { id: "seo", label: "سئو و بهینه‌سازی", price: 3000000 },
  { id: "crm", label: "پنل مدیریت محتوا", price: 5000000 },
  { id: "payment", label: "درگاه پرداخت", price: 2000000 },
  { id: "whatsapp", label: "اتصال واتساپ", price: 1500000 },
  { id: "telegram", label: "اتصال تلگرام", price: 1500000 },
  { id: "analytics", label: "گزارش‌گیری پیشرفته", price: 3000000 },
];

export default function Estimator() {
  const [selectedType, setSelectedType] = useState<string>("corporate");
  const [selectedLang, setSelectedLang] = useState<string>("fa");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["seo"]);

  const toggleFeature = (id: string) => {
    setSelectedFeatures((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const basePrice = projectTypes.find((t) => t.id === selectedType)?.price || 0;
  const langPrice = languages.find((l) => l.id === selectedLang)?.price || 0;
  const featuresPrice = features.filter((f) => selectedFeatures.includes(f.id)).reduce((sum, f) => sum + f.price, 0);
  const total = basePrice + langPrice + featuresPrice;

  const formatPrice = (p: number) => p.toLocaleString("fa-IR");

  const whatsappMessage = encodeURIComponent(
    `محاسبه هزینه پروژه:\nنوع: ${projectTypes.find((t) => t.id === selectedType)?.label}\nزبان: ${languages.find((l) => l.id === selectedLang)?.label}\nامکانات: ${selectedFeatures.map((f) => features.find((fe) => fe.id === f)?.label).join(", ")}\nهزینه تقریبی: ${formatPrice(total)} تومان`
  );

  return (
    <section className="py-24 bg-gray-100 dark:bg-obsidian-50">
      <div className="container mx-auto px-6">
        <m.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <span className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 text-gold px-4 py-2 rounded-full text-xs font-bold mb-4">
            <Calculator size={14} />
            محاسبه‌گر آنلاین
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">هزینه پروژه‌تون رو بفهمید</h2>
          <p className="text-sm text-gray-500 dark:text-white/40">با انتخاب گزینه‌ها، قیمت تقریبی رو آنلاین محاسبه کنید</p>
        </m.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <m.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-6">
               <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">نوع پروژه</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {projectTypes.map((type) => (
                  <button key={type.id} onClick={() => setSelectedType(type.id)} className={`p-4 rounded-xl text-right transition-all ${selectedType === type.id ? "bg-cyan/10 border border-cyan/40" : "bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"}`}>
                     <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">{type.label}</div>
                    <div className="text-[10px] text-gray-400 dark:text-white/30 font-jakarta">از {formatPrice(type.price)} تومان</div>
                  </button>
                ))}
              </div>
            </m.div>

            <m.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-6">
               <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">زبان سایت</h3>
              <div className="grid grid-cols-2 gap-3">
                {languages.map((lang) => (
                  <button key={lang.id} onClick={() => setSelectedLang(lang.id)} className={`p-4 rounded-xl text-right transition-all ${selectedLang === lang.id ? "bg-cyan/10 border border-cyan/40" : "bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"}`}>
                     <div className="text-sm font-bold text-gray-900 dark:text-white">{lang.label}</div>
                    {lang.price > 0 && <div className="text-[10px] text-gray-400 dark:text-white/30 mt-1">+{formatPrice(lang.price)} تومان</div>}
                  </button>
                ))}
              </div>
            </m.div>

            <m.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-6">
               <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">امکانات اضافی</h3>
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature) => (
                  <button key={feature.id} onClick={() => toggleFeature(feature.id)} className={`p-4 rounded-xl text-right transition-all ${selectedFeatures.includes(feature.id) ? "bg-cyan/10 border border-cyan/40" : "bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border ${selectedFeatures.includes(feature.id) ? "bg-cyan border-cyan" : "border-white/30"}`}>
                        {selectedFeatures.includes(feature.id) && <Check size={10} className="text-obsidian" />}
                      </div>
                       <span className="text-sm font-bold text-gray-900 dark:text-white">{feature.label}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-white/30 mt-1 mr-6">+{formatPrice(feature.price)} تومان</div>
                  </button>
                ))}
              </div>
            </m.div>
          </div>

          <m.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:sticky lg:top-24 h-fit">
            <div className="glass-card p-6 border-cyan/20">
               <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6">خلاصه سفارش</h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-white/50">نوع پروژه:</span>
                   <span className="text-gray-900 dark:text-white font-bold">{projectTypes.find((t) => t.id === selectedType)?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-white/50">زبان:</span>
                   <span className="text-gray-900 dark:text-white font-bold">{languages.find((l) => l.id === selectedLang)?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-white/50">امکانات:</span>
                   <span className="text-gray-900 dark:text-white font-bold">{selectedFeatures.length} مورد</span>
                </div>
                 <div className="border-t border-gray-200 dark:border-white/10 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-white/50">هزینه تقریبی:</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-cyan font-jakarta">{formatPrice(total)}</div>
                      <div className="text-[10px] text-gray-400 dark:text-white/30">تومان</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                 <Link href={`https://wa.me/989938866331?text=${whatsappMessage}`} target="_blank" className="flex items-center justify-center gap-2 bg-[#25D366] text-gray-900 dark:text-white py-3 rounded-xl text-sm font-bold hover:bg-[#25D366]/90 transition-colors w-full">
                  <MessageCircle size={16} />
                  ارسال در واتساپ
                </Link>
                 <Link href="/contact" className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white py-3 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors w-full">
                  <ShoppingCart size={16} />
                  ثبت سفارش آنلاین
                </Link>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-white/30 text-center mt-4">* قیمت نهایی پس از بررسی پروژه اعلام می‌شود</p>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
