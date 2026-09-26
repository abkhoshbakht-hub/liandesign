import { Package } from "lucide-react";

export default function DigitalTeaser() {
  return (
    <section className="py-16 bg-gray-100 dark:bg-obsidian-50 border-y border-gray-200 dark:border-white/5">
      <div className="container mx-auto px-6">
        <div className="glass-card p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center shrink-0">
            <Package size={22} className="text-cyan" />
          </div>
          <div className="flex-1">
             <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">به‌زودی: فروشگاه دیجیتال</h2>
             <p className="text-sm text-gray-500 dark:text-white/50 leading-relaxed">
              قالب آماده، UI Kit، فایل Figma، لندینگ‌پیج و کامپوننت — برای طراحان و توسعه‌دهندگان. (فاز رشد)
            </p>
          </div>
          <span className="text-[11px] font-bold text-cyan bg-cyan/10 px-4 py-2 rounded-full whitespace-nowrap">
            در راه است
          </span>
        </div>
      </div>
    </section>
  );
}
