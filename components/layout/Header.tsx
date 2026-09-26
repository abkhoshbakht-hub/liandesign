"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { m, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

const navLinks: { href: string; label: string; children?: { href: string; label: string }[] }[] = [
  { href: "/", label: "خانه" },
  { href: "/websites", label: "نمونه کارها" },
  { href: "/store", label: "فروشگاه دیجیتال" },
  { href: "/services", label: "خدمات" },
  { href: "/pricing", label: "تعرفه", children: [
    { href: "/pricing", label: "تعرفه طراحی سایت" },
    { href: "/estimator", label: "محاسبه‌گر هزینه" },
  ]},
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && theme === "light";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b transition-colors" style={{ backgroundColor: isLight ? "rgba(255,255,255,0.95)" : "rgba(5,8,20,0.95)", borderColor: isLight ? "rgba(226,232,240,0.8)" : "rgba(30,41,59,0.6)" }}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-24">
          {/* راست: لوگو */}
          <Link href="/" className="flex items-center py-2 shrink-0">
            <Image src="/images/liandesign.logo.png" alt="لیان دیزاین" width={1312} height={1199} priority style={{ height: "90px", width: "auto" }} />
          </Link>

          {/* وسط: منوها */}
          <nav className="hidden lg:flex items-center justify-center gap-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {navLinks.map((link) => (
              link.children ? (
                <div key={link.href} className="relative group/p pricing-dropdown">
                  <span className="text-sm font-medium transition-colors duration-300 hover:text-cyan cursor-pointer flex items-center gap-1" style={{ color: isLight ? "#334155" : "rgba(241,245,249,0.85)" }}>
                    {link.label}
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="mt-0.5"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <div className="absolute top-full right-0 pt-3 w-56 opacity-0 invisible group-hover/p:opacity-100 group-hover/p:visible transition-all duration-200 z-50" style={{ backgroundColor: isLight ? "#ffffff" : "rgba(5,8,20,0.95)", borderColor: isLight ? "rgba(226,232,240,0.8)" : "rgba(30,41,59,0.6)" }}>
                    <div className="rounded-xl border shadow-lg overflow-hidden py-1" style={{ backgroundColor: isLight ? "#ffffff" : "rgba(5,8,20,0.95)", borderColor: isLight ? "rgba(226,232,240,0.8)" : "rgba(30,41,59,0.6)" }}>
                      {link.children.map((child) => (
                        <Link key={child.href} href={child.href} className="block px-4 py-2.5 text-sm font-medium transition-colors hover:text-cyan" style={{ color: isLight ? "#334155" : "rgba(241,245,249,0.85)" }}>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={link.href} href={link.href} className="text-sm font-medium transition-colors duration-300 hover:text-cyan" style={{ color: isLight ? "#334155" : "rgba(241,245,249,0.85)" }}>
                  {link.label}
                </Link>
              )
            ))}
          </nav>

          {/* چپ: اکشن‌ها */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <ThemeToggle />
            <Link href="/checkout" title="سبد خرید" className="transition-colors hover:text-cyan" style={{ color: isLight ? "#334155" : "rgba(241,245,249,0.85)" }}>
              <ShoppingCart size={18} />
            </Link>
            <Link href="/login" className="text-sm font-medium transition-colors duration-300 hover:text-cyan" style={{ color: isLight ? "#334155" : "rgba(241,245,249,0.85)" }}>
              ورود
            </Link>
            <Link href="/contact" className="bg-cyan text-obsidian px-5 py-2 rounded-xl text-xs font-bold hover:bg-cyan/90 transition-colors">
              مشاوره رایگان
            </Link>
          </div>

          <button className="lg:hidden" style={{ color: isLight ? "#1e293b" : "#f1f5f9" }} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="lg:hidden overflow-hidden border-t" style={{ backgroundColor: isLight ? "rgba(255,255,255,0.98)" : "rgba(5,8,20,0.98)", borderColor: isLight ? "rgba(226,232,240,0.8)" : "rgba(30,41,59,0.6)" }}>
            <nav className="container mx-auto px-6 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                link.children ? (
                  <div key={link.href}>
                    <button
                      className="text-sm font-medium py-2.5 transition-colors hover:text-cyan flex items-center justify-between w-full text-left"
                      style={{ color: isLight ? "#334155" : "rgba(241,245,249,0.85)" }}
                      onClick={() => setOpenSub(openSub === link.href ? null : link.href)}
                    >
                      <span className="flex items-center gap-1">
                        {link.label}
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`transition-transform duration-200 ${openSub === link.href ? "rotate-180" : ""}`}><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                    </button>
                    {openSub === link.href && (
                      <div className="pr-4 flex flex-col gap-0.5 pb-1">
                        {link.children.map((child) => (
                          <Link key={child.href} href={child.href} className="text-xs py-2 transition-colors hover:text-cyan" style={{ color: isLight ? "#64748b" : "rgba(241,245,249,0.6)" }} onClick={() => { setIsOpen(false); setOpenSub(null); }}>
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link key={link.href} href={link.href} className="text-sm font-medium py-2.5 transition-colors hover:text-cyan" style={{ color: isLight ? "#334155" : "rgba(241,245,249,0.85)" }} onClick={() => setIsOpen(false)}>
                    {link.label}
                  </Link>
                )
              ))}
              <div className="pt-3 mt-3 border-t flex items-center gap-4" style={{ borderColor: isLight ? "rgba(226,232,240,0.8)" : "rgba(30,41,59,0.6)" }}>
                <ThemeToggle />
                <Link href="/login" className="text-sm font-medium py-2.5 transition-colors hover:text-cyan" style={{ color: isLight ? "#334155" : "rgba(241,245,249,0.85)" }} onClick={() => setIsOpen(false)}>
                  ورود / ثبت‌نام
                </Link>
                <Link href="/contact" className="bg-cyan text-obsidian px-5 py-2.5 rounded-xl text-xs font-bold" onClick={() => setIsOpen(false)}>
                  مشاوره رایگان
                </Link>
              </div>
            </nav>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}
