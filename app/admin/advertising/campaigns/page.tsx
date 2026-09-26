import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listCampaignsAdmin } from "@/lib/data/ads-engine";
import { CAMPAIGN_STATUS_FA as STATUS_FA } from "@/lib/ads/status";
import CampaignActions from "@/components/admin/CampaignActions";
import CampaignBudget from "@/components/admin/CampaignBudget";

export default async function AdsCampaigns({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const campaigns = await listCampaignsAdmin(searchParams.status || undefined);

  return (
    <Card className="p-6">
      <div className="text-sm font-bold text-white mb-4">کمپین‌ها ({campaigns.length.toLocaleString("fa-IR")})</div>
      <div className="space-y-3">
        {campaigns.length === 0 && <p className="text-xs text-white/30">کمپینی نیست.</p>}
        {campaigns.map((c) => (
          <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="text-sm font-bold text-white">{c.title}</span>
              <Badge variant={c.status === "ACTIVE" ? "default" : "gold"}>
                {STATUS_FA[c.status] ?? c.status}
              </Badge>
              <span className="mr-auto"><CampaignActions id={c.id} status={c.status} /></span>
            </div>
            <div className="text-[11px] text-white/40">
              {c.advertiser.company ?? "—"} — {c._count.items.toLocaleString("fa-IR")} آیتم —{" "}
              {c._count.allocations.toLocaleString("fa-IR")} تخصیص
            </div>
            {(c.status === "DRAFT" || c.status === "PENDING_REVIEW") && (
              <div className="mt-3">
                <CampaignBudget id={c.id} budget={c.budget} />
              </div>
            )}
            {c.note && <p className="text-[11px] text-white/50 mt-2 leading-relaxed">درخواست: {c.note}</p>}
          </div>
        ))}
      </div>
    </Card>
  );
}
