import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatToman } from "@/lib/format";
import { listOrdersAdmin } from "@/lib/data/admin";
import StatusSelect from "@/components/admin/StatusSelect";

const STATUS_FA: Record<string, string> = {
  PENDING: "در انتظار پرداخت",
  PROCESSING: "در حال پردازش",
  PAID: "پرداخت شده",
  FAILED: "ناموفق",
  REFUNDED: "مسترد شده",
  CANCELLED: "لغو شده",
};

export default async function AdminOrders() {
  const orders = await listOrdersAdmin();

  return (
    <Card className="p-6">
      <div className="text-sm font-bold text-white mb-4">سفارش‌ها ({orders.length.toLocaleString("fa-IR")})</div>
      <div className="space-y-3">
        {orders.length === 0 && <p className="text-xs text-white/30">سفارشی نیست.</p>}
        {orders.map((o) => (
          <div key={o.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="text-xs font-jakarta text-white/40" dir="ltr">{o.number}</span>
              <span className="text-xs text-white/60">{o.user.name ?? o.user.email}</span>
              <Badge variant={o.status === "PAID" ? "default" : "gold"}>{STATUS_FA[o.status] ?? o.status}</Badge>
              <span className="mr-auto text-sm font-bold text-cyan font-jakarta">{formatToman(o.total)}</span>
            </div>
            <div className="text-[11px] text-white/40 mb-3">
              {o.items.map((i) => i.website?.name ?? i.product?.name ?? "").join("، ")}
            </div>
            <StatusSelect id={o.id} status={o.status} />
          </div>
        ))}
      </div>
    </Card>
  );
}
