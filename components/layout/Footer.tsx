"use client";

import Link from "next/link";
import { MapPin, Phone, Clock, Mail } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

const footerLinks = {
  services: [
    { label: "طراحی سایت اختصاصی", href: "/services/custom" },
    { label: "فروشگاه اینترنتی", href: "/services/ecommerce" },
    { label: "طراحی با وردپرس", href: "/services/wordpress" },
    { label: "سئو و بهینه‌سازی", href: "/services/seo" },
  ],
  store: [
    { label: "قالب آماده", href: "/store?category=template" },
    { label: "کیت رابط کاربری", href: "/store?category=ui-kit" },
    { label: "فایل فیگما", href: "/store?category=figma" },
    { label: "لندینگ‌پیج", href: "/store?category=landing" },
  ],
  company: [
    { label: "درباره ما", href: "/about" },
    { label: "طراحی اختصاصی", href: "/custom-design" },
    { label: "مقایسه سایت‌ها", href: "/compare" },
    { label: "نمونه‌کارها", href: "/websites" },
    { label: "تعرفه", href: "/pricing" },
    { label: "وبلاگ", href: "/blog" },
  ],
};

export default function Footer() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && theme === "light";

  return (
    <footer className="border-t transition-colors" style={{ backgroundColor: isLight ? "#f8fafc" : "#0A1128", borderColor: isLight ? "rgba(226,232,240,0.8)" : "rgba(30,41,59,0.6)" }}>
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="mb-6 block">
              <img src="/images/liandesign.logo.png" alt="لیان دیزاین" style={{ height: "120px", width: "auto" }} />
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-sm" style={{ color: isLight ? "#64748b" : "rgba(241,245,249,0.4)" }}>
              لیان دیزاین، استودیو طراحی وب حرفه‌ای در بوشهر. طراحی سایت اختصاصی، فروش قالب و سئو.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm" style={{ color: isLight ? "#64748b" : "rgba(241,245,249,0.4)" }}>
                <MapPin size={14} className="text-cyan" />
                <span>بوشهر، شهرک نیایش</span>
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: isLight ? "#64748b" : "rgba(241,245,249,0.4)" }}>
                <Phone size={14} className="text-cyan" />
                <span className="font-jakarta">۰۹۹۳-۸۸۶-۶۳۳۱</span>
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: isLight ? "#64748b" : "rgba(241,245,249,0.4)" }}>
                <Mail size={14} className="text-cyan" />
                <span>ab.khoshbakht@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: isLight ? "#64748b" : "rgba(241,245,249,0.4)" }}>
                <Clock size={14} className="text-cyan" />
                <span>شنبه تا پنج‌شنبه، ۹ الی ۱۸</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-4" style={{ color: isLight ? "#0f172a" : "#f1f5f9" }}>خدمات</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors hover:text-cyan" style={{ color: isLight ? "#64748b" : "rgba(241,245,249,0.5)" }}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-4" style={{ color: isLight ? "#0f172a" : "#f1f5f9" }}>فروشگاه</h3>
            <ul className="space-y-3">
              {footerLinks.store.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors hover:text-cyan" style={{ color: isLight ? "#64748b" : "rgba(241,245,249,0.5)" }}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-4" style={{ color: isLight ? "#0f172a" : "#f1f5f9" }}>لینک‌های مفید</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors hover:text-cyan" style={{ color: isLight ? "#64748b" : "rgba(241,245,249,0.5)" }}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t" style={{ borderColor: isLight ? "rgba(226,232,240,0.8)" : "rgba(30,41,59,0.6)" }}>
        <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: isLight ? "#94a3b8" : "rgba(241,245,249,0.4)" }}>
            © {new Date().getFullYear()} لیان دیزاین. تمامی حقوق محفوظ است.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs transition-colors hover:text-cyan" style={{ color: isLight ? "#94a3b8" : "rgba(241,245,249,0.4)" }}>حریم خصوصی</Link>
            <Link href="/terms" className="text-xs transition-colors hover:text-cyan" style={{ color: isLight ? "#94a3b8" : "rgba(241,245,249,0.4)" }}>شرایط استفاده</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
