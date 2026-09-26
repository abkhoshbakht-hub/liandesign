import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CREATIVE_STATUS_FA } from "@/lib/ads/creative";
import { listCreativesAdmin } from "@/lib/data/ads-contract";
import CreativeReview from "@/components/admin/CreativeReview";

export default async function AdsCreatives({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status =
    searchParams.status === "APPROVED" || searchParams.status === "REJECTED" ? searchParams.status : "PENDING";
  const creatives = await listCreativesAdmin(status);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-sm font-bold text-white">
          کریتیوها — {status === "PENDING" ? "در انتظار بررسی" : status === "APPROVED" ? "تأییدشده" : "ردشده"}
        </div>
        <div className="mr-auto flex gap-2 text-[11px]">
          <a href="/admin/advertising/creatives?status=PENDING" className="text-cyan hover:underline">در انتظار</a>
          <a href="/admin/advertising/creatives?status=APPROVED" className="text-white/40 hover:text-cyan">تأییدشده</a>
          <a href="/admin/advertising/creatives?status=REJECTED" className="text-white/40 hover:text-cyan">ردشده</a>
        </div>
      </div>
      <div className="space-y-3">
        {creatives.length === 0 && <p className="text-xs text-white/30">کریتیوی نیست.</p>}
        {creatives.map((c) => (
          <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-white font-jakarta" dir="ltr">{c.kind}</span>
              <Badge variant={c.status === "APPROVED" ? "default" : "gold"}>
                {CREATIVE_STATUS_FA[c.status] ?? c.status}
              </Badge>
              <span className="mr-auto"><CreativeReview id={c.id} /></span>
            </div>
            {c.linkUrl && (
              <a href={c.linkUrl} target="_blank" rel="noreferrer" className="text-[11px] text-cyan hover:underline font-jakarta" dir="ltr">
                {c.linkUrl}
              </a>
            )}
            <p className="text-[10px] text-white/30 mt-1">کمپین: {c.campaign.title}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
