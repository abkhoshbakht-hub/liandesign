import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatToman } from "@/lib/format";
import { getCampaignDetail } from "@/lib/data/ads-contract";
import { getCampaignStats } from "@/lib/data/ads-track";
import { getCampaignTargeting } from "@/lib/data/ads-engine";
import { getCategories } from "@/lib/data/websites";
import { logEvent } from "@/lib/analytics";
import DoctorLink from "@/components/analytics/DoctorLink";
import { doctorSiteCampaignUrl } from "@/lib/config";
import { CAMPAIGN_STATUS_FA } from "@/lib/ads/status";
import { PreAcceptButton, OrderButton, CreditPayButton, ProfileForm } from "@/components/advertise/CampaignActions";
import TargetingManager from "@/components/advertise/TargetingManager";

export const metadata: Metadata = {
  title: "جزئیات کمپین",
  robots: { index: false, follow: false },
};

const STEPS = [
  "در حال بررسی",
  "در انتظار پرداخت",
  "پرداخت دریافت شد",
  "در انتظار تأیید نهایی",
  "قرارداد تأیید شد",
  "تبلیغ آماده انتشار",
  "تبلیغ فعال شد",
];

const STEP_INDEX: Record<string, number> = {
  PENDING_REVIEW: 0,
  APPROVED: 0,
  PRE_ACCEPTED: 0,
  PAYMENT_PENDING: 1,
  PAYMENT_RECEIVED: 2,
  FINAL_APPROVAL_PENDING: 3,
  FINAL_APPROVED: 4,
  EFFECTIVE: 4,
  SCHEDULED: 5,
  ACTIVE: 6,
  PAUSED: 6,
  COMPLETED: 6,
};

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  let detail;
  try {
    detail = await getCampaignDetail(params.id);
  } catch {
    return notFound();
  }
  if (!detail) notFound();

  const stepIdx = STEP_INDEX[detail.status] ?? -1;
  const hasContract = detail.contracts.length > 0;
  const stats = await getCampaignStats(detail.id);
  await logEvent("service_upsell_view", { campaignId: detail.id });
  const editableTargeting = detail.status === "DRAFT" || detail.status === "PENDING_REVIEW";
  const targeting = editableTargeting ? await getCampaignTargeting(detail.id) : null;
  const categories = editableTargeting ? await getCategories() : [];

  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6 max-w-3xl">
        <Link href="/advertise/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 hover:text-cyan transition-colors mb-8">
          <ArrowRight size={14} />
          کمپین‌های من
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          <h1 className="text-2xl md:text-3xl font-lalezar text-gray-900 dark:text-white">{detail.title}</h1>
          <Badge variant={detail.status === "ACTIVE" ? "default" : "gold"} className="mr-auto">
            {CAMPAIGN_STATUS_FA[detail.status] ?? detail.status}
          </Badge>
        </div>

        {stepIdx >= 0 && (
          <Card className="p-5 mb-6">
            <div className="flex items-center gap-1">
              {STEPS.map((s, i) => (
                <div key={s} className="flex-1 text-center">
                  <div className={`h-1.5 rounded-full ${i <= stepIdx ? "bg-cyan" : "bg-gray-200 dark:bg-white/10"}`} />
                  <div className={`text-[9px] mt-2 leading-tight ${i <= stepIdx ? "text-gray-900 dark:text-white font-bold" : "text-gray-400 dark:text-white/30"}`}>{s}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-5 mb-6">
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { v: stats.impressions.toLocaleString("fa-IR"), l: "نمایش" },
              { v: stats.clicks.toLocaleString("fa-IR"), l: "کلیک" },
              { v: `${stats.ctr.toLocaleString("fa-IR")}٪`, l: "CTR" },
              { v: stats.conversions.toLocaleString("fa-IR"), l: "تبدیل" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-lg font-bold text-gray-900 dark:text-white font-jakarta">{s.v}</div>
                <div className="text-[10px] text-gray-400 dark:text-white/30 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="p-5">
            <div className="text-xs font-bold text-gray-500 dark:text-white/40 mb-3">مشخصات</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500 dark:text-white/40">بودجه</span><span className="text-gray-900 dark:text-white font-jakarta font-bold">{formatToman(detail.budget)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-white/40">آیتم‌ها</span><span className="text-gray-900 dark:text-white font-jakarta">{detail.items.length.toLocaleString("fa-IR")}</span></div>
              {detail.order && (
                <div className="flex justify-between"><span className="text-gray-500 dark:text-white/40">سفارش</span><span className="text-gray-900 dark:text-white font-jakarta" dir="ltr">{detail.order.number}</span></div>
              )}
            </div>
          </Card>
          <Card className="p-5">
            <div className="text-xs font-bold text-gray-500 dark:text-white/40 mb-3">مشخصات تبلیغ‌دهنده</div>
            <ProfileForm company={detail.advertiser.company} phone={detail.advertiser.phone} />
          </Card>
        </div>

        {detail.status === "APPROVED" && (
          <Card className="p-5 mb-6 space-y-4">
            <div className="text-sm font-bold text-gray-900 dark:text-white">خلاصه قرارداد (پذیرش اولیه)</div>
            <div className="text-xs text-gray-500 dark:text-white/50 leading-relaxed">
              کمپین «{detail.title}» با بودجه {formatToman(detail.budget)} و {detail.items.length.toLocaleString("fa-IR")} آیتم.
              با پذیرش، سفارش پرداخت ثبت و سپس قرارداد نهایی جهت تأیید ارسال می‌شود.
            </div>
            <Link href={`/advertise/campaigns/${detail.id}/contract`} className="inline-flex items-center gap-2 text-xs text-cyan hover:underline">
              <FileText size={13} />
              مشاهده متن کامل قرارداد
            </Link>
            <PreAcceptButton id={detail.id} />
          </Card>
        )}

        {detail.status === "PAYMENT_PENDING" && (
          <Card className="p-5 mb-6 space-y-4">
            <div className="text-sm font-bold text-gray-900 dark:text-white">پرداخت</div>
            <p className="text-xs text-gray-500 dark:text-white/50 leading-relaxed">
              مبلغ قابل پرداخت: <span className="text-gray-900 dark:text-white font-jakarta font-bold">{formatToman(detail.budget)}</span>.
              سفارش را ثبت کنید، پرداخت را انجام دهید؛ وضعیت سفارش در «سفارش‌های من» قابل پیگیری است.
            </p>
            <OrderButton id={detail.id} />
            {detail.order && detail.order.status === "PENDING" && (
              <CreditPayButton orderId={detail.order.id} />
            )}
          </Card>
        )}

        {targeting && (
          <div className="mb-6">
            <TargetingManager
              campaignId={detail.id}
              initialRules={targeting.targeting}
              initialCap={targeting.caps[0]?.limit ?? null}
              categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            />
          </div>
        )}

        {hasContract && detail.status !== "APPROVED" && (
          <Link href={`/advertise/campaigns/${detail.id}/contract`} className="inline-flex items-center gap-2 text-xs text-cyan hover:underline mb-6">
            <FileText size={13} />
            مشاهده قرارداد
          </Link>
        )}

        <Card className="p-5">
          <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">اثربخشی کمپین را بیشتر کنید</div>
          <p className="text-[11px] text-gray-400 dark:text-white/30 mb-4">پیشنهادهای مکمل (اختیاری)</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <Link href="/advertise#services" className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 hover:border-cyan/30 transition-colors">
              <div className="text-xs font-bold text-gray-900 dark:text-white mb-1">لندینگ‌پیج اختصاصی</div>
              <div className="text-[10px] text-gray-500 dark:text-white/40 leading-relaxed">صفحه فرود کمپین = تبدیل بیشتر</div>
            </Link>
            <Link href="/advertise#services" className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 hover:border-cyan/30 transition-colors">
              <div className="text-xs font-bold text-gray-900 dark:text-white mb-1">طراحی بنر حرفه‌ای</div>
              <div className="text-[10px] text-gray-500 dark:text-white/40 leading-relaxed">کریتیو بهتر = کلیک بیشتر</div>
            </Link>
            <DoctorLink
              href={doctorSiteCampaignUrl("campaign-landing")}
              eventProps={{ campaign: "campaign-landing" }}
              className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 hover:border-cyan/30 transition-colors block"
            >
              <div className="text-xs font-bold text-gray-900 dark:text-white mb-1">تحلیل فنی سایت</div>
              <div className="text-[10px] text-gray-500 dark:text-white/40 leading-relaxed">با دکترسایت، مقصد کمپین را بهینه کنید</div>
            </DoctorLink>
          </div>
        </Card>
      </div>
    </section>
  );
}
