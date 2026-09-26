import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCategories } from "@/lib/data/websites";

export default async function Categories() {
  const categories = await getCategories();
  if (categories.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50 dark:bg-obsidian">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">دسته‌بندی‌ها</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">برای چه کسب‌وکاری؟</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/websites/category/${c.slug}`}
              className="group glass-card p-5 text-center hover:border-cyan/30 transition-colors"
            >
              <div className="text-base font-bold text-gray-900 dark:text-white mb-1 group-hover:text-cyan transition-colors">{c.name}</div>
              <div className="text-[11px] text-gray-500 dark:text-white/40">{c._count.websites.toLocaleString("fa-IR")} سایت</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
