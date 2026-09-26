import { Star, BadgeCheck } from "lucide-react";
import { getApprovedReviews, getRatingSummary } from "@/lib/data/reviews";

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={13} className={i <= Math.round(n) ? "text-gold" : "text-white/20"} fill="currentColor" />
      ))}
    </span>
  );
}

export default async function ReviewList({
  websiteId,
  productId,
}: {
  websiteId?: string;
  productId?: string;
}) {
  const [summary, reviews] = await Promise.all([
    getRatingSummary({ websiteId, productId }),
    getApprovedReviews({ websiteId, productId }),
  ]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-lg font-bold text-white">نظرات خریداران</h2>
        {summary.count > 0 ? (
          <span className="flex items-center gap-2 text-xs text-white/50">
            <Stars n={summary.avg} />
            {summary.avg.toLocaleString("fa-IR", { maximumFractionDigits: 1 })} از{" "}
            {summary.count.toLocaleString("fa-IR")} نظر
          </span>
        ) : (
          <span className="text-xs text-white/30">هنوز نظری ثبت نشده است</span>
        )}
      </div>
      {reviews.length > 0 && (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="glass-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Stars n={r.rating} />
                <span className="text-xs font-bold text-white">{r.user.name ?? "کاربر"}</span>
                {r.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-cyan">
                    <BadgeCheck size={12} />
                    خرید تأییدشده
                  </span>
                )}
              </div>
              <p className="text-sm text-white/60 leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
