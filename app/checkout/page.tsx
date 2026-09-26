import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { getCart, cartTotal, removeFromCart } from "@/lib/cart";
import { formatToman } from "@/lib/format";
import CheckoutForm from "./checkout-form";
import RemoveButton from "./remove-button";

export const metadata: Metadata = {
  title: "تسویه حساب",
  description: "سبد خرید و ثبت سفارش در لیان دیزاین",
};

export default async function CheckoutPage() {
  const [session, cart, total] = await Promise.all([
    getServerSession(authOptions),
    getCart(),
    cartTotal(),
  ]);

  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6 max-w-3xl">
        <Link href="/websites" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 hover:text-cyan transition-colors mb-8">
          <ArrowRight size={14} />
          بازگشت به سایت‌ها
        </Link>
        <h1 className="text-4xl font-lalezar text-gray-900 dark:text-white mb-8">تسویه حساب</h1>

        {cart.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-500 dark:text-white/50 text-sm mb-6">سبد خرید شما خالی است.</p>
            <Button asChild>
              <Link href="/websites">مشاهده سایت‌ها</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle>سبد خرید ({cart.length.toLocaleString("fa-IR")} مورد)</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                {cart.map((item) => {
                  const isProduct = item.kind === "product";
                  const href = isProduct ? `/store/${item.productSlug}` : `/websites/${item.websiteSlug}`;
                  const name = isProduct ? item.productName : item.websiteName;
                  const id = (isProduct ? item.productId : item.websiteId) ?? "";
                  return (
                    <div key={`${item.kind}-${id}`} className="flex items-center gap-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">
                      <div className="flex-1">
                        <Link href={href} className="text-sm font-bold text-gray-900 dark:text-white hover:text-cyan transition-colors">
                          {name}
                        </Link>
                        <div className="text-[11px] text-gray-500 dark:text-white/40 mt-1">
                          {isProduct ? "محصول دیجیتال" : `پکیج ${item.packageName}`}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-cyan font-jakarta">{formatToman(item.price)}</div>
                      <RemoveButton websiteId={id} />
                    </div>
                  );
                })}
                <div className="flex justify-between items-center border-t border-gray-200 dark:border-white/10 pt-4">
                  <span className="text-sm text-gray-500 dark:text-white/50">جمع کل:</span>
                  <span className="text-2xl font-bold text-cyan font-jakarta">{formatToman(total)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle>ثبت سفارش</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {session?.user ? (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-white/40 mb-4">
                      سفارش به نام <span className="text-gray-900 dark:text-white font-bold">{session.user.name ?? session.user.email}</span> ثبت می‌شود.
                    </p>
                    <CheckoutForm total={total} />
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-white/40 mb-4">برای ثبت سفارش ابتدا وارد شوید.</p>
                    <Button asChild className="w-full">
                      <Link href="/login?callbackUrl=/checkout">ورود / ثبت‌نام</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
