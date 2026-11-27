'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, X, Send, Loader2, ChevronUp, Flag, Check, UserRound } from 'lucide-react';
import { inquiryApi } from '@/lib/api/inquiries';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ChatMessage } from '@/types';
import { SearchResult } from '@/lib/search';
import type { AssistantAction } from '@/lib/ai/assistantActions';

const OPEN_EVENT = 'open-assistant';

/** 비서 열기. question을 주면 입력창에 미리 채워 둠 (보내기는 사용자가). */
export function openAssistant(question?: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { question } }));
}

type Bubble = ChatMessage & { actions?: AssistantAction[] };
type ReportState = { open: boolean; note: string; sending: boolean; done: boolean; error: string };
const EMPTY_REPORT: ReportState = { open: false, note: '', sending: false, done: false, error: '' };

export default function Chatbot() {
  const t = useTranslations('chatbot');
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const localeChoices = [
    { value: 'kr', label: t('langKr') },
    { value: 'en', label: t('langEn') },
    { value: 'mn', label: t('langMn') },
  ];
  const [reports, setReports] = useState<Record<string, ReportState>>({});
  const patchReport = (id: string, patch: Partial<ReportState>) =>
    setReports((r) => ({
      ...r,
      [id]: { ...EMPTY_REPORT, ...r[id], ...patch },
    }));

  /** AI 오답 신고: 질문 + 답 + 사용자 메모를 문의함(관리자 문의 관리)으로 보냄 */
  const sendReport = async (answerId: string) => {
    const idx = messages.findIndex((m) => m.id === answerId);
    if (idx < 0) return;
    const answer = messages[idx];
    const question = [...messages.slice(0, idx)].reverse().find((m) => m.role === 'user');
    const rs = reports[answerId];
    patchReport(answerId, { sending: true, error: '' });
    const body = [
      `[${t('reportQuestion')}]`,
      question?.content || '-',
      '',
      `[${t('reportAnswer')}]`,
      answer.content,
      '',
      `[${t('reportNote')}]`,
      rs?.note?.trim() || '-',
      '',
      `locale: ${chatLocale} · ${new Date().toISOString()}`,
    ].join('\n');
    const res = await inquiryApi.create({ subject: t('reportSubject'), body });
    if (res.error) patchReport(answerId, { sending: false, error: t('reportFailed') });
    else patchReport(answerId, { sending: false, done: true, open: false });
  };
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Bubble[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [chatLocale, setChatLocale] = useState(locale);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const open = (e: Event) => {
      setIsOpen(true);
      const q = (e as CustomEvent<{ question?: string }>).detail?.question;
      if (q) setInput(q);
    };
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('chatbotLocale');
      if (stored && ['kr', 'en', 'mn'].includes(stored)) {
        setChatLocale(stored);
      } else {
        setChatLocale(locale);
      }
    } catch {
      setChatLocale(locale);
    }
  }, [locale]);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSend = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || isLoading) return;

    const userMessage: Bubble = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!raw) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          locale: chatLocale,
        }),
      });

      const rawText = await response.text();
      let data: {
        response?: string;
        links?: SearchResult[];
        error?: string;
        actions?: AssistantAction[];
      } = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        data = {};
      }

      let responseContent =
        response.status === 429 && data.response
          ? data.response
          : data.response || t('error');
      if (data.links && data.links.length > 0) {
        const linksText = data.links
          .map(
            (link: SearchResult, index: number) =>
              `${index + 1}. **${link.title}**\n   ${link.description.substring(0, 100)}...\n   🔗 ${link.url}`
          )
          .join('\n\n');
        responseContent += `\n\n---\n\n**🔗 ${t('relatedLinks')}:**\n\n${linksText}`;
      }

      const assistantMessage: Bubble = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        actions: data.actions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Bubble = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('error'),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const runAction = (action: AssistantAction) => {
    if (action.type === 'open_visa_roadmap') router.push(`/${locale}/my/dashboard#roadmaps`);
    else if (action.type === 'open_visa_guide') router.push(`/${locale}/my/visa/${action.code.toLowerCase()}`);
    else if (action.type === 'open_mentors') router.push(`/${locale}/mentors?category=visa`);
    setIsOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onClickScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickPrompts: Record<string, string[]> = {
    kr: [
      'D-2에서 E-7로 바꾸려면 뭐가 필요해?',
      '유학생 아르바이트는 몇 시간까지 돼?',
      '비자 연장 서류 알려줘',
      '영주권(F-5)까지 어떻게 가?',
    ],
    en: [
      'What do I need to change from D-2 to E-7?',
      'How many hours can students work part-time?',
      'Which documents do I need to extend my visa?',
      'How do I get permanent residence (F-5)?',
    ],
    mn: [
      'D-2-оос E-7 рүү шилжихэд юу хэрэгтэй вэ?',
      'Оюутан хэдэн цаг цагийн ажил хийж болох вэ?',
      'Виз сунгахад ямар бичиг баримт хэрэгтэй вэ?',
      'Байнгын оршин суух (F-5) эрх яаж авах вэ?',
    ],
  };

  const onChangeLocale = (value: string) => {
    setChatLocale(value);
    try {
      localStorage.setItem('chatbotLocale', value);
    } catch {
      // ignore
    }
  };

  const toLocalizedHref = (raw: string) => {
    if (/^https?:\/\//i.test(raw)) return raw;
    if (!raw.startsWith('/')) return raw;
    const hasLocalePrefix = /^\/(kr|en|mn)(\/|$)/.test(raw);
    return hasLocalePrefix ? raw : `/${chatLocale}${raw}`;
  };

  const renderMessageWithLinks = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, lineIdx) => {
      const parts = line.split(/(https?:\/\/[^\s]+|\/[a-zA-Z0-9\-/_?=&]+)/g);
      return (
        <span key={`line-${lineIdx}`} className="block">
          {parts.map((part, partIdx) => {
            if (/^https?:\/\//i.test(part) || part.startsWith('/')) {
              const href = toLocalizedHref(part);
              return (
                <a
                  key={`part-${lineIdx}-${partIdx}`}
                  href={href}
                  className="underline underline-offset-2 hover:opacity-80 font-medium"
                >
                  {part}
                </a>
              );
            }
            return <span key={`part-${lineIdx}-${partIdx}`}>{part}</span>;
          })}
        </span>
      );
    });
  };

  // 모바일에서 로그인하면 하단 탭에 "AI 비서"가 있으므로 떠 있는 버튼은 숨김 (같은 기능 두 번 X)
  const hasBottomNav = Boolean(user && user.role !== 'admin');
  const dock = hasBottomNav ? 'bottom-20 right-4 md:bottom-6 md:right-6' : 'bottom-4 right-4 md:bottom-6 md:right-6';

  return (
    <>
      {scrollY > 80 && (
        <button
          type="button"
          onClick={onClickScrollTop}
          aria-label={t('scrollTop')}
          className={`fixed z-50 inline-flex items-center justify-center w-11 h-11 rounded-full border border-brand-line bg-white text-brand-ink shadow-lg hover:bg-brand-mist transition-colors dark:border-hairline-dark dark:bg-night-card dark:text-snow ${
            isOpen
              ? 'hidden md:inline-flex md:right-[26.25rem] md:bottom-6'
              : `right-4 md:right-6 md:bottom-[5.5rem] ${hasBottomNav ? 'bottom-20' : 'bottom-[5.5rem]'}`
          }`}
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed ${dock} z-50 ${hasBottomNav ? 'hidden md:inline-flex' : 'inline-flex'} h-14 items-center gap-2 rounded-full bg-brand-ink pl-4 pr-5 text-white shadow-[0_16px_32px_-14px_rgba(17,26,25,.7)] transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-brand-deep motion-reduce:transform-none`}
          aria-label={t('ariaOpen')}
        >
          <Sparkles className="h-5 w-5 text-brand-sun" aria-hidden="true" />
          <span className="text-[15px] font-bold">{t('launcher')}</span>
        </button>
      )}

      {isOpen && (
        <div
          className={`fixed ${dock} w-[min(24rem,calc(100vw-2rem))] h-[min(600px,calc(100vh-9rem))] bg-white dark:bg-night-card rounded-[24px] shadow-[0_30px_60px_-24px_rgba(17,26,25,.55)] border border-brand-line dark:border-hairline-dark flex flex-col z-50 overflow-hidden`}
        >
          <div className="bg-brand-ink text-white p-5 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="w-10 h-10 shrink-0 bg-white/10 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-sun" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="flex items-center gap-2 font-extrabold text-[17px] leading-tight">
                  {t('title')}
                  <span className="rounded-full bg-brand-sun px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-brand-ink">AI</span>
                </h3>
                <p className="mt-0.5 text-[11px] text-white/75">{t('guideBadge')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={chatLocale}
                onChange={(e) => onChangeLocale(e.target.value)}
                className="text-xs rounded-lg bg-white/10 border border-white/25 px-2 py-1 focus:outline-none"
                aria-label={t('language')}
              >
                {localeChoices.map((loc) => (
                  <option key={loc.value} value={loc.value} className="text-brand-ink">
                    {loc.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 rounded-xl p-2 transition-colors"
                aria-label={t('ariaClose')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-brand-soft dark:text-snow-muted mt-6">
                <p className="mb-3">{t('starterTitle')}</p>
                <div className="grid grid-cols-1 gap-2 text-left">
                  {quickPrompts[chatLocale]?.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      className="rounded-xl border border-brand-line dark:border-hairline-dark bg-white dark:bg-night hover:border-brand hover:bg-brand-mist dark:hover:bg-night-pill px-3 py-2.5 text-[13px] text-brand-ink dark:text-snow transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-brand text-white'
                      : 'bg-brand-mist dark:bg-night text-brand-ink dark:text-snow border border-brand-line dark:border-hairline-dark'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words leading-relaxed">
                    {message.role === 'assistant'
                      ? renderMessageWithLinks(message.content)
                      : message.content}
                  </div>
                  {message.actions && message.actions.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.actions.map((a, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => void runAction(a)}
                          className="px-3 py-1.5 rounded-full bg-white dark:bg-night-card text-brand-deep dark:text-primary-300 text-xs font-bold border border-brand-line dark:border-hairline-dark hover:border-brand transition-colors"
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {message.role === 'assistant' && user ? (
                    <ReportControl
                      state={reports[message.id]}
                      onToggle={() => patchReport(message.id, { open: !reports[message.id]?.open })}
                      onNote={(note) => patchReport(message.id, { note })}
                      onSend={() => void sendReport(message.id)}
                      t={t}
                    />
                  ) : null}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-brand-mist dark:bg-night rounded-2xl p-3">
                  <Loader2 className="w-5 h-5 animate-spin text-brand" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-brand-line dark:border-hairline-dark p-4">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('placeholder')}
                maxLength={500}
                className="min-w-0 flex-1 border border-brand-line dark:border-hairline-dark bg-white dark:bg-night text-brand-ink dark:text-snow rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand-mint/50 transition-shadow"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="bg-brand text-white p-3 rounded-xl hover:bg-brand-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t('ariaSend')}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-brand-soft dark:text-snow-muted">
              <span>{t('aiNotice')}</span>
              <Link
                href={`/${locale}/mentors`}
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1 font-bold text-brand dark:text-teal-dark hover:underline underline-offset-4"
              >
                <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                {t('askHuman')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** 답변 아래 "답이 틀렸나요? 신고" — 메모를 적어 문의함으로 보냄 */
function ReportControl({
  state,
  onToggle,
  onNote,
  onSend,
  t,
}: {
  state?: ReportState;
  onToggle: () => void;
  onNote: (note: string) => void;
  onSend: () => void;
  t: (key: string) => string;
}) {
  if (state?.done) {
    return (
      <p className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-brand dark:text-teal-dark">
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        {t('reportDone')}
      </p>
    );
  }
  return (
    <div className="mt-3 border-t border-brand-line/70 pt-2 dark:border-hairline-dark">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={Boolean(state?.open)}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-soft hover:text-brand-ink dark:text-snow-muted dark:hover:text-snow"
      >
        <Flag className="h-3.5 w-3.5" aria-hidden="true" />
        {t('reportCta')}
      </button>
      {state?.open ? (
        <div className="mt-2 flex flex-col gap-2">
          <textarea
            value={state.note}
            onChange={(e) => onNote(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder={t('reportPlaceholder')}
            className="w-full resize-none rounded-lg border border-brand-line bg-white px-2.5 py-2 text-[12px] text-brand-ink focus:border-brand focus:outline-none dark:border-hairline-dark dark:bg-night-card dark:text-snow"
          />
          {state.error ? <p className="text-[11px] text-red-600">{state.error}</p> : null}
          <button
            type="button"
            onClick={onSend}
            disabled={state.sending}
            className="self-start rounded-full bg-brand-ink px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-60"
          >
            {state.sending ? t('reportSending') : t('reportSend')}
          </button>
        </div>
      ) : null}
    </div>
  );
}
