"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setOrderStatus } from "@/lib/data/admin";

const OPTIONS = ["PENDING", "PROCESSING", "PAID", "FAILED", "REFUNDED", "CANCELLED"];

export default function StatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onChange(next: string) {
    setBusy(true);
    await setOrderStatus(id, next);
    router.refresh();
    setBusy(false);
  }

  return (
    <select
      value={status}
      disabled={busy}
      onChange={(e) => onChange(e.target.value)}
      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan/40 disabled:opacity-50"
    >
      {OPTIONS.map((o) => (
        <option key={o} value={o} className="bg-white dark:bg-obsidian">
          {o}
        </option>
      ))}
    </select>
  );
}
