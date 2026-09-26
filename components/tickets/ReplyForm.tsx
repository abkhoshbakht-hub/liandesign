"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { replyTicket } from "@/lib/data/tickets";

export default function ReplyForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await replyTicket(ticketId, body);
    if (!res.ok) setError(res.error);
    else {
      setBody("");
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="پاسخ خود را بنویسید..."
        className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-cyan/40 focus:ring-2 focus:ring-cyan/20 resize-none"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <Button type="submit" size="sm" disabled={busy}>
        {busy ? "در حال ارسال..." : "ارسال پاسخ"}
      </Button>
    </form>
  );
}
