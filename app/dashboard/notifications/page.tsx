import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { listNotifications } from "@/lib/data/ads-engine";
import NotificationList from "@/components/dashboard/NotificationList";

export const metadata: Metadata = {
  title: "اعلان‌ها",
  robots: { index: false, follow: false },
};

export default async function NotificationsPage() {
  let items: Awaited<ReturnType<typeof listNotifications>> = [];
  try {
    items = await listNotifications();
  } catch {
    // گارد داشبورد لاگین را اجبار می‌کند
  }

  return (
    <Card className="p-6">
      <div className="text-sm font-bold text-white mb-4">اعلان‌ها</div>
      <NotificationList initial={items} />
    </Card>
  );
}
