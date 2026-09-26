"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, ExternalLink } from "lucide-react";

interface ChatLink {
  label: string;
  href: string;
}

interface ChatMsg {
  role: "user" | "bot";
  text: string;
  links?: ChatLink[];
}

const QUICK_QUESTIONS = [
  "قیمت سایت چقدر است؟",
  "نحوه سفارش چطوره؟",
  "چه خدماتی ارائه می‌دهید؟",
  "زمان تحویل چقدر است؟",
  "پشتیبانی دارید؟",
  "سایت آماده دارید؟",
  "سئو هم انجام می‌دهید؟",
  "نمونه کار دارید؟",
];

function BotBubble({ msg }: { msg: ChatMsg }) {
  return (
    <div className="flex justify-start mb-2">
      <div className="max-w-[85%]">
        <div className="bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed">
          <p className="whitespace-pre-line">{msg.text}</p>
        </div>
        {msg.links && msg.links.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {msg.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="inline-flex items-center gap-1 text-[11px] font-medium bg-cyan/10 hover:bg-cyan/20 text-cyan rounded-full px-2.5 py-1 transition-colors"
              >
                <ExternalLink size={9} />
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end mb-2">
      <div className="bg-cyan text-white rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm max-w-[85%] leading-relaxed">
        {text}
      </div>
    </div>
  );
}

function QuickButtons({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center py-2">
      {QUICK_QUESTIONS.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="text-[11px] font-medium bg-cyan/10 hover:bg-cyan/20 text-cyan border border-cyan/20 rounded-full px-3 py-1.5 transition-all hover:scale-105"
        >
          {q}
        </button>
      ))}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-2">
      <div className="bg-gray-100 dark:bg-white/10 rounded-2xl rounded-br-sm px-4 py-3 flex gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  // Reset when closing
  const handleClose = useCallback(() => {
    setOpen(false);
    setMessages([]);
    setInput("");
    setShowQuick(true);
    setLoading(false);
  }, []);

  const handleQuickSelect = useCallback(async (text: string) => {
    setShowQuick(false);
    await sendText(text);
  }, [loading]);

  async function sendText(text: string) {
    const t = text.trim();
    if (!t || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: t }]);
    setInput("");
    setLoading(true);
    setShowQuick(false);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: `chat_${Date.now()}`, message: t }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: data.reply.text, links: data.reply.links },
        ]);
        setShowQuick(true);
      } else if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: data.error },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "خطا در ارتباط. لطفاً دوباره تلاش کنید." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ── Social Icons ── */}
      <div className="fixed bottom-24 left-6 z-50 flex flex-col gap-2">
        {[
          { name: "تلگرام", icon: "/images/social/telegram-logo-1.png", href: "#" },
          { name: "اینستاگرام", icon: "/images/social/instagram-logo-1.png", href: "#" },
          { name: "بله", icon: "/images/social/Bale_logo.png", href: "#" },
          { name: "روبیکا", icon: "/images/social/rubikapng.logo.png", href: "#" },
          { name: "یوتیوب", icon: "/images/social/youtube.logo.png", href: "#" },
        ].map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            title={s.name}
            className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-md hover:shadow-lg hover:scale-110 transition-all"
          >
            <img src={s.icon} alt={s.name} className="w-full h-full object-cover" />
          </a>
        ))}
      </div>

      {/* ── Toggle Button ── */}
      <m.button
        onClick={() => (open ? handleClose() : setOpen(true))}
        className="fixed bottom-6 left-6 z-50 bg-cyan text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-cyan/30 hover:shadow-cyan/50 transition-shadow"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </m.button>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 left-20 z-50 w-[360px] h-[500px] bg-white dark:bg-[#0a0e1a] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-l from-cyan to-cyan/80 px-4 py-3 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-base">
                ل
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">لیان دیزاین</p>
                <p className="text-white/80 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full inline-block" />
                  آنلاین
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5">
              {/* Welcome */}
              {messages.length === 0 && (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-cyan/10 flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="text-cyan" size={24} />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                    سلام! 👋
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mb-3">
                    چطور می‌تونم کمکتون کنم؟
                  </p>
                  <QuickButtons onSelect={handleQuickSelect} />
                </div>
              )}

              {/* Chat Messages */}
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <UserBubble key={i} text={m.text} />
                ) : (
                  <BotBubble key={i} msg={m} />
                )
              )}

              {loading && <TypingIndicator />}

              {/* Quick Questions after bot reply */}
              {showQuick && messages.length > 0 && !loading && (
                <div className="pt-2 pb-1">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mb-1.5">سوالات متداول</p>
                  <QuickButtons onSelect={handleQuickSelect} />
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 dark:border-white/10 px-3 py-3 bg-gray-50 dark:bg-transparent shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendText(input)}
                  placeholder="پیام خود را بنویسید..."
                  className="flex-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan/30 focus:border-cyan/50 transition-all"
                  disabled={loading}
                />
                <button
                  onClick={() => sendText(input)}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 rounded-full bg-cyan text-white flex items-center justify-center disabled:opacity-30 hover:bg-cyan/90 transition-all shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
