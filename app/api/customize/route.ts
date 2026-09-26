import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { saveCustomization } from "@/lib/data/customizer";
import { logEvent } from "@/lib/analytics";
import type { CustomValues } from "@/lib/customizer-utils";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "LOGIN_REQUIRED" }, { status: 401 });
  }

  let body: { websiteId?: unknown; values?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "اطلاعات ناقص است" }, { status: 400 });
  }
  if (typeof body.websiteId !== "string" || typeof body.values !== "object" || body.values === null) {
    return NextResponse.json({ ok: false, error: "اطلاعات ناقص است" }, { status: 400 });
  }

  const res = await saveCustomization(userId, body.websiteId, body.values as CustomValues);
  if (res.ok) await logEvent("customization_save", { websiteId: body.websiteId }, userId);
  return NextResponse.json(res, { status: res.ok ? 200 : 400 });
}
