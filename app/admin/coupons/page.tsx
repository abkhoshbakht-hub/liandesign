import { Card } from "@/components/ui/card";
import { listCoupons } from "@/lib/data/coupons";
import { CouponForm, CouponToggle } from "@/components/admin/CouponControls";

export default async function AdminCoupons() {
  const coupons = await listCoupons();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="text-sm font-bold text-white mb-4">کوپن جدید</div>
        <CouponForm />
      </Card>
      <Card className="p-6">
        <div className="text-sm font-bold text-white mb-4">کوپن‌ها ({coupons.length.toLocaleString("fa-IR")})</div>
        <div className="space-y-3">
          {coupons.length === 0 && <p className="text-xs text-white/30">کوپنی نیست.</p>}
          {coupons.map((c) => (
            <div key={c.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex-1">
                <div className="text-sm font-bold text-white font-jakarta" dir="ltr">{c.code}</div>
                <div className="text-[11px] text-white/40 mt-1">{c.percent.toLocaleString("fa-IR")}٪ تخفیف</div>
              </div>
              <CouponToggle id={c.id} active={c.active} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
