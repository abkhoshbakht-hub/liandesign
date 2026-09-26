import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatToman } from "@/lib/format";
import { listRefundsAdmin } from "@/lib/data/refunds";
import RefundActions from "@/components/admin/RefundActions";

const STATUS_FA: Record<string, string> = {
  REQUESTED: "در انتظار بررسی",
  APPROVED: "تأیید شده",
  PROCESSING: "در حال انجام",
  COMPLETED: "تکمیل شده",
  REJECTED: "رد شده",
};

export default async function AdminRefunds({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const valid = ["REQUESTED", "APPROVED", "PROCESSING", "COMPLETED", "REJECTED"];
  const status = valid.includes(searchParams.status ?? "") ? searchParams.status : "REQUESTED";
  const refunds = await listRefundsAdmin(status);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-sm font-bold text-white">استردادها — {STATUS_FA[status!]}</div>
        <div className="mr-auto flex gap-2 text-[11px]">
          <a href="/admin/refunds?status=REQUESTED" className="text-cyan hover:underline">در انتظار</a>
          <a href="/admin/refunds?status=COMPLETED" className="text-white/40 hover:text-cyan">تکمیل‌شده</a>
          <a href="/admin/refunds?status=REJECTED" className="text-white/40 hover:text-cyan">ردشده</a>
        </div>
      </div>
      <div className="space-y-3">
        {refunds.length === 0 && <p className="text-xs text-white/30">موردی نیست.</p>}
        {refunds.map((r) => (
          <div key={r.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="text-xs font-jakarta text-white/40" dir="ltr">{r.order.number}</span>
              <span className="text-xs text-white/60">{r.order.user.name ?? r.order.user.email}</span>
              <Badge variant={r.status === "COMPLETED" ? "default" : "gold"}>{STATUS_FA[r.status]}</Badge>
              <span className="mr-auto text-sm font-bold text-white font-jakarta">{formatToman(r.amount)}</span>
            </div>
            {r.reason && <p className="text-[11px] text-white/40 mb-3">دلیل: {r.reason}</p>}
            <RefundActions id={r.id} status={r.status} />
          </div>
        ))}
      </div>
    </Card>
  );
}
