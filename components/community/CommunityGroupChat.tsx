"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  listCommunityMessages,
  sendCommunityMessage,
} from "@/lib/supabase/community-messages";

type Msg = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string };
};

export default function CommunityGroupChat({ groupId }: { groupId: string }) {
  const locale = useLocale();
  const t = useTranslations("community");
  const { isAuthenticated, user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const rows = await listCommunityMessages(groupId);
      setMessages(rows);
    } catch {
      setMessages([]);
    }
  }, [groupId]);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 6000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError("");
    const res = await sendCommunityMessage(groupId, trimmed);
    setSending(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setText("");
    await load();
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden flex flex-col h-[420px]">
      <div className="px-4 py-3 border-b border-zinc-100">
        <h2 className="text-sm font-bold text-zinc-900">{t("chatTitle")}</h2>
        <p className="text-xs text-zinc-500">{t("chatHint")}</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("chatEmpty")}</p>
        ) : (
          messages.map((m) => {
            const mine = user?.id === m.author.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${mine ? "text-right" : ""}`}>
                  <Link
                    href={`/${locale}/users/${m.author.id}`}
                    className="text-[11px] font-semibold text-zinc-500 hover:text-primary-600"
                  >
                    {m.author.name}
                  </Link>
                  <p
                    className={`mt-0.5 rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                      mine ? "bg-primary-600 text-white" : "bg-zinc-100 text-zinc-800"
                    }`}
                  >
                    {m.body}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      {isAuthenticated ? (
        <div className="border-t border-zinc-100 p-3 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder={t("chatPlaceholder")}
            className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={sending}
            onClick={() => void send()}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {t("chatSend")}
          </button>
        </div>
      ) : (
        <p className="border-t border-zinc-100 px-4 py-3 text-xs text-zinc-500">
          {t("chatLogin")}
        </p>
      )}
      {error ? <p className="px-4 pb-3 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
