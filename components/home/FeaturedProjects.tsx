"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { ExternalLink, ArrowLeft } from "lucide-react";

const CATEGORY_ICONS: Record<string, string> = {
  "فروشگاهی": "🛒",
  "شرکتی": "🏢",
  "رستورانی": "🍽️",
  "پزشکی": "🏥",
  "پورتفولیو": "🎨",
  "نرم‌افزاری": "💻",
};

const projects = [
  { id: 1, title: "شرکت آریاتک", category: "شرکتی", framework: "HTML/CSS/JS", speed: "0.6s", lighthouse: 100, href: "#", image: "/previews/thumbs/ariatech.png" },
  { id: 2, title: "بامارکت", category: "فروشگاهی", framework: "React 19 + Vite", speed: "0.9s", lighthouse: 100, href: "/previews/baamarket-demo.html", image: "/previews/thumbs/baamarket.png" },
  { id: 3, title: "لیان", category: "رستورانی", framework: "React 19 + Vite", speed: "0.8s", lighthouse: 100, href: "/previews/lian-demo.html", image: "/previews/thumbs/lian.png" },
  { id: 4, title: "درمانیکا", category: "پزشکی", framework: "React 19 + Vite", speed: "0.8s", lighthouse: 100, href: "/previews/darmanika-demo.html", image: "/previews/thumbs/darmanika.png" },
  { id: 5, title: "گالری امیر", category: "پورتفولیو", framework: "HTML/CSS/JS", speed: "0.5s", lighthouse: 100, href: "#", image: "/previews/thumbs/gallery-amir.png" },
  { id: 6, title: "پلتفرم‌یار", category: "نرم‌افزاری", framework: "Next.js 15 + React 19", speed: "0.7s", lighthouse: 100, href: "/previews/platformyar-demo.html", image: "/previews/thumbs/platformyar.png" },
  { id: 7, title: "کریتیوا", category: "آژانس", framework: "Next.js 15 + React 19", speed: "0.7s", lighthouse: 100, href: "/previews/creativo-demo.html", image: "/previews/thumbs/creativo.png" },
  { id: 8, title: "نوسفر", category: "آژانس", framework: "React 19 + Vite", speed: "0.8s", lighthouse: 100, href: "/previews/novasphere-demo.html", image: "/previews/thumbs/novasphere.png" },
  { id: 9, title: "رها", category: "نرم‌افزاری", framework: "PHP + WordPress", speed: "0.6s", lighthouse: 100, href: "/previews/roha/index.html", image: "/previews/thumbs/roha.png" },
  { id: 10, title: "FreeZone", category: "سامانه", framework: "React 19 + Vite", speed: "0.8s", lighthouse: 100, href: "/previews/freezone-demo.html", image: "/previews/thumbs/freezone.png" },
];

export default function FeaturedProjects() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-obsidian">
      <div className="container mx-auto px-6">
        <m.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="flex items-end justify-between mb-14">
          <div>
            <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">نمونه‌کارها</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">پروژه‌های اخیر ما</h2>
          </div>
          <Link href="/websites" className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 hover:text-cyan transition-colors">
            مشاهده همه
            <ExternalLink size={14} />
          </Link>
        </m.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((project, i) => (
            <m.div key={project.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="group glass-card p-6 hover:border-cyan/30 transition-all duration-300">
              <div className="relative h-32 bg-gray-100 dark:bg-white/5 rounded-xl mb-5 flex items-center justify-center overflow-hidden">
                {project.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <span className="text-3xl opacity-20 group-hover:opacity-40 transition-opacity">{CATEGORY_ICONS[project.category] ?? "💼"}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-bold">{project.category}</span>
                <span className="text-[10px] bg-cyan/10 text-cyan px-2 py-0.5 rounded-full">{project.framework}</span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 group-hover:text-cyan transition-colors">{project.title}</h3>
              <div className="flex items-center gap-4 text-[10px] text-gray-500 dark:text-white/40 mb-4">
                <span>⚡ {project.speed}</span>
                <span>🎯 {project.lighthouse}</span>
              </div>
              <Link href={project.href} className="inline-flex items-center gap-2 text-xs text-cyan/70 hover:text-cyan transition-colors">
                مشاهده پروژه
                <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
              </Link>
            </m.div>
          ))}
        </div>

        <div className="md:hidden mt-6 text-center">
          <Link href="/websites" className="text-sm text-gray-500 dark:text-white/40 hover:text-cyan transition-colors">
            مشاهده همه پروژه‌ها →
          </Link>
        </div>
      </div>
    </section>
  );
}
