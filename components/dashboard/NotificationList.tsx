"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { markNotificationRead } from "@/lib/data/ads-engine";

export interface NotificationItem {
  id: string;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: Date;
}

export default function NotificationList({ initial }: { initial: NotificationItem[] }) {
  const [items, setItems] = useState(initial);

  async function onOpen(id: string) {
    await markNotificationRead(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-xs text-white/40">اعلانی ندارید.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((n) => (
        <button key={n.id} onClick={() => onOpen(n.id)} className="w-full text-right">
          <Card className={`p-4 transition-colors hover:border-cyan/30 ${n.read ? "opacity-60" : ""}`}>
            <div className="flex items-start gap-3">
              <Bell size={15} className={n.read ? "text-white/30" : "text-cyan"} />
              <div>
                <div className="text-sm font-bold text-white">{n.title}</div>
                {n.body && <div className="text-[11px] text-white/40 mt-1 leading-relaxed">{n.body}</div>}
              </div>
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}
