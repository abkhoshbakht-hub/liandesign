"use client";

import { useState, useEffect, useRef } from "react";

interface ChatMsg {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Session {
  sessionId: string;
  messageCount: number;
  lastActivity: string;
}

export default function AdminChatPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (!selected) return;
    const interval = setInterval(() => fetchMessages(selected), 3000);
    return () => clearInterval(interval);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchSessions() {
    const res = await fetch("/api/chat");
    const data = await res.json();
    setSessions(data.sessions || []);
  }

  async function fetchMessages(sid: string) {
    const res = await fetch(`/api/chat?sessionId=${sid}`);
    const data = await res.json();
    setMessages(data.messages || []);
  }

  async function sendReply() {
    if (!reply.trim() || !selected) return;
    setLoading(true);
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: selected, message: reply, action: "admin-reply" }),
    });
    setReply("");
    await fetchMessages(selected);
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">گفتگوی زنده</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sessions List */}
        <div className="md:col-span-1 bg-white dark:bg-white/5 border rounded-xl p-4">
          <h2 className="font-bold mb-3">جلسات فعال</h2>
          {sessions.length === 0 && (
            <p className="text-gray-500 text-sm">هیچ مکالمه‌ای یافت نشد</p>
          )}
          {sessions.map((s) => (
            <button
              key={s.sessionId}
              onClick={() => {
                setSelected(s.sessionId);
                fetchMessages(s.sessionId);
              }}
              className={`w-full text-right p-3 rounded-lg mb-2 text-sm transition-colors ${
                selected === s.sessionId
                  ? "bg-cyan text-white"
                  : "bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10"
              }`}
            >
              <p className="font-bold">{s.sessionId.slice(0, 16)}...</p>
              <p className="text-xs opacity-70">{s.messageCount} پیام</p>
              <p className="text-xs opacity-70">
                {new Date(s.lastActivity).toLocaleString("fa-IR")}
              </p>
            </button>
          ))}
        </div>

        {/* Chat View */}
        <div className="md:col-span-3 bg-white dark:bg-white/5 border rounded-xl flex flex-col h-[600px]">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              یک جلسه را انتخاب کنید
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === "admin" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                        m.role === "admin"
                          ? "bg-cyan text-white rounded-br-sm"
                          : "bg-gray-100 dark:bg-white/10 rounded-bl-sm"
                      }`}
                    >
                      <p className="whitespace-pre-line">{m.content}</p>
                      <p className="text-[10px] opacity-50 mt-1">
                        {new Date(m.createdAt).toLocaleTimeString("fa-IR")}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="border-t p-3 flex items-center gap-2">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendReply()}
                  placeholder="پاسخ خود را بنویسید..."
                  className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-cyan"
                  disabled={loading}
                />
                <button
                  onClick={sendReply}
                  disabled={loading || !reply.trim()}
                  className="bg-cyan text-white px-6 py-2 rounded-full text-sm font-bold disabled:opacity-40"
                >
                  ارسال
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
