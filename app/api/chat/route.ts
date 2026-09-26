import { NextRequest, NextResponse } from "next/server";
import { handleChat, sendLiveMessage, getChatHistory, listActiveSessions } from "@/lib/data/chat";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, message, action } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    // admin reply
    if (action === "admin-reply") {
      const session = await getServerSession(authOptions);
      if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
        return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
      }
      if (!message) {
        return NextResponse.json({ error: "message required" }, { status: 400 });
      }
      await sendLiveMessage(sessionId, message, "admin");
      return NextResponse.json({ ok: true });
    }

    // user message
    if (!message) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }
    const reply = await handleChat(sessionId, message);
    return NextResponse.json({ reply });
  } catch (e: unknown) {
    console.error("Chat API error:", e);
    const msg = e instanceof Error ? e.message : "خطای سرور";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    // admin: list sessions
    if (!sessionId) {
      const session = await getServerSession(authOptions);
      if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
        return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
      }
      const sessions = await listActiveSessions();
      return NextResponse.json({ sessions });
    }

    // get history
    const messages = await getChatHistory(sessionId);
    return NextResponse.json({ messages });
  } catch (e: unknown) {
    console.error("Chat GET error:", e);
    return NextResponse.json({ messages: [] });
  }
}
