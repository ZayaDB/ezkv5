'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowUpRight, Briefcase, GraduationCap, HeartPulse, Home, MapPin, Search, ShieldCheck, Stamp } from 'lucide-react';
import type { Mentor } from '@/types';
import { parseMentorCategory, mentorMatchesCategoryKey, MENTOR_CATEGORY_KEYS, type MentorCategoryKey } from '@/lib/mentors/categoryFilter';
import { formatMentorHourlyPrice } from '@/lib/format/price';
import { Notice, PageShell, PageIntro, ui } from '@/components/lnk/ui';

/* Figma "LNK • Mentor connections" — 레이아웃은 Figma, 실제 멘토 데이터 */
const ICONS: Record<MentorCategoryKey, typeof Stamp> = {
  visa: Stamp,
  housing: Home,
  healthcare: HeartPulse,
  academic: GraduationCap,
  career: Briefcase,
  dailyLife: MapPin,
};

interface Props {
  initialMentors: Mentor[];
  locale: string;
}

function Avatar({ mentor, size = 48 }: { mentor: Mentor; size?: number }) {
  if (mentor.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={mentor.photo} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-primary-50 font-semibold text-primary-700 dark:bg-night-pill dark:text-primary-300"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {mentor.name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

export default function MentorsPageClient({ initialMentors, locale }: Props) {
  const t = useTranslations('mentorsPage');
  const tM = useTranslations('mentors');
  const router = useRouter();
  const [category, setCategory] = useState<MentorCategoryKey | ''>('');
  useEffect(() => {
    const c = parseMentorCategory(new URLSearchParams(window.location.search).get('category'));
    if (c) setCategory(c);
  }, []);
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('');
  const [format, setFormat] = useState<'' | 'online' | 'offline'>('');

  const languages = useMemo(
    () => Array.from(new Set(initialMentors.flatMap((m) => m.languages || []))).sort(),
    [initialMentors]
  );
  const counts = useMemo(() => {
    const c = {} as Record<MentorCategoryKey, number>;
    for (const k of MENTOR_CATEGORY_KEYS) c[k] = initialMentors.filter((m) => mentorMatchesCategoryKey(m, k)).length;
    return c;
  }, [initialMentors]);

  const pickCategory = (k: MentorCategoryKey | '') => {
    setCategory(k);
    router.replace(k ? `/${locale}/mentors?category=${k}` : `/${locale}/mentors`, { scroll: false });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialMentors.filter((m) => {
      if (category && !mentorMatchesCategoryKey(m, category)) return false;
      if (language && !(m.languages || []).includes(language)) return false;
      if (format === 'online' && m.sessionFormat === 'offline') return false;
      if (format === 'offline' && m.sessionFormat === 'online') return false;
      if (q) {
        const hay = [m.name, m.title, m.bio, m.location, ...(m.specialties || [])].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [initialMentors, category, language, format, query]);

  const selectCls =
    'h-11 w-full rounded-lg border border-hairline bg-surface px-3 text-sm text-ink focus:border-teal focus:outline-none dark:border-hairline-dark dark:bg-night dark:text-snow';

  return (
    <PageShell>
      <PageIntro eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

      <Notice title={t('noticeTitle')}>{t('noticeBody')}</Notice>

      {/* Filter bar */}
      <section className={`${ui.card} flex flex-col gap-4 p-5`} aria-label={t('filtersTitle')}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink dark:text-snow">{t('filtersTitle')}</h2>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setLanguage('');
              setFormat('');
              pickCategory('');
            }}
            className="text-xs text-teal hover:underline dark:text-teal-dark"
          >
            {t('reset')}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="relative flex items-center">
            <span className="sr-only">{t('searchPlaceholder')}</span>
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-ink-muted dark:text-snow-muted" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className={`${selectCls} pl-9 placeholder:text-ink-muted dark:placeholder:text-snow-muted`}
            />
          </label>
          <label>
            <span className="sr-only">{t('topic')}</span>
            <select value={category} onChange={(e) => pickCategory(e.target.value as MentorCategoryKey | '')} className={selectCls}>
              <option value="">{t('topicAll')}</option>
              {MENTOR_CATEGORY_KEYS.map((k) => (
                <option key={k} value={k}>
                  {tM(`categories.${k}`)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">{t('language')}</span>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className={selectCls}>
              <option value="">{t('languageAll')}</option>
              {languages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">{t('format')}</span>
            <select value={format} onChange={(e) => setFormat(e.target.value as '' | 'online' | 'offline')} className={selectCls}>
              <option value="">{t('formatAll')}</option>
              <option value="online">{t('online')}</option>
              <option value="offline">{t('offline')}</option>
            </select>
          </label>
        </div>
      </section>

      {/* Directory */}
      <section className="flex flex-col gap-5">
        <p className="text-sm font-semibold text-ink dark:text-snow" aria-live="polite">
          {t('count', { count: String(filtered.length) })}
        </p>
        {filtered.length === 0 ? (
          <div className={`${ui.card} flex flex-col items-center gap-3 px-6 py-12 text-center`}>
            <p className="text-xl font-semibold text-ink dark:text-snow">{initialMentors.length ? t('noMatch') : t('emptyTitle')}</p>
            <p className={`max-w-md text-sm ${ui.muted}`}>{t('emptyBody')}</p>
            <Link href={`/${locale}/study-in-korea`} className={ui.btnPrimary}>
              {t('emptyCta')}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((m) => {
              const price = formatMentorHourlyPrice(m.price);
              return (
                <li key={m.id}>
                  <Link href={`/${locale}/mentors/${m.id}`} className={`${ui.card} ${ui.cardHover} group flex h-full flex-col gap-4 p-6`}>
                    <div className="flex items-center gap-3">
                      <Avatar mentor={m} />
                      <div className="min-w-0">
                        <p className="truncate text-[17px] font-semibold text-ink group-hover:text-teal dark:text-snow dark:group-hover:text-teal-dark">
                          {m.name}
                        </p>
                        <p className={`truncate text-xs ${ui.muted}`}>{m.location}</p>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-[15px] font-medium leading-[1.5] text-ink dark:text-snow">{m.title}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {MENTOR_CATEGORY_KEYS.filter((k) => mentorMatchesCategoryKey(m, k))
                        .slice(0, 2)
                        .map((k) => (
                          <span key={k} className={ui.pillTeal}>
                            {tM(`categories.${k}`)}
                          </span>
                        ))}
                    </div>
                    <div className="mt-auto flex flex-col gap-3">
                      <div className="h-px w-full bg-hairline dark:bg-hairline-dark" />
                      <p className={`text-xs ${ui.muted}`}>
                        {[(m.languages || []).join(' · '), m.sessionFormat === 'offline' ? t('offline') : m.sessionFormat === 'both' ? t('both') : t('online')]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-ink dark:text-snow">
                          {price.free ? tM('free') : `${price.label}${price.perHour ? tM('perHour') : ''}`}
                        </span>
                        <span className={ui.btnGhost}>
                          {t('viewProfile')}
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
      </section>

      {/* Support areas */}
      <section className="flex flex-col gap-5">
        <h2 className={ui.h2}>{t('areasTitle')}</h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {MENTOR_CATEGORY_KEYS.map((k) => {
            const Icon = ICONS[k];
            return (
              <li key={k}>
                <button
                  type="button"
                  onClick={() => {
                    pickCategory(k);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`${ui.card} ${ui.cardHover} flex h-full w-full flex-col items-start gap-3 p-6 text-left`}
                >
                  <Icon className="h-5 w-5 text-teal dark:text-teal-dark" aria-hidden="true" />
                  <p className="text-lg font-semibold text-ink dark:text-snow">{tM(`categories.${k}`)}</p>
                  <p className={`text-sm leading-[1.55] ${ui.muted}`}>{t(`area_${k}`)}</p>
                  <span className={ui.btnGhost}>{t('areaCount', { count: String(counts[k]) })}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Trust band */}
      <section className="grid grid-cols-1 gap-6 rounded-2xl bg-[#e8f3ee] p-7 dark:bg-night-pill md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:p-9">
        <div className="flex flex-col gap-3">
          <span className={`w-fit ${ui.pillMuted} bg-white dark:bg-night-card`}>{t('trustTag')}</span>
          <h2 className="text-2xl font-semibold leading-[1.3] text-ink dark:text-snow">{t('trustTitle')}</h2>
        </div>
        <ul className="flex flex-col gap-3 text-sm text-ink dark:text-snow">
          {['trust1', 'trust2', 'trust3'].map((k) => (
            <li key={k} className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal dark:text-teal-dark" aria-hidden="true" />
              {t(k)}
            </li>
          ))}
        </ul>
      </section>

      <div className="h-px w-full bg-hairline dark:bg-hairline-dark" />
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-[22px] font-semibold text-ink dark:text-snow">{t('becomeTitle')}</p>
          <p className={`text-sm ${ui.muted}`}>{t('becomeBody')}</p>
        </div>
        <Link href={`/${locale}/my/profile/apply`} className={ui.btnOutline}>
          {t('becomeCta')}
        </Link>
      </div>
    </PageShell>
  );
}
