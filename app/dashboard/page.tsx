import Link from "next/link";
import { getServerSession } from "next-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { getUserOrders } from "@/lib/data/orders";
import { formatToman } from "@/lib/format";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? "";
  const orders = await getUserOrders(userId);
  const totalSpent = orders
    .filter((o) => o.status === "PAID")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-2xl font-bold text-white font-jakarta">{orders.length.toLocaleString("fa-IR")}</div>
          <div className="text-[11px] text-white/40 mt-1">کل سفارش‌ها</div>
        </Card>
        <Card className="p-5">
          <div className="text-2xl font-bold text-cyan font-jakarta">{formatToman(totalSpent)}</div>
          <div className="text-[11px] text-white/40 mt-1">مبلغ پرداخت‌شده</div>
        </Card>
        <Card className="p-5">
          <div className="text-2xl font-bold text-gold font-jakarta">
            {orders.filter((o) => o.status === "PENDING").length.toLocaleString("fa-IR")}
          </div>
          <div className="text-[11px] text-white/40 mt-1">در انتظار پرداخت</div>
        </Card>
      </div>

      <Card className="p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle>آخرین سفارش‌ها</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-white/40 mb-4">هنوز سفارشی ثبت نکرده‌اید.</p>
              <Button asChild>
                <Link href="/websites">مشاهده سایت‌ها</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 3).map((o) => (
                <div key={o.id} className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-4 text-sm">
                  <span className="text-white font-jakarta" dir="ltr">{o.number}</span>
                  <span className="text-cyan font-jakarta">{formatToman(o.total)}</span>
                </div>
              ))}
              <div className="pt-2">
                <Button asChild variant="secondary" size="sm">
                  <Link href="/dashboard/orders">همه سفارش‌ها</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
