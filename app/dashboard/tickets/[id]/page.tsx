import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getTicketForUser } from "@/lib/data/tickets";
import ReplyForm from "@/components/tickets/ReplyForm";

export default async function UserTicketDetail({ params }: { params: { id: string } }) {
  const ticket = await getTicketForUser(params.id);
  if (!ticket) notFound();

  return (
    <div className="space-y-6">
      <Link href="/dashboard/tickets" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-white/40 hover:text-cyan transition-colors">
        <ArrowRight size={14} />
        بازگشت به تیکت‌ها
      </Link>
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-base font-bold text-gray-900 dark:text-white">{ticket.subject}</div>
          <Badge variant={ticket.status === "OPEN" ? "default" : "outline"} className="mr-auto">
            {ticket.status === "OPEN" ? "باز" : "بسته"}
          </Badge>
        </div>
        <div className="space-y-3 mb-6">
          {ticket.messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "rounded-xl p-4 text-sm leading-relaxed max-w-[85%]",
                m.isStaff
                  ? "bg-cyan/10 border border-cyan/20 text-gray-900 dark:text-white mr-auto"
                  : "bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70"
              )}
            >
              <div className="text-[10px] text-gray-400 dark:text-white/30 mb-1">{m.isStaff ? "پشتیبانی لیان" : "شما"}</div>
              {m.body}
            </div>
          ))}
        </div>
        {ticket.status === "OPEN" ? (
          <ReplyForm ticketId={ticket.id} />
        ) : (
          <p className="text-xs text-gray-400 dark:text-white/30 text-center">این تیکت بسته شده است.</p>
        )}
      </Card>
    </div>
  );
}
