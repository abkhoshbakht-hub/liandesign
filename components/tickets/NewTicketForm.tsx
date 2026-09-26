"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTicket } from "@/lib/data/tickets";
import { User, Mail } from "lucide-react";

interface Props {
  userName: string | null;
  userEmail: string;
}

export default function NewTicketForm({ userName, userEmail }: Props) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await createTicket(subject, body);
    if (!res.ok) {
      setError(res.error === "LOGIN_REQUIRED" ? "برای ثبت تیکت ابتدا وارد شوید" : res.error);
      setBusy(false);
    } else {
      router.push(`/dashboard/tickets/${res.id}`);
    }
  }

  return (
    <Card className="p-6">
      <div className="text-sm font-bold text-gray-900 dark:text-white mb-4">تیکت جدید</div>

      {/* User info */}
      <div className="flex items-center gap-4 mb-5 p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl">
        <div className="w-10 h-10 rounded-full bg-cyan/10 flex items-center justify-center shrink-0">
          <User size={18} className="text-cyan" />
        </div>
        <div className="text-sm">
          <p className="font-bold text-gray-900 dark:text-white">{userName || "کاربر"}</p>
          <p className="text-xs text-gray-500 dark:text-white/50 flex items-center gap-1">
            <Mail size={10} />
            {userEmail}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600 dark:text-white/50">موضوع</label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="موضوع تیکت" required />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600 dark:text-white/50">متن پیام</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="مشکل یا سؤال خود را بنویسید..."
            className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-cyan/40 focus:ring-2 focus:ring-cyan/20 resize-none"
            required
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
        )}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "در حال ثبت..." : "ثبت تیکت"}
        </Button>
      </form>
    </Card>
  );
}
