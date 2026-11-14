'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowUpRight, Info, Search } from 'lucide-react';
import type { GuideTopic, StudyInfo } from '@/types';
import { GUIDE_TOPICS, estimateReadMinutes } from '@/lib/guides/content';
import { formatDate } from '@/lib/i18n/dateFormat';
import GuideCover from '@/components/guides/GuideCover';
import { GuideTopicIcon } from '@/components/guides/GuideTopicIcon';

/* Figma "LNK • Life in Korea guide browser" — 레이아웃은 Figma, 강조색은 LNK 틸 */
const card = 'bg-white dark:bg-night-card border border-hairline dark:border-hairline-dark';
const LANG_KEY: Record<string, string> = { ko: 'langKo', en: 'langEn', mn: 'langMn' };

function guideStatus(g: StudyInfo, t: (k: string, v?: Record<string, string>) => string, locale: string) {
  return g.reviewedAt
    ? t('statusReviewed', { date: formatDate(g.reviewedAt, locale, { dateStyle: 'medium' }) })
    : t('statusNeedsReview');
}

function StatusPill({ reviewed, children }: { reviewed: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
        reviewed
          ? 'bg-primary-50 text-primary-700 dark:bg-night-pill dark:text-primary-300'
          : 'bg-[#f8f0df] text-[#75582b] dark:bg-[#2a2418] dark:text-[#e2c48f]'
      }`}
    >
      {children}
    </span>
  );
}

export default function GuidesBrowserClient({ guides, locale }: { guides: StudyInfo[]; locale: string }) {
  const t = useTranslations('guides');
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<GuideTopic | ''>('');
  const [lang, setLang] = useState('');
  const [sort, setSort] = useState<'suggested' | 'short'>('suggested');

  const topics = useMemo(() => GUIDE_TOPICS.filter((tp) => guides.some((g) => g.category === tp)), [guides]);
  const languages = useMemo(() => Array.from(new Set(guides.map((g) => g.language || 'ko'))), [guides]);
  const minutes = (g: StudyInfo) => g.readMinutes || estimateReadMinutes(g.content);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = guides.filter((g) => {
      if (topic && g.category !== topic) return false;
      if (lang && (g.language || 'ko') !== lang) return false;
      if (q) {
        const hay = [g.title, g.summary, g.content, g.audience, ...(g.tags || []), t(`topics.${g.category}`)]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sort === 'short') list = [...list].sort((a, b) => minutes(a) - minutes(b));
    return list;
  }, [guides, query, topic, lang, sort, t]);

  const featured = !query && !topic ? filtered.find((g) => g.featured) : undefined;
  const rest = featured ? filtered.filter((g) => g.id !== featured.id) : filtered;
  const topicCount = new Set(filtered.map((g) => g.category)).size;

  const pill = (active: boolean) =>
    `rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
      active
        ? 'bg-teal text-white dark:bg-teal-dark dark:text-night'
        : `${card} text-ink hover:border-teal dark:text-snow dark:hover:border-teal-dark`
    }`;

  return (
    <div className="min-h-screen bg-surface dark:bg-night">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-10 sm:px-8 lg:px-20 lg:py-14">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-wide text-teal dark:text-teal-dark">{t('eyebrow')}</p>
          <h1 className="text-3xl font-semibold leading-[1.15] text-ink dark:text-snow sm:text-[40px]">{t('title')}</h1>
          <p className="text-base leading-[1.55] text-ink-muted dark:text-snow-muted">{t('subtitle')}</p>
        </header>

        <div className="flex items-start gap-3.5 rounded-lg bg-[#f8f0df] p-5 dark:bg-[#2a2418]">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#75582b] dark:text-[#e2c48f]" aria-hidden="true" />
          <div className="flex flex-col gap-1 leading-[1.55]">
            <p className="text-sm font-semibold text-ink dark:text-snow">{t('noticeTitle')}</p>
            <p className="text-[13px] text-ink-muted dark:text-snow-muted">{t('noticeBody')}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className={`flex h-[54px] flex-1 items-center gap-3 rounded-lg px-[18px] ${card} focus-within:border-teal dark:focus-within:border-teal-dark`}>
            <Search className="h-5 w-5 shrink-0 text-ink-muted dark:text-snow-muted" aria-hidden="true" />
            <span className="sr-only">{t('searchPlaceholder')}</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-muted focus:outline-none dark:text-snow dark:placeholder:text-snow-muted"
            />
          </label>
          <label className={`flex h-[54px] items-center gap-2 rounded-lg px-4 text-[13px] text-ink-muted dark:text-snow-muted ${card}`}>
            {t('contentLanguage')}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent font-medium text-ink focus:outline-none dark:text-snow"
            >
              <option value="">{t('anyLanguage')}</option>
              {languages.map((l) => (
                <option key={l} value={l}>
                  {LANG_KEY[l] ? t(LANG_KEY[l]) : l}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label={t('allTopics')}>
          <button type="button" aria-pressed={!topic} onClick={() => setTopic('')} className={pill(!topic)}>
            {t('allTopics')}
          </button>
          {topics.map((tp) => (
            <button key={tp} type="button" aria-pressed={topic === tp} onClick={() => setTopic(tp)} className={pill(topic === tp)}>
              {t(`topics.${tp}`)}
            </button>
          ))}
        </div>

        {featured && (
          <Link
            href={`/${locale}/study-in-korea/${featured.id}`}
            className={`group grid overflow-hidden rounded-2xl md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] ${card} hover:border-teal dark:hover:border-teal-dark`}
          >
            <div className="h-56 md:h-auto md:min-h-[300px]">
              <GuideCover image={featured.image} topic={featured.category} alt={featured.title} />
            </div>
            <div className="flex flex-col justify-center gap-4 p-7 lg:p-9">
              <span className="w-fit rounded-md bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 dark:bg-night-pill dark:text-primary-300">
                {t('featured')} · {t(`topics.${featured.category}`)}
              </span>
              <h2 className="text-2xl font-semibold leading-[1.3] text-ink group-hover:text-teal dark:text-snow dark:group-hover:text-teal-dark sm:text-[30px]">
                {featured.title}
              </h2>
              {featured.summary && <p className="text-[15px] leading-[1.6] text-ink-muted dark:text-snow-muted">{featured.summary}</p>}
              <p className="text-xs text-ink-muted dark:text-snow-muted">
                {[LANG_KEY[featured.language] ? t(LANG_KEY[featured.language]) : '', t('readMinutes', { n: String(minutes(featured)) }), guideStatus(featured, t, locale)]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <span className="inline-flex h-11 w-fit items-center gap-2 rounded-lg bg-teal px-5 text-sm font-semibold text-white dark:bg-teal-dark dark:text-night">
                {t('readFeatured')}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          </Link>
        )}

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-ink dark:text-snow" aria-live="polite">
            {t('count', { count: String(filtered.length), topics: String(topicCount) })}
          </p>
          <label className="flex items-center gap-2 text-[13px] text-ink-muted dark:text-snow-muted">
            {t('sort')}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as 'suggested' | 'short')}
              className="rounded-md border border-hairline bg-white px-2 py-1 text-[13px] text-ink dark:border-hairline-dark dark:bg-night-card dark:text-snow"
            >
              <option value="suggested">{t('sortSuggested')}</option>
              <option value="short">{t('sortShort')}</option>
            </select>
          </label>
        </div>

        {guides.length === 0 || filtered.length === 0 ? (
          <div className={`flex flex-col items-start gap-3 rounded-2xl p-7 ${card}`}>
            <p className="text-xl font-semibold text-ink dark:text-snow">{guides.length === 0 ? t('emptyTitle') : t('noMatchTitle')}</p>
            {guides.length > 0 && (
              <>
                <p className="text-sm text-ink-muted dark:text-snow-muted">{t('noMatchBody')}</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setTopic('');
                    setLang('');
                  }}
                  className={`inline-flex h-11 items-center rounded-lg px-5 text-sm font-semibold text-ink dark:text-snow ${card}`}
                >
                  {t('reset')}
                </button>
              </>
            )}
          </div>
        ) : (
          rest.length > 0 && (
            <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {rest.map((g) => (
                <li key={g.id}>
                  <Link
                    href={`/${locale}/study-in-korea/${g.id}`}
                    className={`group flex h-full flex-col gap-3 rounded-2xl p-6 ${card} hover:border-teal dark:hover:border-teal-dark`}
                  >
                    <p className="flex items-center gap-2 text-xs font-semibold text-teal dark:text-teal-dark">
                      <GuideTopicIcon topic={g.category} />
                      {t(`topics.${g.category}`)}
                    </p>
                    <h3 className="text-[20px] font-semibold leading-[1.4] text-ink group-hover:text-teal dark:text-snow dark:group-hover:text-teal-dark">
                      {g.title}
                    </h3>
                    {g.summary && <p className="text-sm leading-[1.55] text-ink-muted dark:text-snow-muted">{g.summary}</p>}
                    <StatusPill reviewed={Boolean(g.reviewedAt)}>{guideStatus(g, t, locale)}</StatusPill>
                    <p className="mt-auto text-xs text-ink-muted dark:text-snow-muted">
                      {[LANG_KEY[g.language] ? t(LANG_KEY[g.language]) : '', t('readMinutes', { n: String(minutes(g)) })]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal dark:text-teal-dark">
                      {t('readGuide')}
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )
        )}

        <div className="flex items-start gap-3.5 rounded-lg bg-primary-50 p-5 dark:bg-night-pill">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-teal dark:text-teal-dark" aria-hidden="true" />
          <div className="flex flex-col gap-1 leading-[1.55]">
            <p className="text-sm font-semibold text-ink dark:text-snow">{t('sourcesTitle')}</p>
            <p className="text-[13px] text-ink-muted dark:text-snow-muted">{t('sourcesBody')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
