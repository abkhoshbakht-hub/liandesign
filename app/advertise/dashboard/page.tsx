import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authOptions } from "@/lib/auth";
import { listMyCampaignsWithStats, getAdvertiserOverview } from "@/lib/data/ads-engine";
import { formatToman } from "@/lib/format";
import { CAMPAIGN_STATUS_FA } from "@/lib/ads/status";

export const metadata: Metadata = {
  title: "کمپین‌های من",
  robots: { index: false, follow: false },
};

export default async function MyCampaignsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/advertise/dashboard");

  const [campaigns, overview] = await Promise.all([listMyCampaignsWithStats(), getAdvertiserOverview()]);

  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="flex items-center mb-8">
          <h1 className="text-3xl font-lalezar text-gray-900 dark:text-white">کمپین‌های من</h1>
          <Link
            href="/advertise/new"
            className="mr-auto inline-flex items-center gap-2 bg-cyan text-obsidian px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            کمپین جدید
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { v: formatToman(overview.spend), l: "هزینه کل" },
            { v: overview.impressions.toLocaleString("fa-IR"), l: "نمایش کل" },
            { v: `${overview.active.toLocaleString("fa-IR")} از ${overview.campaigns.toLocaleString("fa-IR")}`, l: "کمپین فعال" },
            { v: formatToman(overview.balance), l: "موجودی کردیت" },
          ].map((s) => (
            <Card key={s.l} className="p-4 text-center">
              <div className="text-base font-bold text-gray-900 dark:text-white font-jakarta">{s.v}</div>
              <div className="text-[10px] text-gray-400 dark:text-white/30 mt-1">{s.l}</div>
            </Card>
          ))}
        </div>
        <div className="space-y-3">
          {campaigns.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-xs text-gray-500 dark:text-white/40 mb-4">هنوز کمپینی نساخته‌اید.</p>
              <Link href="/advertise/new" className="text-sm text-cyan hover:underline">
                ساخت اولین کمپین
              </Link>
            </Card>
          )}
          {campaigns.map((c) => (
            <Link key={c.id} href={`/advertise/campaigns/${c.id}`}>
              <Card className="p-4 hover:border-cyan/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{c.title}</div>
                    <div className="text-[11px] text-gray-400 dark:text-white/30 mt-1">
                      {c._count.items.toLocaleString("fa-IR")} آیتم
                    </div>
                  </div>
                  <Badge variant={c.status === "ACTIVE" ? "default" : "gold"}>
                    {CAMPAIGN_STATUS_FA[c.status] ?? c.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { v: c.stats.impressions.toLocaleString("fa-IR"), l: "نمایش" },
                    { v: c.stats.clicks.toLocaleString("fa-IR"), l: "کلیک" },
                    { v: `${c.stats.ctr.toLocaleString("fa-IR")}٪`, l: "CTR" },
                    { v: formatToman(c.spend), l: "هزینه" },
                  ].map((s) => (
                    <div key={s.l} className="bg-gray-100 dark:bg-white/5 rounded-lg py-2">
                      <div className="text-xs font-bold text-gray-900 dark:text-white font-jakarta">{s.v}</div>
                      <div className="text-[9px] text-gray-400 dark:text-white/30 mt-0.5">{s.l}</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-white/30 mt-2">
                  <span>بودجه: <span className="font-jakarta">{formatToman(c.budget)}</span></span>
                  <span>باقیمانده: <span className="font-jakarta">{formatToman(c.remaining)}</span></span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
