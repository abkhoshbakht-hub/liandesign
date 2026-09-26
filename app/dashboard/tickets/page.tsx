import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserTickets } from "@/lib/data/tickets";

export default async function UserTickets() {
  const tickets = await getUserTickets();

  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <div className="text-sm font-bold text-gray-900 dark:text-white">تیکت‌های من</div>
        <Button asChild size="sm" variant="secondary" className="mr-auto">
          <Link href="/dashboard/tickets/new">تیکت جدید</Link>
        </Button>
      </div>
      <div className="space-y-3">
        {tickets.length === 0 && <p className="text-xs text-gray-400 dark:text-white/30 text-center py-6">تیکتی ندارید.</p>}
        {tickets.map((t) => (
          <Link key={t.id} href={`/dashboard/tickets/${t.id}`} className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 hover:border-cyan/30 transition-colors">
            <div className="flex-1">
              <div className="text-sm font-bold text-gray-900 dark:text-white">{t.subject}</div>
              <div className="text-[11px] text-gray-400 dark:text-white/30 mt-1">{t._count.messages.toLocaleString("fa-IR")} پیام</div>
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
