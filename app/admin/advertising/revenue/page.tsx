import { Card } from "@/components/ui/card";
import { formatToman } from "@/lib/format";
import { getAdsRevenue } from "@/lib/data/ads-track";
import { CAMPAIGN_STATUS_FA } from "@/lib/ads/status";

export default async function AdsRevenue() {
  const r = await getAdsRevenue();

  const cards = [
    { label: "درآمد کل تبلیغات", value: formatToman(r.total) },
    { label: "درآمد امروز", value: formatToman(r.today) },
    { label: "درآمد این ماه", value: formatToman(r.month) },
    { label: "ایمپرشن (سالم)", value: r.impressions.toLocaleString("fa-IR") },
    { label: "کلیک (سالم)", value: r.clicks.toLocaleString("fa-IR") },
    { label: "CTR", value: `${r.ctr.toLocaleString("fa-IR")}٪` },
    { label: "ARPA", value: formatToman(r.arpa) },
    { label: "RPM", value: formatToman(r.rpm) },
    { label: "Fill Rate", value: `${r.fillRate.toLocaleString("fa-IR")}٪` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="text-lg font-bold text-white font-jakarta">{c.value}</div>
            <div className="text-[11px] text-white/40 mt-1">{c.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="text-sm font-bold text-white mb-4">درآمد بر اساس مدل</div>
          <div className="space-y-2">
            {r.byModel.map((m) => (
              <div key={m.pricingModel} className="flex justify-between text-sm">
                <span className="text-white/50 font-jakarta" dir="ltr">{m.pricingModel}</span>
                <span className="text-white font-jakarta">{formatToman(m._sum.budget ?? 0)}</span>
              </div>
            ))}
            {r.byModel.length === 0 && <p className="text-xs text-white/30">داده‌ای نیست.</p>}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-bold text-white mb-4">آیتم بر اساس پلیسمنت</div>
          <div className="space-y-2">
            {r.byPlacement.map((p) => (
              <div key={p.placementId} className="flex justify-between text-sm">
                <span className="text-white/50 font-jakarta" dir="ltr">{p.placementId}</span>
                <span className="text-white font-jakarta">{p._count.placementId.toLocaleString("fa-IR")} آیتم</span>
              </div>
            ))}
            {r.byPlacement.length === 0 && <p className="text-xs text-white/30">داده‌ای نیست.</p>}
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="text-sm font-bold text-white mb-4">درآمد به‌تفکیک تبلیغ‌دهنده</div>
          <div className="space-y-2">
            {r.revenueByAdvertiser.map((a) => (
              <div key={a.name} className="flex justify-between text-sm">
                <span className="text-white/50">{a.name}</span>
                <span className="text-white font-jakarta">{formatToman(a.revenue)}</span>
              </div>
            ))}
            {r.revenueByAdvertiser.length === 0 && <p className="text-xs text-white/30">داده‌ای نیست.</p>}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-bold text-white mb-4">درآمد به‌تفکیک مدل (CPM/CPC/...)</div>
          <div className="space-y-2">
            {r.revenueByModel.map((m) => (
              <div key={m.model} className="flex justify-between text-sm">
                <span className="text-white/50 font-jakarta" dir="ltr">{m.model}</span>
                <span className="text-white font-jakarta">{formatToman(m.revenue)}</span>
              </div>
            ))}
            {r.revenueByModel.length === 0 && <p className="text-xs text-white/30">داده‌ای نیست.</p>}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="text-sm font-bold text-white mb-4">کمپین‌ها ({r.campaigns.length.toLocaleString("fa-IR")})</div>
        <div className="space-y-2">
          {r.campaigns.map((c) => (
            <div key={c.id} className="flex justify-between text-sm bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
              <span className="text-white/60">{c.title} <span className="text-white/30">({CAMPAIGN_STATUS_FA[c.status] ?? c.status})</span></span>
              <span className="text-white font-jakarta">{formatToman(c.budget)}</span>
            </div>
          ))}
          {r.campaigns.length === 0 && <p className="text-xs text-white/30">کمپینی نیست.</p>}
        </div>
      </Card>
    </div>
  );
}
