import { LayoutGrid, Shapes, SlidersHorizontal, Headphones } from "lucide-react";
import { getCategories, getPublishedWebsiteCount } from "@/lib/data/websites";

export default async function TrustMetrics() {
  const [categories, websitesCount] = await Promise.all([getCategories(), getPublishedWebsiteCount()]);

  const metrics = [
    { icon: LayoutGrid, value: websitesCount.toLocaleString("fa-IR"), label: "سایت آماده" },
    { icon: Shapes, value: categories.length.toLocaleString("fa-IR"), label: "دسته‌بندی تخصصی" },
    { icon: SlidersHorizontal, value: "کامل", label: "شخصی‌سازی قبل از خرید" },
    { icon: Headphones, value: "همراه", label: "پشتیبانی تا تحویل" },
  ];

  return (
    <section className="bg-gray-100 dark:bg-obsidian-50 border-y border-gray-200 dark:border-white/5">
      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-cyan/10 flex items-center justify-center shrink-0">
                <m.icon size={20} className="text-cyan" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white font-jakarta">{m.value}</div>
                <div className="text-[11px] text-gray-500 dark:text-white/40">{m.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
