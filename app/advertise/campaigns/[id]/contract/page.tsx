import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formatToman } from "@/lib/format";
import { logEvent } from "@/lib/analytics";
import { getCampaignDetail } from "@/lib/data/ads-contract";
import PrintButton from "@/components/advertise/PrintButton";

export const metadata: Metadata = {
  title: "قرارداد تبلیغات",
  robots: { index: false, follow: false },
};

export default async function ContractPage({ params }: { params: { id: string } }) {
  let detail;
  try {
    detail = await getCampaignDetail(params.id);
  } catch {
    return notFound();
  }
  if (!detail) notFound();
  const session = await getServerSession(authOptions);
  await logEvent(
    "contract_viewed",
    { campaignId: params.id },
    (session?.user as { id?: string } | undefined)?.id
  );

  const latest = detail.contracts[0]?.versions[0];
  const finalSnap = latest?.snapshots.find((s) => s.final) ?? latest?.snapshots[0];
  const payload = (finalSnap?.payload ?? null) as {
    campaign?: { title?: string; budget?: number; pricingModel?: string };
    items?: { kind?: string; keyword?: string; bid?: number; price?: number }[];
    advertiser?: { company?: string | null; phone?: string | null };
    policy?: { version?: string; title?: string } | null;
    issuedAt?: string;
  } | null;

  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="flex items-center mb-8 print:hidden">
          <Link href={`/advertise/campaigns/${params.id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 hover:text-cyan transition-colors">
            <ArrowRight size={14} />
            بازگشت به کمپین
          </Link>
          <span className="mr-auto"><PrintButton /></span>
        </div>

        <Card className="p-8 relative overflow-hidden">
          <div className="absolute top-6 left-6">
            <Badge variant={finalSnap?.final ? "default" : "gold"}>
              {finalSnap?.final ? "قرارداد نهایی" : "پیش‌نویس / پذیرش اولیه"}
            </Badge>
          </div>
          <h1 className="text-2xl font-lalezar text-gray-900 dark:text-white mb-1 mt-8">قرارداد تبلیغات لیان دیزاین</h1>
          <p className="text-[11px] text-gray-400 dark:text-white/30 mb-6 font-jakarta" dir="ltr">
            {finalSnap ? `hash: ${finalSnap.hash.slice(0, 24)}…` : "بدون اسنپشات"}
          </p>

          {!payload ? (
            <p className="text-xs text-gray-500 dark:text-white/40">هنوز قراردادی برای این کمپین ثبت نشده است.</p>
          ) : (
            <div className="space-y-5 text-sm">
              <div>
                <div className="text-xs font-bold text-gray-500 dark:text-white/40 mb-1">کمپین</div>
                <div className="text-gray-900 dark:text-white font-bold">{payload.campaign?.title}</div>
                <div className="text-gray-600 dark:text-white/60 font-jakarta">{payload.campaign?.budget ? formatToman(payload.campaign.budget) : ""}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 dark:text-white/40 mb-1">آیتم‌ها ({(payload.items ?? []).length.toLocaleString("fa-IR")})</div>
                <ul className="space-y-1 text-gray-600 dark:text-white/60 text-xs">
                  {(payload.items ?? []).map((i, idx) => (
                    <li key={idx}>{i.kind}{i.keyword ? ` — کلیدواژه: ${i.keyword}` : ""}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 dark:text-white/40 mb-1">تبلیغ‌دهنده</div>
                <div className="text-gray-600 dark:text-white/60 text-xs">{payload.advertiser?.company ?? "—"} — <span className="font-jakarta" dir="ltr">{payload.advertiser?.phone ?? "—"}</span></div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 dark:text-white/40 mb-1">سیاست حاکم</div>
                <div className="text-gray-600 dark:text-white/60 text-xs">{payload.policy?.title ?? "—"} (نسخه {payload.policy?.version ?? "—"})</div>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-white/30 leading-relaxed border-t border-gray-200 dark:border-white/10 pt-4">
                این سند از اسنپشات ثبت‌شده تولید شده و پس از تأیید نهایی غیرقابل تغییر است.
                پرداخت موفق به‌معنای قرارداد مؤثر نیست؛ اثربخشی منوط به تأیید نهایی است.
              </p>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
