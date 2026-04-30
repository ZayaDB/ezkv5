'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { MessageCircle, X, Send, Loader2, ChevronUp } from 'lucide-react';
import { ChatMessage } from '@/types';
import { SearchResult } from '@/lib/search';

export default function Chatbot() {
  const t = useTranslations('chatbot');
  const locale = useLocale();
  const localeChoices = [
    { value: 'kr', label: '한국어' },
    { value: 'en', label: 'English' },
    { value: 'mn', label: 'Монгол' },
  ];
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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

    const userMessage: ChatMessage = {
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
      let data: { response?: string; links?: SearchResult[]; error?: string } = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        data = {};
      }

      // Build response content with links if available
      let responseContent = data.response || data.error || t('error');
      if (data.links && data.links.length > 0) {
        const linksText = data.links
          .map((link: SearchResult, index: number) => 
            `${index + 1}. **${link.title}**\n   ${link.description.substring(0, 100)}...\n   🔗 ${link.url}`
          )
          .join('\n\n');
        responseContent += `\n\n---\n\n**🔗 관련 링크:**\n\n${linksText}`;
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
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
      '비자 연장과 체류 준비를 도와줘',
      '한국에서 집 구할 때 주의할 점 알려줘',
      '멘토를 어떻게 찾아?',
      '강의 결제와 환불은 어디서 확인해?',
    ],
    en: [
      'Help me with visa extension and stay preparation',
      'What should I watch out for when finding housing in Korea?',
      'How can I find the right mentor?',
      'Where can I check lecture payments and refunds?',
    ],
    mn: [
      'Виз сунгалт болон оршин суух бэлтгэлд туслаач',
      'Солонгост байр хайхдаа юуг анхаарах вэ?',
      'Тохирох менторыг яаж олох вэ?',
      'Лекцийн төлбөр, буцаалтыг хаанаас шалгах вэ?',
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

  return (
    <>
      {scrollY > 80 && (
        <button
          type="button"
          onClick={onClickScrollTop}
          aria-label="맨 위로 이동"
          className={`fixed bottom-6 z-50 inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-colors ${
            isOpen ? 'right-[23.25rem] md:right-[26.25rem]' : 'right-[6.5rem]'
          }`}
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* Floating Button - Modern Design */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-br from-primary-500 to-accent-500 text-white p-5 rounded-2xl shadow-2xl hover:shadow-primary-500/50 transition-all hover:scale-110 z-50 group"
          aria-label="Open chatbot"
        >
          <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-300 rounded-full animate-pulse"></div>
        </button>
      )}

      {/* Chat Window - Modern Design */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200/50 flex flex-col z-50 overflow-hidden backdrop-blur-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">{t('title')}</h3>
                <p className="text-[11px] text-white/85">{t('guideBadge')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={chatLocale}
                onChange={(e) => onChangeLocale(e.target.value)}
                className="text-xs rounded-lg bg-white/20 border border-white/30 px-2 py-1 focus:outline-none"
                aria-label={t('language')}
              >
                {localeChoices.map((loc) => (
                  <option key={loc.value} value={loc.value} className="text-slate-900">
                    {loc.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-xl p-2 transition-colors"
                aria-label="Close chatbot"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <p className="mb-3">{t('starterTitle')}</p>
                <div className="grid grid-cols-1 gap-2 text-left">
                  {quickPrompts[chatLocale]?.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      className="rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-3 py-2 text-xs text-gray-700"
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
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words leading-relaxed">
                    {message.role === 'assistant'
                      ? renderMessageWithLinks(message.content)
                      : message.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('placeholder')}
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

