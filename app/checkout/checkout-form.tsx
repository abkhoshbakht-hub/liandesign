"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatToman } from "@/lib/format";
import { placeOrder } from "@/lib/data/orders";
import { validateCoupon } from "@/lib/data/coupons";

export default function CheckoutForm({ total }: { total: number }) {
  const router = useRouter();
  const [coupon, setCoupon] = useState("");
  const [percent, setPercent] = useState<number | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discount = percent ? Math.round((total * percent) / 100) : 0;

  async function onApplyCoupon() {
    setCouponMsg(null);
    const res = await validateCoupon(coupon);
    if (!res.ok) {
      setPercent(null);
      setCouponMsg(res.error);
    } else {
      setPercent(res.percent);
      setCouponMsg(`تخفیف ${res.percent.toLocaleString("fa-IR")}٪ اعمال شد`);
    }
  }

  async function onSubmit() {
    setLoading(true);
    setError(null);
    const res = await placeOrder(percent ? coupon.trim() : undefined);
    if (res.ok) {
      router.push(`/checkout/success?number=${encodeURIComponent(res.number)}`);
    } else if (res.error === "LOGIN_REQUIRED") {
      router.push("/login?callbackUrl=/checkout");
    } else if (res.error === "EMPTY") {
      setError("سبد خرید خالی است");
    } else {
      setError(res.error);
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Tag size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
          <Input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="کد تخفیف (اختیاری)"
            className="pr-9 font-jakarta"
            dir="ltr"
          />
        </div>
        <Button type="button" variant="secondary" onClick={onApplyCoupon}>
          اعمال
        </Button>
      </div>
      {couponMsg && (
        <p className={`text-[11px] mb-4 ${percent ? "text-cyan" : "text-red-400"}`}>{couponMsg}</p>
      )}
      {discount > 0 && (
        <div className="flex justify-between text-sm mb-4">
          <span className="text-white/50">تخفیف:</span>
          <span className="text-gold font-jakarta">−{formatToman(discount)}</span>
        </div>
      )}
      {error && <p className="text-xs text-red-400 mb-4">{error}</p>}
      <Button className="w-full" size="lg" disabled={loading} onClick={onSubmit}>
        {loading ? "در حال ثبت..." : `ثبت سفارش — ${formatToman(total - discount)}`}
      </Button>
      <p className="text-[11px] text-white/30 mt-3 leading-relaxed">
        پرداخت آنلاین درگاه در فاز بعد فعال می‌شود؛ سفارش شما ثبت و توسط تیم بررسی می‌شود.
      </p>
    </div>
  );
}
