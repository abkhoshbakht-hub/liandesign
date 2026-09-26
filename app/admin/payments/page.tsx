import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatToman } from "@/lib/format";
import { listPaymentsAdmin } from "@/lib/data/refunds";

const STATUS_FA: Record<string, string> = {
  PENDING: "در انتظار",
  PROCESSING: "در حال پردازش",
  PAID: "پرداخت شده",
  FAILED: "ناموفق",
  REFUNDED: "مسترد شده",
  CANCELLED: "لغو شده",
};

export default async function AdminPayments() {
  const payments = await listPaymentsAdmin();

  return (
    <Card className="p-6">
      <div className="text-sm font-bold text-white mb-4">پرداخت‌ها ({payments.length.toLocaleString("fa-IR")})</div>
      <div className="space-y-3">
        {payments.length === 0 && <p className="text-xs text-white/30">پرداختی نیست.</p>}
        {payments.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
            <span className="text-xs font-jakarta text-white/40" dir="ltr">{p.reference ?? "—"}</span>
            <span className="text-xs text-white/60">{p.order.user.name ?? p.order.user.email}</span>
            <span className="text-[11px] text-white/30 font-jakarta" dir="ltr">{p.order.number}</span>
            <Badge variant={p.status === "PAID" ? "default" : "gold"}>{STATUS_FA[p.status] ?? p.status}</Badge>
            <span className="mr-auto text-sm font-bold text-white font-jakarta">{formatToman(p.amount)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
