import { Star } from "lucide-react";
import { getLatestApprovedReviews } from "@/lib/data/reviews";

export default async function Testimonials() {
  const reviews = await getLatestApprovedReviews(3);
  if (reviews.length === 0) return null;

  return (
    <section className="py-24 bg-gray-50 dark:bg-obsidian">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">نظرات مشتریان</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">خریداران واقعی چه می‌گویند؟</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.id} className="glass-card p-6">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                   <Star key={j} size={14} className={j < r.rating ? "text-gold fill-gold" : "text-gray-400 dark:text-white/20"} />
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-white/60 leading-relaxed mb-6">«{r.comment}»</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cyan/10 rounded-full flex items-center justify-center text-cyan font-bold text-xs">
                  {(r.user.name ?? "ک")[0]}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">{r.user.name ?? "کاربر لیان"}</div>
                  <div className="text-[10px] text-gray-500 dark:text-white/40">
                    خریدار {r.website?.name ?? r.product?.name ?? ""}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
