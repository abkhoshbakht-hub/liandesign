"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WebsiteCard from "@/components/website/WebsiteCard";
import { recommendWebsites, type Recommendation } from "@/lib/data/ai";

const EXAMPLES = [
  "سایت رستوران ایرانی می‌خواهم با رزرو آنلاین و ظاهر لوکس",
  "فروشگاه اینترنتی با درگاه پرداخت و بودجه ۲۰ میلیون",
  "سایت شرکتی مینیمال با وبلاگ",
];

export default function AiFinderClient() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [results, setResults] = useState<Recommendation[] | null>(null);

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (prompt.trim().length < 4) {
      setError("لطفاً کمی بیشتر توضیح دهید");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await recommendWebsites(prompt);
      if (!res.ok) {
        setError(res.error);
        setResults(null);
        setSummary(null);
      } else {
        setResults(res.results);
        setSummary(res.summary);
      }
    } catch {
      setError("خطایی رخ داد. دوباره تلاش کنید");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="text-sm font-bold text-gray-900 dark:text-white">به زبان خودتان بگویید چه سایتی می‌خواهید</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="مثلاً: سایت رستوران ایرانی با رزرو آنلاین..."
            className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-cyan/40 focus:ring-2 focus:ring-cyan/20 resize-none"
          />
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setPrompt(ex)}
                className="text-[11px] text-cyan/70 hover:text-cyan bg-cyan/5 hover:bg-cyan/10 border border-cyan/10 rounded-full px-3 py-1.5 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            <Sparkles size={14} />
            {loading ? "در حال جستجو..." : "پیدا کن"}
            <Search size={14} />
          </Button>
        </form>
      </Card>

      {summary && (
        <p className="text-xs text-gray-500 dark:text-white/40">
          فهمیده شد: <span className="text-gray-600 dark:text-white/70">{summary}</span>
        </p>
      )}

      {results && (
        <div className="grid md:grid-cols-3 gap-6">
          {results.map((r) => (
            <div key={r.websiteId} className="relative">
              <div className="absolute -top-3 right-4 z-10 text-xs font-bold text-obsidian bg-gold px-3 py-1 rounded-full font-jakarta">
                {r.score.toLocaleString("fa-IR")}٪ تطابق
              </div>
              <WebsiteCard website={r.website} />
              <div className="mt-2 space-y-1">
                {r.reasons.map((reason) => (
                  <div key={reason} className="text-[11px] text-cyan/80">
                    ✓ {reason}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {results && (
        <div className="text-center">
          <Button asChild variant="secondary">
            <Link href="/websites">مشاهده همه سایت‌ها</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
