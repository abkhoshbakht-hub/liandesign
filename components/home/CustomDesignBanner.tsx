import Link from "next/link";
import { ArrowLeft, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomDesignBanner() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-obsidian">
      <div className="container mx-auto px-6">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/15 via-obsidian to-gold/10"></div>
          <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="w-14 h-14 rounded-2xl bg-cyan/10 flex items-center justify-center shrink-0">
              <PenTool size={26} className="text-cyan" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3">سایت آماده جواب نداد؟ اختصاصی بسازید</h2>
              <p className="text-sm text-gray-500 dark:text-white/50 leading-relaxed max-w-xl">
                فرم بریف را پر کنید — نوع کسب‌وکار، صفحات، امکانات و بودجه — تا طرح اختصاصی شما ساخته شود.
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <Link href="/contact">
                درخواست طراحی اختصاصی
                <ArrowLeft size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
