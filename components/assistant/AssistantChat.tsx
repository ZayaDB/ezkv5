"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Send, Loader2 } from "lucide-react";
import { assistantApi } from "@/lib/api/client";
import { useAuth } from "@/lib/contexts/AuthContext";

type Msg = { id: string; role: "user" | "assistant"; content: string; actions?: any[] };

const QUICK = ["비자 연장해야 해", "이사 준비 도와줘", "오늘 일정 정리", "멘토 찾고 싶어"];

export default function AssistantChat({ embedded = false }: { embedded?: boolean }) {
  const t = useTranslations("assistant");
  const locale = useLocale();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setMessages((m) => [...m, { id: Date.now().toString(), role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, locale }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          id: `${Date.now()}-a`,
          role: "assistant",
          content: data.response || t("error"),
          actions: data.actions,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: `${Date.now()}-e`, role: "assistant", content: t("error") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const runAction = async (action: any) => {
    if (action.type === "open_calendar") {
      router.push(`/${locale}/calendar`);
      return;
    }
    if (action.type === "open_mentors") {
      router.push(`/${locale}/mentors`);
      return;
    }
    if (action.type === "open_study_guide") {
      router.push(`/${locale}/study-in-korea`);
      return;
    }
    if (action.type === "create_roadmap" && isAuthenticated) {
      setLoading(true);
      try {
        const res = await assistantApi.execute({
          type: "create_roadmap",
          templateKey: action.templateKey,
        });
        if (res.data?.redirectUrl) router.push(`/${locale}${res.data.redirectUrl}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      className={`flex flex-col ${
        embedded ? "h-[calc(100vh-12rem)]" : "min-h-[70vh]"
      } rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden`}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-lg font-semibold text-gray-800 dark:text-slate-100">{t("title")}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">{t("subtitle")}</p>
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="px-3 py-1.5 rounded-full text-sm bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-100"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-100"
              }`}
            >
              {m.content}
              {m.actions && m.actions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.actions.map((a: any, i: number) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => runAction(a)}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-primary-700 dark:text-primary-300 text-xs font-semibold border border-primary-200 dark:border-primary-700"
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("thinking")}
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="p-3 border-t border-gray-200 dark:border-slate-700 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          className="flex-1 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 rounded-xl bg-primary-600 text-white disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
