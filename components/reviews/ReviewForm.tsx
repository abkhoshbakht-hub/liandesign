"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitReview } from "@/lib/data/reviews";

export default function ReviewForm({
  websiteId,
  productId,
  isLoggedIn,
}: {
  websiteId?: string;
  productId?: string;
  isLoggedIn: boolean;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError(null);
    const res = await submitReview({ websiteId, productId, rating, comment });
    if (!res.ok) {
      setState("error");
      setError(res.error === "LOGIN_REQUIRED" ? "LOGIN_REQUIRED" : res.error);
    } else {
      setState("sent");
    }
  }

  if (!isLoggedIn) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-white/50 mb-4">برای ثبت نظر وارد شوید.</p>
        <Button asChild variant="secondary">
          <Link href="/login">ورود / ثبت‌نام</Link>
        </Button>
      </Card>
    );
  }

  if (state === "sent") {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-cyan">نظر شما ثبت شد و پس از تأیید نمایش داده می‌شود ✓</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-sm font-bold text-white mb-4">نظر شما</h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              title={`${n} ستاره`}
              className={cn("p-1 transition-colors", n <= rating ? "text-gold" : "text-white/20 hover:text-white/40")}
            >
              <Star size={22} fill="currentColor" />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="تجربه خود را بنویسید..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan/40 focus:ring-2 focus:ring-cyan/20 resize-none"
        />
        {error && error !== "LOGIN_REQUIRED" && <p className="text-xs text-red-400">{error}</p>}
        <Button type="submit" disabled={state === "loading"}>
          {state === "loading" ? "در حال ثبت..." : "ثبت نظر"}
        </Button>
      </form>
    </Card>
  );
}
