import Link from "next/link";
import { getServerSession } from "next-auth";
import { Download, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { getUserOrders } from "@/lib/data/orders";

export default async function DownloadsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? "";
  const orders = await getUserOrders(userId);

  const items = orders.flatMap((o) =>
    o.items
      .filter((i) => i.product)
      .map((i) => ({
        key: `${o.id}-${i.id}`,
        name: i.product?.name ?? "محصول",
        slug: i.product?.id ?? "",
        paid: o.status === "PAID",
        fileUrl: null as string | null, // مدیر فایل را بارگذاری می‌کند (پنل ادمین)
      }))
  );

  return (
    <Card className="p-6">
      <CardHeader className="p-0 mb-4">
        <CardTitle>دانلودهای من</CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-white/40 mb-4">هنوز محصول دیجیتالی نخریده‌اید.</p>
            <Button asChild>
              <Link href="/store">مشاهده فروشگاه</Link>
            </Button>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.key} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex-1">
                <div className="text-sm font-bold text-white">{item.name}</div>
                <div className="mt-1">
                  {item.paid ? (
                    <Badge>قابل دانلود</Badge>
                  ) : (
                    <Badge variant="gold">در انتظار تأیید پرداخت</Badge>
                  )}
                </div>
              </div>
              {item.paid && item.fileUrl ? (
                <Button asChild size="sm">
                  <a href={item.fileUrl} download>
                    <Download size={14} />
                    دانلود
                  </a>
                </Button>
              ) : (
                <span className="p-2 text-white/20" title={item.paid ? "فایل به‌زودی بارگذاری می‌شود" : "پس از تأیید پرداخت"}>
                  <Lock size={14} />
                </span>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
