'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, MessageCircle, Send, Video } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  getConversation,
  listConversations,
  listMessages,
  listPairSessions,
  markConversationRead,
  sendMessage,
  subscribeToConversation,
  subscribeToMyMessages,
  type ConversationSummary,
  type DirectMessage,
  type PairSession,
} from '@/lib/supabase/messages';
import { sessionRoomWindow } from '@/lib/live/sessionRoom';
import { MESSAGES_CHANGED_EVENT } from '@/lib/hooks/useUnreadMessages';
import { ui } from '@/components/lnk/ui';

const dateLocale = (l: string) => (l === 'kr' ? 'ko-KR' : l === 'mn' ? 'mn-MN' : 'en-US');

function Avatar({ name, url, size = 40 }: { name: string; url: string | null; size?: number }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-night-pill dark:text-primary-300"
      style={{ width: size, height: size }}
    >
      {initial}
    </span>
  );
}

function MessagesInner() {
  const t = useTranslations('messages');
  const locale = useLocale();
  const router = useRouter();
  const search = useSearchParams();
  const activeId = search.get('c');
  const { user } = useAuth();

  const [list, setList] = useState<ConversationSummary[] | null>(null);

  const loadList = useCallback(async () => {
    try {
      setList(await listConversations());
    } catch {
      setList([]);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void loadList();
    const off = subscribeToMyMessages(() => void loadList());
    const onFocus = () => void loadList();
    window.addEventListener('focus', onFocus);
    return () => {
      off();
      window.removeEventListener('focus', onFocus);
    };
  }, [user, loadList]);

  const timeLabel = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    const sameDay = d.toDateString() === new Date().toDateString();
    return new Intl.DateTimeFormat(dateLocale(locale), sameDay ? { hour: 'numeric', minute: '2-digit' } : { month: 'short', day: 'numeric' }).format(d);
  };

  return (
    <div className="w-full space-y-6">
      <header className={`space-y-2 ${activeId ? 'hidden lg:block' : ''}`}>
        <p className={ui.eyebrow}>{t('eyebrow')}</p>
        <h1 className="text-2xl font-semibold text-ink dark:text-snow sm:text-[32px]">{t('title')}</h1>
        <p className={ui.muted}>{t('subtitle')}</p>
      </header>

      <div className={`${ui.card} grid h-[calc(100dvh-260px)] min-h-[480px] overflow-hidden lg:grid-cols-[320px_1fr]`}>
        {/* Conversation list */}
        <aside className={`${activeId ? 'hidden lg:flex' : 'flex'} min-h-0 flex-col border-hairline dark:border-hairline-dark lg:border-r`}>
          {list === null ? (
            <div className="space-y-2 p-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-hairline/50 dark:bg-night" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-teal dark:bg-primary-950/40 dark:text-teal-dark">
                <MessageCircle className="h-6 w-6" />
              </span>
              <p className={`text-sm ${ui.muted}`}>{t('empty')}</p>
              <Link href={`/${locale}/mentors`} className={ui.btnPrimary}>
                {t('findMentor')}
              </Link>
            </div>
          ) : (
            <ul className="min-h-0 flex-1 overflow-y-auto p-2">
              {list.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => router.replace(`/${locale}/my/messages?c=${c.id}`, { scroll: false })}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                      c.id === activeId ? 'bg-primary-50 dark:bg-night-pill' : 'hover:bg-surface dark:hover:bg-night'
                    }`}
                  >
                    <Avatar name={c.otherName} url={c.otherAvatar} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold text-ink dark:text-snow">{c.otherName || t('unknownUser')}</span>
                        {c.otherIsMentor && <span className={`${ui.pillTeal} !px-1.5 !py-0 text-[10px]`}>{t('mentorBadge')}</span>}
                        <span className={`ml-auto shrink-0 text-[11px] ${ui.muted}`}>{timeLabel(c.lastMessageAt)}</span>
                      </span>
                      <span className="mt-0.5 flex items-center gap-2">
                        <span className={`truncate text-[13px] ${c.unread ? 'font-semibold text-ink dark:text-snow' : ui.muted}`}>
                          {c.lastMessagePreview || t('noMessagesYet')}
                        </span>
                        {c.unread > 0 && (
                          <span className="ml-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-teal px-1.5 text-[11px] font-bold text-white dark:bg-teal-dark dark:text-night">
                            {c.unread > 99 ? '99+' : c.unread}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Thread */}
        <section className={`${activeId ? 'flex' : 'hidden lg:flex'} min-h-0 flex-col`}>
          {activeId && user ? (
            <Thread
              key={activeId}
              conversationId={activeId}
              meId={user.id}
              onBack={() => router.replace(`/${locale}/my/messages`, { scroll: false })}
              onActivity={loadList}
            />
          ) : (
            <div className={`flex flex-1 items-center justify-center p-8 text-sm ${ui.muted}`}>{t('pickConversation')}</div>
          )}
        </section>
      </div>
    </div>
  );
}

function Thread({
  conversationId,
  meId,
  onBack,
  onActivity,
}: {
  conversationId: string;
  meId: string;
  onBack: () => void;
  onActivity: () => void;
}) {
  const t = useTranslations('messages');
  const locale = useLocale();
  const [info, setInfo] = useState<Awaited<ReturnType<typeof getConversation>> | undefined>(undefined);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [sessions, setSessions] = useState<PairSession[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const markRead = useCallback(async () => {
    await markConversationRead(conversationId);
    window.dispatchEvent(new Event(MESSAGES_CHANGED_EVENT));
    onActivity();
  }, [conversationId, onActivity]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const c = await getConversation(conversationId);
      if (!alive) return;
      setInfo(c);
      if (!c) return;
      const [msgs, pair] = await Promise.all([listMessages(conversationId), listPairSessions(c.otherId)]);
      if (!alive) return;
      setMessages(msgs);
      setHasMore(msgs.length >= 50);
      setSessions(pair);
      void markRead();
    })();
    const off = subscribeToConversation(conversationId, (m) => {
      setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      if (m.senderId !== meId) void markRead();
    });
    return () => {
      alive = false;
      off();
    };
  }, [conversationId, meId, markRead]);

  // keep "join" buttons fresh as time passes
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const lastId = messages[messages.length - 1]?.id;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [lastId]);

  const loadOlder = async () => {
    const first = messages[0];
    if (!first) return;
    const el = scrollRef.current;
    const prevHeight = el?.scrollHeight || 0;
    const older = await listMessages(conversationId, first.createdAt);
    setHasMore(older.length >= 50);
    setMessages((prev) => [...older, ...prev]);
    requestAnimationFrame(() => {
      if (el) el.scrollTop = el.scrollHeight - prevHeight;
    });
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setError('');
    try {
      const m = await sendMessage(conversationId, text);
      setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      setDraft('');
      onActivity();
    } catch {
      setError(t('sendFailed'));
    } finally {
      setSending(false);
    }
  };

  const fmtTime = (iso: string) => new Intl.DateTimeFormat(dateLocale(locale), { hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
  const fmtDay = (iso: string) =>
    new Intl.DateTimeFormat(dateLocale(locale), { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(iso));
  const fmtSession = (iso: string) =>
    new Intl.DateTimeFormat(dateLocale(locale), {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'Asia/Seoul',
    }).format(new Date(iso));

  const activeSessions = useMemo(
    () =>
      sessions
        .filter((s) => s.status === 'upcoming')
        .filter((s) => now <= sessionRoomWindow(s.scheduledAt, s.duration).closes)
        .slice(0, 2),
    [sessions, now]
  );

  if (info === undefined) return <div className="flex-1 animate-pulse bg-surface/50 dark:bg-night/40" />;
  if (info === null) return <div className={`flex flex-1 items-center justify-center p-8 text-sm ${ui.muted}`}>{t('notFound')}</div>;

  return (
    <>
      <div className="flex items-center gap-3 border-b border-hairline px-4 py-3 dark:border-hairline-dark">
        <button type="button" onClick={onBack} className="rounded-lg p-1.5 text-ink-muted hover:bg-surface lg:hidden dark:text-snow-muted dark:hover:bg-night" aria-label={t('back')}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar name={info.otherName} url={info.otherAvatar} size={36} />
        <Link href={`/${locale}/users/${info.otherId}`} className="min-w-0 truncate text-sm font-semibold text-ink hover:text-teal dark:text-snow dark:hover:text-teal-dark">
          {info.otherName || t('unknownUser')}
        </Link>
      </div>

      {activeSessions.length > 0 && (
        <div className="space-y-2 border-b border-hairline bg-primary-50/60 px-4 py-3 dark:border-hairline-dark dark:bg-night">
          {activeSessions.map((s) => {
            const w = sessionRoomWindow(s.scheduledAt, s.duration);
            const open = now >= w.opens;
            return (
              <div key={s.id} className="flex flex-wrap items-center gap-3">
                <Video className="h-4 w-4 shrink-0 text-teal dark:text-teal-dark" />
                <span className="min-w-0 flex-1 text-[13px] text-ink dark:text-snow">
                  <span className="font-semibold">{t('sessionBanner', { when: fmtSession(s.scheduledAt), minutes: s.duration })}</span>
                  {!open && <span className={`ml-2 ${ui.muted}`}>{t('roomOpensSoon')}</span>}
                </span>
                {open ? (
                  <Link href={`/${locale}/sessions/${s.id}`} className={`${ui.btnPrimary} !h-9 !px-4`}>
                    {t('joinRoom')}
                  </Link>
                ) : (
                  <span className={`${ui.pillMuted}`}>{t('roomNotOpen')}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {hasMore && (
          <div className="mb-4 text-center">
            <button type="button" onClick={loadOlder} className={ui.btnGhost}>
              {t('loadOlder')}
            </button>
          </div>
        )}
        {messages.length === 0 && <p className={`py-10 text-center text-sm ${ui.muted}`}>{t('startHint', { name: info.otherName || t('unknownUser') })}</p>}
        <ul className="space-y-1.5">
          {messages.map((m, i) => {
            const mine = m.senderId === meId;
            const prev = messages[i - 1];
            const newDay = !prev || new Date(prev.createdAt).toDateString() !== new Date(m.createdAt).toDateString();
            const isLastMine = mine && !messages.slice(i + 1).some((x) => x.senderId === meId);
            return (
              <li key={m.id}>
                {newDay && (
                  <div className="my-4 flex justify-center">
                    <span className={`${ui.pillMuted} !text-[11px] font-medium`}>{fmtDay(m.createdAt)}</span>
                  </div>
                )}
                <div className={`flex items-end gap-1.5 ${mine ? 'justify-end' : 'justify-start'}`}>
                  {mine && (
                    <span className={`mb-0.5 text-[10px] ${ui.muted}`}>
                      {isLastMine && m.readAt ? `${t('read')} · ` : ''}
                      {fmtTime(m.createdAt)}
                    </span>
                  )}
                  <p
                    className={`max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-[1.5] ${
                      mine
                        ? 'rounded-br-md bg-teal text-white dark:bg-teal-dark dark:text-night'
                        : 'rounded-bl-md bg-surface text-ink dark:bg-night dark:text-snow'
                    }`}
                  >
                    {m.body}
                  </p>
                  {!mine && <span className={`mb-0.5 text-[10px] ${ui.muted}`}>{fmtTime(m.createdAt)}</span>}
                </div>
              </li>
            );
          })}
        </ul>
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
        className="border-t border-hairline p-3 dark:border-hairline-dark"
      >
        {error && <p className="mb-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void send();
              }
            }}
            rows={1}
            maxLength={4000}
            placeholder={t('placeholder')}
            className={`${ui.input} max-h-36 min-h-11 resize-none py-2.5`}
          />
          <button type="submit" disabled={!draft.trim() || sending} className={`${ui.btnPrimary} !h-11 !w-11 !px-0`} aria-label={t('send')}>
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className={`mt-1.5 text-[11px] ${ui.muted}`}>{t('safetyNote')}</p>
      </form>
    </>
  );
}

export default function MyMessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesInner />
    </Suspense>
  );
}
