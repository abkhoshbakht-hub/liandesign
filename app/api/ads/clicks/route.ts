import { NextRequest, NextResponse } from "next/server";
import { trackClick } from "@/lib/data/ads-track";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!rateLimit(`ads:click:${clientKey(req)}`, 120)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  try {
    const body = (await req.json()) as { itemId?: string };
    if (!body.itemId) return NextResponse.json({ ok: false }, { status: 400 });
    const r = await trackClick(String(body.itemId));
    return NextResponse.json({ ok: r.ok });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
