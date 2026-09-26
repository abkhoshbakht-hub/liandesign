import { NextRequest, NextResponse } from "next/server";
import { logConversion } from "@/lib/data/ads-track";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!rateLimit(`ads:conv:${clientKey(req)}`, 60)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  try {
    const body = (await req.json()) as { campaignId?: string; kind?: string };
    await logConversion(body.campaignId ? String(body.campaignId) : null, body.kind ? String(body.kind).slice(0, 40) : "generic");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
