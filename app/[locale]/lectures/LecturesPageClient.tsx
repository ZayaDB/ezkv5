'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowUpRight, Info, Search } from 'lucide-react';
import type { Lecture } from '@/types';
import { useAuth } from '@/lib/contexts/AuthContext';
import { intlLocale } from '@/lib/i18n/config';
import {
  LECTURE_CATEGORIES,
  lectureCategoryLabel,
  normalizeLectureCategory,
} from '@/lib/lectures/categories';
import LectureCover from '@/components/lectures/LectureCover';

interface Props {
  initialLectures: Lecture[];
  locale: string;
}

type Sort = 'suggested' | 'newest' | 'priceLow';
const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
const LANGS = ['ko', 'en', 'mn'] as const;
const LANG_KEY: Record<(typeof LANGS)[number], string> = { ko: 'langKo', en: 'langEn', mn: 'langMn' };

/* Figma "LNK • Course discovery" — 레이아웃·간격·타이포는 Figma, 강조색은 LNK 틸 */
const card = 'bg-white dark:bg-night-card border border-brand-line dark:border-hairline-dark';
const lift = 'transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:border-brand hover:shadow-[0_24px_48px_-30px_rgba(17,26,25,.45)] motion-reduce:transform-none';
const button =
  'inline-flex h-12 items-center justify-center rounded-lg px-5 text-sm font-semibold transition-colors ' +
  card +
  ' text-ink dark:text-snow hover:border-teal dark:hover:border-teal-dark';

function FilterGroup<T extends string>({
  name,
  legend,
  allLabel,
  value,
  options,
  onChange,
}: {
  name: string;
  legend: string;
  allLabel: string;
  value: T | '';
  options: { value: T; label: string }[];
  onChange: (v: T | '') => void;
}) {
  const items: { value: T | ''; label: string }[] = [{ value: '', label: allLabel }, ...options];
  return (
    <fieldset className="flex flex-col gap-3 text-[13px]">
      <legend className="mb-3 font-semibold text-ink dark:text-snow">{legend}</legend>
      {items.map((o) => {
        const checked = value === o.value;
        return (
          <label
            key={o.value || 'all'}
            className={`flex cursor-pointer items-center gap-2.5 ${
              checked ? 'text-teal dark:text-teal-dark' : 'text-ink-muted dark:text-snow-muted hover:text-ink dark:hover:text-snow'
            }`}
          >
            <input
              type="radio"
              name={name}
              checked={checked}
              onChange={() => onChange(o.value)}
              className="h-3.5 w-3.5 accent-teal dark:accent-teal-dark"
            />
            {o.label}
          </label>
        );
      })}
    </fieldset>
  );
}

export default function LecturesPageClient({ initialLectures, locale }: Props) {
  const t = useTranslations('coursesPage');
  const tLec = useTranslations('lectures');
  const { user } = useAuth();
  const nf = new Intl.NumberFormat(intlLocale(locale));

  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<string>('');
  const [level, setLevel] = useState<(typeof LEVELS)[number] | ''>('');
  const [lang, setLang] = useState<(typeof LANGS)[number] | ''>('');
  const [format, setFormat] = useState<'online' | 'offline' | ''>('');
  const [sort, setSort] = useState<Sort>('suggested');

  // 실제로 강의가 있는 주제만 필터에 보여준다
  const topics = useMemo(() => {
    const present = new Set(initialLectures.map((l) => normalizeLectureCategory(l.category) ?? 'other'));
    return LECTURE_CATEGORIES.filter((c) => present.has(c));
  }, [initialLectures]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = initialLectures.filter((l) => {
      if (topic && (normalizeLectureCategory(l.category) ?? 'other') !== topic) return false;
      if (level && l.difficulty !== level) return false;
      if (lang && (l.language || 'ko') !== lang) return false;
      if (format && l.type !== format) return false;
      if (q) {
        const hay = [l.title, l.shortDescription, l.description, l.instructor, lectureCategoryLabel(l.category, tLec)]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sort === 'priceLow') list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === 'newest') list = [...list].reverse();
    return list;
  }, [initialLectures, query, topic, level, lang, format, sort, tLec]);

  const reset = () => {
    setQuery('');
    setTopic('');
    setLevel('');
    setLang('');
    setFormat('');
    setSort('suggested');
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-night">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7 px-4 py-10 sm:px-8 lg:px-20 lg:py-14">
        {/* Section introduction */}
        <header className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-wide text-teal dark:text-teal-dark">{t('eyebrow')}</p>
          <h1 className="text-3xl font-semibold leading-[1.15] text-ink dark:text-snow sm:text-[40px]">{t('title')}</h1>
          <p className="text-base leading-[1.55] text-ink-muted dark:text-snow-muted">{t('subtitle')}</p>
        </header>

        {/* Context notice */}
        <div className="flex items-start gap-3.5 rounded-lg bg-primary-50 p-5 dark:bg-night-pill">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-teal dark:text-teal-dark" aria-hidden="true" />
          <div className="flex flex-col gap-1 leading-[1.55]">
            <p className="text-sm font-semibold text-ink dark:text-snow">{t('noticeTitle')}</p>
            <p className="text-[13px] text-ink-muted dark:text-snow-muted">{t('noticeBody')}</p>
          </div>
        </div>

        {/* Search field */}
        <label className={`flex h-[54px] items-center gap-3 rounded-lg px-[18px] ${card} focus-within:border-teal dark:focus-within:border-teal-dark`}>
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

        {/* Catalog layout */}
        <div className="flex flex-col items-start gap-8 lg:flex-row">
          <aside className={`w-full shrink-0 rounded-2xl p-6 lg:w-[242px] ${card}`} aria-label={t('filters')}>
            <div className="mb-6 flex items-start justify-between">
              <h2 className="text-lg font-semibold text-ink dark:text-snow">{t('filters')}</h2>
              <button type="button" onClick={reset} className="text-xs text-teal hover:underline dark:text-teal-dark">
                {t('reset')}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-1">
              <FilterGroup
                name="topic"
                legend={t('topic')}
                allLabel={t('allTopics')}
                value={topic}
                options={topics.map((c) => ({ value: c, label: tLec(`categories.${c}`) }))}
                onChange={setTopic}
              />
              <FilterGroup
                name="level"
                legend={t('level')}
                allLabel={t('allLevels')}
                value={level}
                options={LEVELS.map((v) => ({ value: v, label: t(v) }))}
                onChange={setLevel}
              />
              <FilterGroup
                name="lang"
                legend={t('language')}
                allLabel={t('anyLanguage')}
                value={lang}
                options={LANGS.map((v) => ({ value: v, label: t(LANG_KEY[v]) }))}
                onChange={setLang}
              />
              <FilterGroup
                name="format"
                legend={t('format')}
                allLabel={t('allFormats')}
                value={format}
                options={[
                  { value: 'online' as const, label: t('online') },
                  { value: 'offline' as const, label: t('offline') },
                ]}
                onChange={setFormat}
              />
            </div>
          </aside>

          <section className="flex w-full min-w-0 flex-1 flex-col gap-6">
            {/* Result controls */}
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-ink dark:text-snow" aria-live="polite">
                {t('resultCount', { count: filtered.length })}
              </p>
              <label className="flex items-center gap-2 text-[13px] text-ink-muted dark:text-snow-muted">
                {t('sort')}
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="rounded-md border border-hairline bg-white px-2 py-1 text-[13px] text-ink dark:border-hairline-dark dark:bg-night-card dark:text-snow"
                >
                  <option value="suggested">{t('sortSuggested')}</option>
                  <option value="newest">{t('sortNewest')}</option>
                  <option value="priceLow">{t('sortPriceLow')}</option>
                </select>
              </label>
            </div>

            {initialLectures.length === 0 || filtered.length === 0 ? (
              <div className={`flex flex-col items-start gap-3 rounded-2xl p-7 ${card}`}>
                <p className="text-[23px] font-semibold leading-[1.55] text-ink dark:text-snow">
                  {initialLectures.length === 0 ? t('emptyTitle') : t('noMatchTitle')}
                </p>
                <p className="text-sm leading-[1.55] text-ink-muted dark:text-snow-muted">
                  {initialLectures.length === 0 ? t('emptyBody') : t('noMatchBody')}
                </p>
                {initialLectures.length > 0 && (
                  <button type="button" onClick={reset} className={button}>
                    {t('reset')}
                  </button>
                )}
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((l) => {
                  const own = Boolean(user?.id && l.instructorId === user.id);
                  const meta = [
                    l.totalLessons ? t('lessons', { n: l.totalLessons }) : null,
                    l.totalHours ? t('hours', { n: l.totalHours }) : null,
                    l.instructor || null,
                  ].filter(Boolean);
                  return (
                    <li key={l.id} className={`flex flex-col overflow-hidden rounded-[24px] ${card} ${lift}`}>
                      <Link href={`/${locale}/lectures/${l.id}`} className="group flex h-full flex-col">
                        <div className="h-[184px] w-full shrink-0 overflow-hidden">
                          <LectureCover image={l.image} category={l.category} alt={l.title} />
                        </div>
                        <div className="flex flex-1 flex-col gap-3 p-6">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-primary-50 px-2.5 py-1.5 text-xs font-semibold text-primary-700 dark:bg-night-pill dark:text-primary-300">
                              {l.type === 'online' ? t('online') : t('offline')} ·{' '}
                              {l.price > 0 ? `₩${nf.format(l.price)}` : t('free')}
                            </span>
                            {own && (
                              <span className="rounded-full bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink-muted dark:bg-night dark:text-snow-muted">
                                {t('own')}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-teal dark:text-teal-dark">
                            {lectureCategoryLabel(l.category, tLec)}
                          </p>
                          <h3 className="text-[22px] font-semibold leading-[1.4] text-ink group-hover:text-teal dark:text-snow dark:group-hover:text-teal-dark">
                            {l.title}
                          </h3>
                          {(l.shortDescription || l.description) && (
                            <p className="line-clamp-2 text-sm leading-[1.55] text-ink-muted dark:text-snow-muted">
                              {l.shortDescription || l.description}
                            </p>
                          )}
                          <div className="mt-auto flex flex-col gap-3">
                            <div className="h-px w-full bg-hairline dark:bg-hairline-dark" />
                            {meta.length > 0 && (
                              <p className="text-xs leading-[1.55] text-ink-muted dark:text-snow-muted">{meta.join(' · ')}</p>
                            )}
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal dark:text-teal-dark">
                              {t('viewCourse')}
                              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* How enrollment works */}
            <div className={`flex flex-col items-start gap-3 rounded-2xl p-7 ${card}`}>
              <span className="rounded-full bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink-muted dark:bg-night dark:text-snow-muted">
                {t('howTag')}
              </span>
              <p className="text-[23px] font-semibold leading-[1.45] text-ink dark:text-snow">{t('howTitle')}</p>
              <p className="text-sm leading-[1.55] text-ink-muted dark:text-snow-muted">{t('howBody')}</p>
              <Link href={`/${locale}/my/courses`} className={button}>
                {t('howCta')}
              </Link>
            </div>
          </section>
        </div>

        <div className="h-px w-full bg-hairline dark:bg-hairline-dark" />

        {/* Other ways to get started */}
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-1 flex-col gap-2 leading-[1.55]">
            <p className="text-[22px] font-semibold text-ink dark:text-snow">{t('guideTitle')}</p>
            <p className="text-sm text-ink-muted dark:text-snow-muted">{t('guideBody')}</p>
          </div>
          <Link href={`/${locale}/study-in-korea`} className={button}>
            {t('guideCta')}
          </Link>
        </div>
      </div>
    </div>
  );
}
