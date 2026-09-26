import { NextRequest, NextResponse } from "next/server";
import { logSponsoredViews } from "@/lib/data/ads-track";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!rateLimit(`ads:imp:${clientKey(req)}`, 120)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  try {
    const body = (await req.json()) as {
      views?: { campaignId: string | null; placementKey: string }[];
    };
    const views = (body.views ?? []).slice(0, 20).map((v) => ({
      campaignId: v.campaignId ?? null,
      placementKey: String(v.placementKey ?? "unknown").slice(0, 80),
    }));
    await logSponsoredViews(views);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
