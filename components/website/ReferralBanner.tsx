import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { getReferral } from "@/lib/referral";

// Shown when the visitor arrives from Doctor Site (redesign funnel).
export default function ReferralBanner() {
  const ref = getReferral();
  if (!ref || ref.source !== "doctor-site") return null;

  return (
    <div className="glass-card p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 border-cyan/20">
      <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center shrink-0">
        <Stethoscope size={18} className="text-cyan" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-bold text-white">از دکتر سایت آمدید؟ جای درستی هستید</div>
        <div className="text-xs text-white/50 mt-1">
          این سایت‌ها برای بازطراحی آماده‌اند — ببینید، شخصی‌سازی کنید و بخرید.
        </div>
      </div>
      <Link href="/websites" className="text-xs font-bold text-cyan hover:underline whitespace-nowrap">
        مشاهده همه
      </Link>
    </div>
  );
}
