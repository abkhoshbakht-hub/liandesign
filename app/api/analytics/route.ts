import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logEvent, ANALYTICS_EVENTS, type AnalyticsEventName } from "@/lib/analytics";
import { doctorSiteService } from "@/services/doctor-site/service";

// Minimal in-memory throttle (best-effort; proper rate limiting lands with hosting).
const hits = new Map<string, number[]>();
function throttled(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 10_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 30;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (throttled(ip)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: { event?: unknown; props?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof body.event !== "string" || !(ANALYTICS_EVENTS as readonly string[]).includes(body.event)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const event = body.event as AnalyticsEventName;
  const props =
    body.props && typeof body.props === "object"
      ? (body.props as Record<string, string | number | boolean | null>)
      : undefined;

  await logEvent(event, props, userId);

  // Outbound ecosystem hops are double-recorded as integration logs.
  if (event === "doctor_site_click") {
    await doctorSiteService.logOutbound({
      websiteId: typeof props?.websiteId === "string" ? props.websiteId : undefined,
      campaign: typeof props?.campaign === "string" ? props.campaign : undefined,
      userId,
    });
  }

  return NextResponse.json({ ok: true });
}
