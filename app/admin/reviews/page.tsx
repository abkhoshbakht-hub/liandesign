import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listReviewsAdmin } from "@/lib/data/admin";
import ReviewModerate from "@/components/admin/ReviewModerate";

export default async function AdminReviews({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status =
    searchParams.status === "APPROVED" || searchParams.status === "REJECTED" ? searchParams.status : "PENDING";
  const reviews = await listReviewsAdmin(status);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-sm font-bold text-white">نظرات — {status === "PENDING" ? "در انتظار" : status === "APPROVED" ? "تأییدشده" : "ردشده"}</div>
        <div className="mr-auto flex gap-2 text-[11px]">
          <a href="/admin/reviews?status=PENDING" className="text-cyan hover:underline">در انتظار</a>
          <a href="/admin/reviews?status=APPROVED" className="text-white/40 hover:text-cyan">تأییدشده</a>
          <a href="/admin/reviews?status=REJECTED" className="text-white/40 hover:text-cyan">ردشده</a>
        </div>
      </div>
      <div className="space-y-3">
        {reviews.length === 0 && <p className="text-xs text-white/30">نظری نیست.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={12} className={i <= r.rating ? "text-gold" : "text-white/20"} fill="currentColor" />
                ))}
              </span>
              <span className="text-xs font-bold text-white">{r.user.name ?? r.user.email}</span>
              {r.verified && <Badge>خرید تأییدشده</Badge>}
              <span className="mr-auto"><ReviewModerate id={r.id} /></span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">{r.comment}</p>
            <p className="text-[10px] text-white/30 mt-2">برای: {r.website?.name ?? r.product?.name ?? "—"}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
