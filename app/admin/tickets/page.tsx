import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listTicketsAdmin } from "@/lib/data/tickets";

export default async function AdminTickets({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status === "CLOSED" ? "CLOSED" : "OPEN";
  const tickets = await listTicketsAdmin(status);

  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <div className="text-sm font-bold text-white">تیکت‌ها — {status === "OPEN" ? "باز" : "بسته"}</div>
        <div className="mr-auto flex gap-2 text-[11px]">
          <a href="/admin/tickets?status=OPEN" className="text-cyan hover:underline">باز</a>
          <a href="/admin/tickets?status=CLOSED" className="text-white/40 hover:text-cyan">بسته</a>
        </div>
      </div>
      <div className="space-y-3">
        {tickets.length === 0 && <p className="text-xs text-white/30">تیکتی نیست.</p>}
        {tickets.map((t) => (
          <Link key={t.id} href={`/admin/tickets/${t.id}`} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4 hover:border-cyan/30 transition-colors">
            <div className="flex-1">
              <div className="text-sm font-bold text-white">{t.subject}</div>
              <div className="text-[11px] text-white/30 mt-1">
                {t.user.name ?? t.user.email} — {t._count.messages.toLocaleString("fa-IR")} پیام
              </div>
            </div>
            <Badge variant={t.status === "OPEN" ? "default" : "outline"}>
              {t.status === "OPEN" ? "باز" : "بسته"}
            </Badge>
          </Link>
        ))}
      </div>
    </Card>
  );
}
