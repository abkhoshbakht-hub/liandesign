import { Card } from "@/components/ui/card";
import { formatToman } from "@/lib/format";
import { getAdminStats } from "@/lib/data/admin";

const STATUS_FA: Record<string, string> = {
  PENDING: "در انتظار پرداخت",
  PROCESSING: "در حال پردازش",
  PAID: "پرداخت شده",
  FAILED: "ناموفق",
  REFUNDED: "مسترد شده",
  CANCELLED: "لغو شده",
};

export default async function AdminDashboard() {
  const s = await getAdminStats();

  const cards = [
    { label: "درآمد (پرداخت‌شده)", value: formatToman(s.revenue) },
    { label: "کاربران", value: s.usersCount.toLocaleString("fa-IR") },
    { label: "سایت‌ها", value: `${s.websitesPublished.toLocaleString("fa-IR")} از ${s.websitesCount.toLocaleString("fa-IR")} منتشر` },
    { label: "محصولات", value: s.productsCount.toLocaleString("fa-IR") },
    { label: "نظرات در انتظار", value: s.pendingReviews.toLocaleString("fa-IR") },
    { label: "تیکت‌های باز", value: s.openTickets.toLocaleString("fa-IR") },
  ];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="text-lg font-bold text-white font-jakarta">{c.value}</div>
            <div className="text-[11px] text-white/40 mt-1">{c.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="text-sm font-bold text-white mb-4">سفارش‌ها بر اساس وضعیت</div>
          <div className="space-y-2">
            {s.ordersByStatus.map((o) => (
              <div key={o.status} className="flex justify-between text-sm">
                <span className="text-white/50">{STATUS_FA[o.status] ?? o.status}</span>
                <span className="text-white font-jakarta">{o._count.status.toLocaleString("fa-IR")}</span>
              </div>
            ))}
            {s.ordersByStatus.length === 0 && <p className="text-xs text-white/30">سفارشی نیست.</p>}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-bold text-white mb-4">پرفروش‌ترین سایت‌ها</div>
          <div className="space-y-2">
            {s.topWebsites.map((w) => (
              <div key={w.name} className="flex justify-between text-sm">
                <span className="text-white/50">{w.name}</span>
                <span className="text-white font-jakarta">{w.count.toLocaleString("fa-IR")} فروش</span>
              </div>
            ))}
            {s.topWebsites.length === 0 && <p className="text-xs text-white/30">فروشی نیست.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
