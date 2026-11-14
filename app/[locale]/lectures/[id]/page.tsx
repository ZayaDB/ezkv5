'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Heart, Info } from 'lucide-react';
import { intlLocale } from '@/lib/i18n/config';
import { contentApi, enrollmentApi, lectureWishlistApi } from '@/lib/api/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import type { Lecture } from '@/types';
import { lectureCategoryLabel } from '@/lib/lectures/categories';
import LectureCover from '@/components/lectures/LectureCover';

/* Figma "LNK • Course detail and enrollment" — 레이아웃은 Figma, 강조색은 LNK 틸, 상태는 실제 데이터 */
const card = 'bg-white dark:bg-night-card border border-hairline dark:border-hairline-dark';
const outlineBtn =
  'inline-flex h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition-colors ' +
  card +
  ' text-ink dark:text-snow hover:border-teal dark:hover:border-teal-dark';
const primaryBtn =
  'inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-teal-dark dark:text-night dark:hover:bg-primary-400';

const LANG_KEY: Record<string, string> = { ko: 'langKo', en: 'langEn', mn: 'langMn' };

/** 강의 설명 끝의 데모 안내 줄은 본문과 분리해서 보여준다 */
function splitDescription(text: string) {
  const idx = text.lastIndexOf('\n\n※');
  if (idx === -1) return { body: text.trim(), note: '' };
  return { body: text.slice(0, idx).trim(), note: text.slice(idx).trim() };
}

export default function LectureDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const tLec = useTranslations('lectures');
  const tc = useTranslations('coursesPage');
  const t = useTranslations('courseDetail');
  const tOld = useTranslations('lectureDetail');
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const id = params.id as string;
  const nf = new Intl.NumberFormat(intlLocale(locale));

  const [lecture, setLecture] = useState<Lecture | null | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollMessage, setEnrollMessage] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);

  const load = useCallback(async () => {
    const res = await contentApi.getLecture(id);
    if (res.error || !res.data) {
      setLecture(null);
      return;
    }
    setLecture(res.data as Lecture);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const isOwner = Boolean(user?.id && lecture?.instructorId && user.id === lecture.instructorId);

  useEffect(() => {
    let active = true;
    const checkEnrollment = async () => {
      if (!isAuthenticated || isOwner) return;
      const res = await enrollmentApi.getMine();
      const list = res.data?.enrollments || [];
      if (!active) return;
      setIsEnrolled(list.some((e: any) => e?.lecture?.id === id));
    };
    checkEnrollment();
    return () => {
      active = false;
    };
  }, [id, isAuthenticated, isOwner]);

  useEffect(() => {
    let active = true;
    const loadWishlist = async () => {
      if (!isAuthenticated || isOwner) return;
      const res = await lectureWishlistApi.list();
      if (!active) return;
      const list = res.data?.wishlist || [];
      setIsWishlisted(list.some((w) => w.lectureId === id));
    };
    loadWishlist();
    return () => {
      active = false;
    };
  }, [id, isAuthenticated, isOwner]);

  if (lecture === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface dark:bg-night">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal border-t-transparent dark:border-teal-dark" />
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4 dark:bg-night">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-semibold text-ink dark:text-snow">{tOld('notFound')}</h1>
          <Link href={`/${locale}/lectures`} className="font-semibold text-teal hover:underline dark:text-teal-dark">
            {tOld('backToList')}
          </Link>
        </div>
      </div>
    );
  }

  const enroll = async () => {
    if (isOwner) return;
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    if (isEnrolled || isSubmitting) return;
    setIsSubmitting(true);
    setEnrollMessage('');
    const res = await enrollmentApi.create(id);
    setIsSubmitting(false);
    if (res.error) {
      setEnrollMessage(res.error);
      return;
    }
    setIsEnrolled(true);
    setEnrollMessage(t('enrolledMsg'));
  };

  const toggleWishlist = async () => {
    if (isOwner) return;
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    if (isWishlisted) {
      const res = await lectureWishlistApi.remove(id);
      if (!res.error) setIsWishlisted(false);
      return;
    }
    const res = await lectureWishlistApi.add(id);
    if (!res.error) setIsWishlisted(true);
  };

  const categoryLabel = lectureCategoryLabel(lecture.category, tLec);
  const levelLabel = lecture.difficulty ? tc(lecture.difficulty) : '';
  const langLabel = LANG_KEY[lecture.language || 'ko'] ? tc(LANG_KEY[lecture.language || 'ko']) : lecture.language;
  const formatLabel = lecture.type === 'online' ? tc('online') : tc('offline');
  const priceLabel = lecture.price > 0 ? `₩${nf.format(lecture.price)}` : tc('free');
  const { body, note } = splitDescription(lecture.description || '');
  const learn = (lecture.whatYouWillLearn || []).filter(Boolean);
  const curriculum = (lecture.curriculum || []).filter(Boolean);
  const metaLine = [levelLabel, lecture.totalLessons ? tc('lessons', { n: lecture.totalLessons }) : '', langLabel]
    .filter(Boolean)
    .join(' · ');

  const state = isOwner ? 'Owner' : isEnrolled ? 'Enrolled' : 'Open';

  const details: { label: string; value: string }[] = [
    { label: t('format'), value: formatLabel },
    { label: t('level'), value: levelLabel },
    { label: t('language'), value: langLabel || '' },
    { label: t('duration'), value: lecture.duration || '' },
    {
      label: t('lessons'),
      value:
        lecture.totalLessons || lecture.totalHours
          ? t('lessonsValue', { lessons: lecture.totalLessons || 0, hours: lecture.totalHours || 0 })
          : '',
    },
    { label: t('instructor'), value: lecture.instructor || '' },
    {
      label: t('capacity'),
      value: lecture.maxStudents ? t('capacityValue', { students: lecture.students || 0, max: lecture.maxStudents }) : '',
    },
    { label: t('price'), value: priceLabel },
  ].filter((d) => d.value);

  return (
    <div className="min-h-screen bg-surface dark:bg-night">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 py-8 sm:px-8 lg:px-20 lg:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-[13px] text-ink-muted dark:text-snow-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href={`/${locale}/lectures`} className="hover:text-teal dark:hover:text-teal-dark">
                {t('breadcrumbCourses')}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>{categoryLabel}</li>
            <li aria-hidden="true">/</li>
            <li className="truncate text-ink dark:text-snow" aria-current="page">
              {lecture.title}
            </li>
          </ol>
        </nav>

        {/* Hero + enrollment panel */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="flex min-w-0 flex-col gap-5">
            <span className="w-fit rounded-md bg-primary-50 px-2.5 py-1.5 text-xs font-semibold text-primary-700 dark:bg-night-pill dark:text-primary-300">
              {categoryLabel} · {formatLabel}
            </span>
            <h1 className="text-3xl font-semibold leading-[1.15] text-ink dark:text-snow sm:text-[44px]">{lecture.title}</h1>
            {lecture.shortDescription && (
              <p className="text-lg leading-[1.55] text-ink-muted dark:text-snow-muted">{lecture.shortDescription}</p>
            )}
            {metaLine && <p className="text-[13px] text-ink-muted dark:text-snow-muted">{metaLine}</p>}
            <div className="aspect-[16/7] w-full overflow-hidden rounded-2xl">
              <LectureCover image={lecture.image} category={lecture.category} alt={lecture.title} iconSize={36} />
            </div>
          </div>

          <aside className={`flex flex-col gap-5 rounded-2xl p-7 lg:sticky lg:top-28 ${card}`}>
            <span
              className={`w-fit rounded-full px-2.5 py-1.5 text-xs font-semibold ${
                state === 'Open'
                  ? 'bg-primary-50 text-primary-700 dark:bg-night-pill dark:text-primary-300'
                  : 'bg-surface text-ink-muted dark:bg-night dark:text-snow-muted'
              }`}
            >
              {t(`panel${state}`)}
            </span>
            <div className="flex flex-col gap-3">
              <h2 className="text-[22px] font-semibold leading-[1.4] text-ink dark:text-snow">{t(`panelTitle${state}`)}</h2>
              <p className="text-sm leading-[1.6] text-ink-muted dark:text-snow-muted">{t(`panelBody${state}`)}</p>
            </div>
            <div className="h-px w-full bg-hairline dark:bg-hairline-dark" />
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[13px]">
              {details.map((d) => (
                <div key={d.label} className="contents">
                  <dt className="text-ink-muted dark:text-snow-muted">{d.label}</dt>
                  <dd className="text-right font-medium text-ink dark:text-snow">{d.value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-col gap-2.5">
              {state === 'Owner' ? (
                <Link href={`/${locale}/my/lectures`} className={primaryBtn}>
                  {t('manage')}
                </Link>
              ) : state === 'Enrolled' ? (
                <Link href={`/${locale}/my/courses`} className={primaryBtn}>
                  {t('goMyLearning')}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : (
                <button type="button" onClick={enroll} disabled={isSubmitting} className={primaryBtn}>
                  {isSubmitting ? t('enrolling') : t('enroll')}
                </button>
              )}
              {state !== 'Owner' && (
                <button type="button" onClick={toggleWishlist} aria-pressed={isWishlisted} className={outlineBtn}>
                  <Heart
                    className={`h-4 w-4 ${isWishlisted ? 'fill-current text-teal dark:text-teal-dark' : ''}`}
                    aria-hidden="true"
                  />
                  {isWishlisted ? t('saved') : t('save')}
                </button>
              )}
            </div>
            {enrollMessage ? (
              <p className="text-[13px] font-medium text-teal dark:text-teal-dark" role="status">
                {enrollMessage}
              </p>
            ) : (
              !isAuthenticated &&
              state === 'Open' && <p className="text-xs text-ink-muted dark:text-snow-muted">{t('loginToEnroll')}</p>
            )}
          </aside>
        </div>

        {/* Notice */}
        <div className="flex items-start gap-3.5 rounded-lg bg-[#f8f0df] p-5 dark:bg-[#2a2418]">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#75582b] dark:text-[#e2c48f]" aria-hidden="true" />
          <div className="flex flex-col gap-1 leading-[1.55]">
            <p className="text-sm font-semibold text-ink dark:text-snow">{t('noticeTitle')}</p>
            <p className="text-[13px] text-ink-muted dark:text-snow-muted">
              {t('noticeBody')}
              {note && <span className="mt-1 block">{note}</span>}
            </p>
          </div>
        </div>

        {/* Content + side info */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="flex min-w-0 flex-col gap-10">
            {body && (
              <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-ink dark:text-snow">{t('about')}</h2>
                <p className="whitespace-pre-line text-[15px] leading-[1.7] text-ink-muted dark:text-snow-muted">{body}</p>
              </section>
            )}
            {learn.length > 0 && (
              <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-ink dark:text-snow">{t('covers')}</h2>
                <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-[1.6] text-ink-muted marker:text-teal dark:text-snow-muted dark:marker:text-teal-dark">
                  {learn.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
            {curriculum.length > 0 && (
              <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-ink dark:text-snow">{t('curriculum')}</h2>
                <ol className="flex flex-col gap-4">
                  {curriculum.map((item, i) => (
                    <li key={`${i}-${item}`} className={`flex items-start gap-5 rounded-lg px-5 py-4 ${card}`}>
                      <span className="pt-0.5 text-[13px] font-medium text-teal dark:text-teal-dark">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="flex-1 text-[15px] font-semibold text-ink dark:text-snow">{item}</p>
                      <span className="text-[11px] text-ink-muted dark:text-snow-muted">
                        {t('lessonTag')} {i + 1}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>

          <aside className={`flex flex-col rounded-2xl p-6 ${card}`}>
            {[
              { title: t('audience'), body: lecture.targetAudience },
              { title: t('prerequisites'), body: lecture.prerequisites },
              { title: t('teaching'), body: lecture.instructor ? t('teachingBody', { name: lecture.instructor }) : '' },
            ]
              .filter((s) => s.body)
              .map((s, i) => (
                <div key={s.title} className={`flex flex-col gap-3 py-5 ${i > 0 ? 'border-t border-hairline dark:border-hairline-dark' : 'pt-0'}`}>
                  <h3 className="text-lg font-semibold text-ink dark:text-snow">{s.title}</h3>
                  <p className="whitespace-pre-line text-sm leading-[1.6] text-ink-muted dark:text-snow-muted">{s.body}</p>
                </div>
              ))}
            <Link
              href={`/${locale}/mentors`}
              className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-teal hover:underline dark:text-teal-dark"
            >
              {t('findMentors')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </aside>
        </div>

        {/* Enrollment steps */}
        <section className="flex flex-col gap-6 rounded-2xl bg-primary-50 p-6 dark:bg-night-pill sm:p-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-teal dark:text-teal-dark">{t('stepsTag')}</p>
            <h2 className="text-[26px] font-semibold leading-[1.3] text-ink dark:text-snow">{t('stepsTitle')}</h2>
            <p className="text-sm text-ink-muted dark:text-snow-muted">{t('stepsBody')}</p>
          </div>
          <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { n: 1, href: '#top', cta: t('step1Cta') },
              { n: 2, href: `/${locale}/login`, cta: t('step2Cta') },
              { n: 3, href: `/${locale}/my/courses`, cta: t('step3Cta') },
            ].map((s) => (
              <li key={s.n} className={`flex flex-col gap-3 rounded-xl p-6 ${card}`}>
                <p className="text-xs font-semibold uppercase text-teal dark:text-teal-dark">{t(`step${s.n}Tag`)}</p>
                <h3 className="text-lg font-semibold text-ink dark:text-snow">{t(`step${s.n}Title`)}</h3>
                <p className="flex-1 text-sm leading-[1.6] text-ink-muted dark:text-snow-muted">{t(`step${s.n}Body`)}</p>
                <div className="h-px w-full bg-hairline dark:bg-hairline-dark" />
                {s.n === 1 ? (
                  <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-ink hover:text-teal dark:text-snow dark:hover:text-teal-dark"
                  >
                    {s.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : (
                  <Link
                    href={s.href}
                    className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-ink hover:text-teal dark:text-snow dark:hover:text-teal-dark"
                  >
                    {s.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </section>

        {/* Arrival guide */}
        <section className="flex flex-col items-start gap-3">
          <h2 className="text-[22px] font-semibold text-ink dark:text-snow">{t('arrivalTitle')}</h2>
          <p className="text-sm text-ink-muted dark:text-snow-muted">{t('arrivalBody')}</p>
          <Link href={`/${locale}/study-in-korea`} className={outlineBtn}>
            {t('arrivalCta')}
          </Link>
        </section>
      </div>
    </div>
  );
}
