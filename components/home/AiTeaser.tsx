import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AiTeaser() {
  return (
    <section className="py-16 bg-gray-100 dark:bg-obsidian-50 border-y border-gray-200 dark:border-white/5">
      <div className="container mx-auto px-6">
        <div className="glass-card p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
            <Sparkles size={22} className="text-gold" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">یابنده هوشمند سایت</h2>
            <p className="text-sm text-gray-500 dark:text-white/50 leading-relaxed">
              به زبان خودتان بگویید چه سایتی می‌خواهید تا ۳ پیشنهاد دقیق از کاتالوگ واقعی بگیرید.
            </p>
          </div>
          <Button asChild className="shrink-0">
            <Link href="/ai-finder">
              امتحان کن
              <ArrowLeft size={14} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
