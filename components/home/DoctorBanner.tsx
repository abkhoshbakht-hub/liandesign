import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import DoctorLink from "@/components/analytics/DoctorLink";
import { doctorSiteCampaignUrl } from "@/lib/config";

// Outbound-only: analysis lives in Doctor Site (separate product).
export default function DoctorBanner() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-obsidian">
      <div className="container mx-auto px-6">
        <div className="glass-card p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6 border-cyan/20">
          <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center shrink-0">
            <Stethoscope size={22} className="text-cyan" />
          </div>
          <div className="flex-1">
             <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">قبل از خرید، از کیفیت فنی مطمئن شوید</h2>
             <p className="text-sm text-gray-500 dark:text-white/50 leading-relaxed">
              وضعیت سرعت، سئو و تجربه کاربری هر سایت را در دکتر سایت بررسی کنید — مرجع تخصصی تحلیل سایت.
            </p>
          </div>
          <Button asChild variant="secondary" size="lg" className="shrink-0">
            <DoctorLink href={doctorSiteCampaignUrl("website-quality")} eventProps={{ campaign: "website-quality" }}>
              بررسی در دکتر سایت
            </DoctorLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
