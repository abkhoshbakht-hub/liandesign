import { getServerSession } from "next-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { authOptions } from "@/lib/auth";
import { getUserOrders } from "@/lib/data/orders";
import { formatToman } from "@/lib/format";
import RefundButton from "@/components/dashboard/RefundButton";

const STATUS_FA: Record<string, string> = {
  PENDING: "در انتظار پرداخت",
  PROCESSING: "در حال پردازش",
  PAID: "پرداخت شده",
  FAILED: "ناموفق",
  REFUNDED: "مسترد شده",
  CANCELLED: "لغو شده",
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? "";
  const orders = await getUserOrders(userId);

  return (
    <Card className="p-6">
      <CardHeader className="p-0 mb-4">
        <CardTitle>سفارش‌های من</CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        {orders.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-8">سفارشی وجود ندارد.</p>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                <span className="text-xs text-white/40 font-jakarta" dir="ltr">{o.number}</span>
                <Badge variant={o.status === "PAID" ? "default" : "gold"}>
                  {STATUS_FA[o.status] ?? o.status}
                </Badge>
              </div>
              <div className="space-y-2 mb-3">
                {o.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-white">
                      {item.website?.name ?? item.product?.name ?? "آیتم"}{" "}
                      <span className="text-white/40">— {item.product ? "محصول دیجیتال" : `پکیج ${item.packageName}`}</span>
                    </span>
                    <span className="text-cyan font-jakarta">{formatToman(item.price)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 text-sm">
                <span className="text-white/50">جمع کل:</span>
                <span className="font-bold text-white font-jakarta">{formatToman(o.total)}</span>
              </div>
              {o.status === "PAID" && (
                <div className="mt-3">
                  <RefundButton orderId={o.id} />
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
