"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setUserRole } from "@/lib/data/admin";

export default function RoleSelect({
  id,
  role,
  isSelf,
}: {
  id: string;
  role: string;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(next: string) {
    setBusy(true);
    setError(null);
    const res = await setUserRole(id, next as "CUSTOMER" | "ADMIN");
    if (!res.ok) setError(res.error);
    router.refresh();
    setBusy(false);
  }

  return (
    <div>
      <select
        value={role}
        disabled={busy || isSelf}
        onChange={(e) => onChange(e.target.value)}
        title={isSelf ? "نمی‌توانید نقش خودتان را عوض کنید" : "تغییر نقش"}
        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan/40 disabled:opacity-50"
      >
        <option value="CUSTOMER" className="bg-white dark:bg-obsidian">مشتری</option>
        <option value="ADMIN" className="bg-white dark:bg-obsidian">مدیر</option>
      </select>
      {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
    </div>
  );
}
