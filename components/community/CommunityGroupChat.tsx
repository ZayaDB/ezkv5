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
    <div className="rounded-2xl border border-brand-line bg-white overflow-hidden flex flex-col h-[420px] dark:bg-night-card dark:border-hairline-dark">
      <div className="px-4 py-3 border-b border-brand-line dark:border-hairline-dark">
        <h2 className="text-sm font-bold text-brand-ink dark:text-snow">{t("chatTitle")}</h2>
        <p className="text-xs text-brand-soft dark:text-snow-muted">{t("chatHint")}</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-brand-soft dark:text-snow-muted">{t("chatEmpty")}</p>
        ) : (
          messages.map((m) => {
            const mine = user?.id === m.author.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${mine ? "text-right" : ""}`}>
                  <Link
                    href={`/${locale}/users/${m.author.id}`}
                    className="text-[11px] font-semibold text-brand-soft hover:text-primary-600 dark:text-snow-muted"
                  >
                    {m.author.name}
                  </Link>
                  <p
                    className={`mt-0.5 rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                      mine ? "bg-primary-600 text-white" : "bg-brand-mist text-brand-ink dark:text-snow dark:bg-night"
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
        <div className="border-t border-brand-line p-3 flex gap-2 dark:border-hairline-dark">
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
            className="flex-1 rounded-xl border border-brand-line px-3 py-2 text-sm dark:border-hairline-dark"
          />
          <button
            type="button"
            disabled={sending}
            onClick={() => void send()}
            className="rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-teal-dark dark:text-night dark:hover:bg-primary-400"
          >
            {t("chatSend")}
          </button>
        </div>
      ) : (
        <p className="border-t border-brand-line px-4 py-3 text-xs text-brand-soft dark:text-snow-muted dark:border-hairline-dark">
          {t("chatLogin")}
        </p>
      )}
      {error ? <p className="px-4 pb-3 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
