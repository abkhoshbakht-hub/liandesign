import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { getOrderByNumber } from "@/lib/data/orders";
import { formatToman } from "@/lib/format";

export const metadata: Metadata = {
  title: "سفارش ثبت شد",
};

const STATUS_FA: Record<string, string> = {
  PENDING: "در انتظار پرداخت",
  PROCESSING: "در حال پردازش",
  PAID: "پرداخت شده",
  FAILED: "ناموفق",
  REFUNDED: "مسترد شده",
  CANCELLED: "لغو شده",
};

export default async function SuccessPage({ searchParams }: { searchParams: { number?: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId || !searchParams.number) notFound();

  const order = await getOrderByNumber(userId, searchParams.number);
  if (!order) notFound();

  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="text-center mb-8">
          <CheckCircle2 size={48} className="text-cyan mx-auto mb-4" />
          <h1 className="text-3xl font-lalezar text-gray-900 dark:text-white mb-2">سفارش شما ثبت شد</h1>
          <p className="text-sm text-gray-500 dark:text-white/40">
            شماره سفارش: <span className="text-cyan font-jakarta" dir="ltr">{order.number}</span>
          </p>
        </div>

        <Card className="p-6 mb-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle>جزئیات سفارش</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-900 dark:text-white">
                  {item.website?.name ?? item.product?.name ?? "آیتم"}{" "}
                  <span className="text-gray-500 dark:text-white/40">— {item.product ? "محصول دیجیتال" : `پکیج ${item.packageName}`}</span>
                </span>
                <span className="text-cyan font-jakarta">{formatToman(item.price)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-gray-200 dark:border-white/10 pt-3">
              <span className="text-sm text-gray-500 dark:text-white/50">جمع کل:</span>
              <span className="font-bold text-cyan font-jakarta">{formatToman(order.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-white/50">وضعیت:</span>
              <span className="text-gold font-bold">{STATUS_FA[order.status] ?? order.status}</span>
            </div>
            {order.invoice && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-white/50">شماره فاکتور:</span>
                <span className="text-gray-900 dark:text-white font-jakarta" dir="ltr">{order.invoice.number}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link href="/dashboard/orders">مشاهده سفارش‌ها</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/websites">بازگشت به سایت‌ها</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
