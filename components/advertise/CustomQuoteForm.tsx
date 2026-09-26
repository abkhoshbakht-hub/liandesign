"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { submitCustomQuote } from "@/lib/data/ads-engine";

export default function CustomQuoteForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await submitCustomQuote({ title, note });
    if (!res.ok) {
      setError(res.error);
      setBusy(false);
    } else {
      router.push(`/advertise/campaigns/${res.id}`);
    }
  }

  return (
    <Card className="p-6 max-w-xl mx-auto">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-white/40">عنوان درخواست</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً کمپین سراسری تابستان" required />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-white/40">توضیح نیاز (حداقل ۱۰ حرف)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={5}
            placeholder="کجا، چقدر، چه هدفی... هرچه دقیق‌تر، پروپوزال بهتر"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan/40 focus:ring-2 focus:ring-cyan/20 resize-none"
            required
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "در حال ثبت..." : "درخواست پروپوزال سفارشی"}
        </Button>
      </form>
    </Card>
  );
}
