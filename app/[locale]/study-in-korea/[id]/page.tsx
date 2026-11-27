import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowUpRight, Info } from 'lucide-react';
import { queryStudyInfoById, queryStudyInfos } from '@/lib/data/queries';
import { estimateReadMinutes, parseGuide } from '@/lib/guides/content';
import { formatDate } from '@/lib/i18n/dateFormat';
import GuideCover from '@/components/guides/GuideCover';
import type { StudyInfo } from '@/types';

/* Figma "LNK • First-week guide — sample editorial detail" — 레이아웃은 Figma, 강조색은 LNK 틸 */
const card = 'bg-white dark:bg-night-card border border-hairline dark:border-hairline-dark';
const LANG_KEY: Record<string, string> = { ko: 'langKo', en: 'langEn', mn: 'langMn' };

export const revalidate = 300;
/** Render each guide on first request, then serve it from cache. */
export function generateStaticParams() {
  return [];
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'guides' });

  let guide: StudyInfo | null = null;
  let all: StudyInfo[] = [];
  try {
    [guide, all] = await Promise.all([queryStudyInfoById(id, locale), queryStudyInfos({ locale })]);
  } catch {
    guide = null;
  }
  if (!guide) notFound();

  const { intro, sections } = parseGuide(guide.content);
  const minutes = guide.readMinutes || estimateReadMinutes(guide.content);
  const langLabel = LANG_KEY[guide.language] ? t(LANG_KEY[guide.language]) : guide.language;
  const status = guide.reviewedAt
    ? t('statusReviewed', { date: formatDate(guide.reviewedAt, locale, { dateStyle: 'medium' }) })
    : t('statusNeedsReview');
  const idx = all.findIndex((g) => g.id === guide!.id);
  const next = all.length > 1 ? all[(idx + 1) % all.length] : undefined;

  const sources = [
    { name: 'HiKorea', body: t('srcHiKorea'), url: 'https://www.hikorea.go.kr', host: 'hikorea.go.kr' },
    { name: 'Study in Korea', body: t('srcStudyInKorea'), url: 'https://www.studyinkorea.go.kr', host: 'studyinkorea.go.kr' },
    { name: t('srcNhis'), body: t('srcNhisBody'), url: 'https://www.nhis.or.kr', host: 'nhis.or.kr' },
  ];

  return (
    <div className="min-h-screen bg-surface dark:bg-night">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-8 sm:px-8 lg:px-20 lg:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-[13px] text-ink-muted dark:text-snow-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href={`/${locale}/study-in-korea`} className="hover:text-teal dark:hover:text-teal-dark">
                {t('breadcrumb')}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>{t(`topics.${guide.category}`)}</li>
            <li aria-hidden="true">/</li>
            <li className="truncate text-ink dark:text-snow" aria-current="page">
              {guide.title}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col gap-4">
            <span
              className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                guide.reviewedAt
                  ? 'bg-primary-50 text-primary-700 dark:bg-night-pill dark:text-primary-300'
                  : 'bg-[#f8f0df] text-[#75582b] dark:bg-[#2a2418] dark:text-[#e2c48f]'
              }`}
            >
              {t(`topics.${guide.category}`)} · {status}
            </span>
            <h1 className="text-3xl font-semibold leading-[1.2] text-ink dark:text-snow sm:text-[40px]">{guide.title}</h1>
            {guide.summary && <p className="text-lg leading-[1.55] text-ink-muted dark:text-snow-muted">{guide.summary}</p>}
            <p className="text-[13px] text-ink-muted dark:text-snow-muted">
              {[langLabel, t('readMinutes', { n: String(minutes) }), guide.audience ? t('forAudience', { audience: guide.audience }) : '']
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          <div className="h-56 overflow-hidden rounded-2xl lg:h-[210px]">
            <GuideCover image={guide.image} topic={guide.category} alt={guide.title} />
          </div>
        </header>

        {/* Notice */}
        <div className="flex items-start gap-3.5 rounded-lg bg-[#f8f0df] p-5 dark:bg-[#2a2418]">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#75582b] dark:text-[#e2c48f]" aria-hidden="true" />
          <div className="flex flex-col gap-1 leading-[1.55]">
            <p className="text-sm font-semibold text-ink dark:text-snow">{t('detailNoticeTitle')}</p>
            <p className="text-[13px] text-ink-muted dark:text-snow-muted">{t('detailNoticeBody')}</p>
          </div>
        </div>

        {/* Body + sidebar */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
          <article className="flex min-w-0 max-w-[760px] flex-col gap-8">
            {intro.map((p, i) => (
              <p key={i} className="text-[16px] leading-[1.75] text-ink dark:text-snow">
                {p}
              </p>
            ))}

            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="flex scroll-mt-28 flex-col gap-4 border-t border-hairline pt-6 dark:border-hairline-dark">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-teal dark:text-teal-dark">
                  {String(i + 1).padStart(2, '0')}
                  {s.eyebrow ? ` / ${s.eyebrow}` : ''}
                </p>
                <h2 className="text-2xl font-semibold leading-[1.35] text-ink dark:text-snow">{s.heading}</h2>
                {s.paragraphs.map((p, j) => (
                  <p key={j} className="text-[15px] leading-[1.75] text-ink-muted dark:text-snow-muted">
                    {p}
                  </p>
                ))}
                {s.checklist.length > 0 && (
                  <ul className="flex flex-col gap-2.5 rounded-lg bg-surface-card p-5 ring-1 ring-hairline dark:bg-night-card dark:ring-hairline-dark">
                    {s.checklist.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-ink-muted dark:text-snow-muted">
                        <span className="mt-0.5 h-4 w-4 shrink-0 rounded border border-hairline dark:border-hairline-dark" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* Where to verify */}
            <section id="sources" className="flex scroll-mt-28 flex-col gap-4 rounded-2xl bg-primary-50 p-6 dark:bg-night-pill sm:p-7">
              <h2 className="text-xl font-semibold text-ink dark:text-snow">{t('verifyTitle')}</h2>
              <ul className="flex flex-col gap-4">
                {sources.map((src) => (
                  <li key={src.url} className="flex flex-col gap-0.5">
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-fit items-center gap-1 text-[15px] font-semibold text-teal hover:underline dark:text-teal-dark"
                    >
                      {src.name}
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                    <p className="text-[13px] text-ink-muted dark:text-snow-muted">{src.body}</p>
                    <p className="text-[11px] text-ink-muted dark:text-snow-muted">{src.host}</p>
                  </li>
                ))}
                <li className="flex flex-col gap-0.5">
                  <p className="text-[15px] font-semibold text-teal dark:text-teal-dark">{t('srcUni')}</p>
                  <p className="text-[13px] text-ink-muted dark:text-snow-muted">{t('srcUniBody')}</p>
                </li>
              </ul>
              <p className="text-[11px] text-ink-muted dark:text-snow-muted">{t('verifyFootnote')}</p>
            </section>

            {/* Next */}
            <section className="flex flex-col items-start gap-3">
              <h2 className="text-[22px] font-semibold text-ink dark:text-snow">{t('nextTitle')}</h2>
              <p className="text-sm text-ink-muted dark:text-snow-muted">
                {next ? t('nextBody', { title: next.title }) : t('nextBodyNoTitle')}
              </p>
              <div className="flex flex-wrap gap-3">
                {next && (
                  <Link
                    href={`/${locale}/study-in-korea/${next.id}`}
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-teal px-5 text-sm font-semibold text-white dark:bg-teal-dark dark:text-night"
                  >
                    {next.title}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
                <Link
                  href={`/${locale}/study-in-korea`}
                  className={`inline-flex h-11 items-center rounded-lg px-5 text-sm font-semibold text-ink dark:text-snow ${card} hover:border-teal dark:hover:border-teal-dark`}
                >
                  {t('backToAll')}
                </Link>
              </div>
            </section>
          </article>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-28">
            {sections.length > 0 && (
              <nav aria-label={t('toc')} className={`rounded-2xl p-5 ${card}`}>
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink dark:text-snow">{t('toc')}</p>
                <ol className="flex flex-col gap-2.5 text-[13px]">
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="text-ink-muted hover:text-teal dark:text-snow-muted dark:hover:text-teal-dark">
                        {String(i + 1).padStart(2, '0')} {s.eyebrow || s.heading}
                      </a>
                    </li>
                  ))}
                  <li>
                    <a href="#sources" className="text-ink-muted hover:text-teal dark:text-snow-muted dark:hover:text-teal-dark">
                      {t('tocSources')}
                    </a>
                  </li>
                </ol>
              </nav>
            )}
            <div className="flex items-start gap-3 rounded-2xl bg-primary-50 p-5 dark:bg-night-pill">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal dark:text-teal-dark" aria-hidden="true" />
              <div className="flex flex-col gap-1">
                <p className="text-[13px] font-semibold text-ink dark:text-snow">{t('makeItYoursTitle')}</p>
                <p className="text-xs leading-[1.55] text-ink-muted dark:text-snow-muted">{t('makeItYoursBody')}</p>
              </div>
            </div>
            <div className={`flex flex-col gap-3 rounded-2xl p-5 ${card}`}>
              <span className="w-fit rounded-full bg-[#f8f0df] px-2.5 py-1 text-xs font-semibold text-[#75582b] dark:bg-[#2a2418] dark:text-[#e2c48f]">
                {t('statusCardTag')}
              </span>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
                <dt className="text-ink-muted dark:text-snow-muted">{t('statusLabel')}</dt>
                <dd className="text-right text-ink dark:text-snow">{status}</dd>
                <dt className="text-ink-muted dark:text-snow-muted">{t('languageLabel')}</dt>
                <dd className="text-right text-ink dark:text-snow">{langLabel}</dd>
                {guide.createdAt && (
                  <>
                    <dt className="text-ink-muted dark:text-snow-muted">{t('updatedLabel')}</dt>
                    <dd className="text-right text-ink dark:text-snow">{formatDate(guide.createdAt, locale, { dateStyle: 'medium' })}</dd>
                  </>
                )}
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
