import { Stethoscope } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DoctorLink from "@/components/analytics/DoctorLink";
import { doctorSiteAuditUrl } from "@/lib/config";

// Outbound-only integration: Lian never analyzes here.
// All audits, scores and comparisons live in Doctor Site (separate product).
export default function DoctorCta({
  websiteId,
  websiteName,
}: {
  websiteId?: string;
  websiteName?: string;
}) {
  return (
    <Card className="border-cyan/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope size={18} className="text-cyan" />
          بررسی تخصصی قبل از خرید
        </CardTitle>
        <CardDescription>
          می‌خواهید بدانید {websiteName ? `«${websiteName}»` : "این سایت"} از نظر کیفیت فنی،
          سرعت، SEO و تجربه کاربری در چه وضعیتی قرار دارد؟
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="secondary">
          <DoctorLink href={doctorSiteAuditUrl({ websiteId })} eventProps={websiteId ? { websiteId } : {}}>
            بررسی در دکتر سایت
          </DoctorLink>
        </Button>
        <p className="text-[10px] text-white/30 mt-3">
          تحلیل تخصصی در دکتر سایت انجام می‌شود و نتیجه را همان‌جا می‌بینید.
        </p>
      </CardContent>
    </Card>
  );
}
