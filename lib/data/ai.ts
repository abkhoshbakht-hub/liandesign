"use server";

import { db } from "@/lib/db";
import { logEvent } from "@/lib/analytics";
import {
  extractIntent,
  scoreWebsite,
  featureLabelMap,
  type ScoredWebsite,
} from "@/lib/ai/matcher";
import type { WebsiteWithRelations } from "@/lib/data/websites";

export type Recommendation = ScoredWebsite<WebsiteWithRelations> & { websiteId: string };

export async function recommendWebsites(
  prompt: string,
  userId?: string
): Promise<
  | { ok: true; summary: string; results: Recommendation[] }
  | { ok: false; error: string }
> {
  const clean = prompt.trim().slice(0, 500);
  if (clean.length < 4) return { ok: false, error: "لطفاً کمی بیشتر توضیح دهید چه سایتی می‌خواهید" };

  const intent = extractIntent(clean);
  const labels = featureLabelMap();

  const websites = await db.website.findMany({
    where: { status: "PUBLISHED" },
    include: { category: true, packages: { orderBy: { price: "asc" } } },
  });
  if (websites.length === 0) return { ok: false, error: "کاتالوگ فعلاً خالی است" };

  const ranked = websites
    .map((w) => scoreWebsite(w, intent, labels))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const conversation = await db.aIConversation.create({
    data: {
      userId: userId ?? null,
      prompt: clean,
      intent: JSON.parse(JSON.stringify(intent)),
      recommendations: {
        create: ranked.map((r) => ({
          websiteId: r.website.id,
          score: r.score,
          reasons: r.reasons,
        })),
      },
    },
  });

  await logEvent("ai_recommendation", { count: ranked.length }, userId);

  const parts: string[] = [];
  if (intent.industryLabel) parts.push(`صنعت: ${intent.industryLabel}`);
  if (intent.features.length > 0)
    parts.push(`امکانات: ${intent.features.map((f) => labels[f] ?? f).join("، ")}`);
  if (intent.budget != null) parts.push(`بودجه: ${intent.budget.toLocaleString("fa-IR")} تومان`);

  return {
    ok: true,
    summary: parts.length > 0 ? parts.join(" | ") : "بدون فیلتر خاص — محبوب‌ترین‌ها",
    results: ranked.map((r) => ({ ...r, websiteId: r.website.id })),
  };
}
