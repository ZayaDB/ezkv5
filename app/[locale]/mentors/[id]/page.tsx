'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Heart, MapPin } from 'lucide-react';
import { mentorsApi, sessionApi } from '@/lib/api/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import { storage } from '@/lib/storage';
import { formatMentorHourlyPrice } from '@/lib/format/price';
import { mentorMatchesCategoryKey, MENTOR_CATEGORY_KEYS } from '@/lib/mentors/categoryFilter';
import type { Mentor } from '@/types';
import { Notice, ui } from '@/components/lnk/ui';

type MentorDetail = Mentor & { email?: string };

/** 소개 끝의 데모 안내 줄은 본문과 분리 */
function splitBio(text: string) {
  const idx = text.lastIndexOf('\n\n※');
  return idx === -1 ? { body: text.trim(), note: '' } : { body: text.slice(0, idx).trim(), note: text.slice(idx).trim() };
}

/* Figma 상세 패턴(강의 상세와 동일): 헤더 + 오른쪽 예약 패널 + 본문 섹션 */
export default function MentorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const tM = useTranslations('mentors');
  const t = useTranslations('mentorDetail');
  const tp = useTranslations('mentorsPage');
  const { user, isAuthenticated } = useAuth();
  const id = params.id as string;

  const [mentor, setMentor] = useState<MentorDetail | null | undefined>(undefined);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  const load = useCallback(async () => {
    const res = await mentorsApi.getById(id);
    if (res.error || !res.data) {
      setMentor(null);
      return;
    }
    const m = res.data as MentorDetail;
    setMentor(m);
    setIsFavorite(storage.isFavorite(m.id));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (mentor === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface dark:bg-night">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal border-t-transparent dark:border-teal-dark" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4 dark:bg-night">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-2xl font-semibold text-ink dark:text-snow">{t('notFound')}</h1>
          <Link href={`/${locale}/mentors`} className={ui.btnGhost}>
            {t('backToList')}
          </Link>
        </div>
      </div>
    );
  }

  const price = formatMentorHourlyPrice(mentor.price);
  const isSelf = Boolean(user?.id && mentor.userId === user.id);
  const { body, note } = splitBio(mentor.bio || '');
  const cats = MENTOR_CATEGORY_KEYS.filter((k) => mentorMatchesCategoryKey(mentor, k));
  const formatLabel =
    mentor.sessionFormat === 'offline' ? t('formatOffline') : mentor.sessionFormat === 'both' ? t('formatHybrid') : t('formatOnline');

  const handleBookSession = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    if (isBooking || isSelf) return;
    setIsBooking(true);
    setBookingMessage('');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    const result = await sessionApi.create({ mentorId: mentor.id, date: tomorrow.toISOString(), duration: 60, type: 'online' });
    setIsBooking(false);
    setBookingMessage(result.error ? result.error : t('bookingRequested'));
  };

  const toggleFavorite = () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    setIsFavorite(storage.toggleFavorite(mentor.id));
  };

  const details = [
    { label: t('sessionLength'), value: t('minutes', { n: mentor.sessionDuration || 60 }) },
    { label: t('sessionFormat'), value: formatLabel },
    { label: t('experience'), value: t('years', { n: mentor.yearsOfExperience || 0 }) },
    { label: t('languages'), value: (mentor.languages || []).join(', ') },
    { label: t('timezone'), value: mentor.timezone || 'Asia/Seoul' },
  ].filter((d) => d.value);

  const textBlocks = [
    { title: t('careerSummary'), body: mentor.careerSummary },
    { title: t('education'), body: mentor.education },
    { title: t('mentoringStyle'), body: mentor.mentoringStyle },
  ].filter((b) => b.body);

  return (
    <div className="min-h-screen bg-surface dark:bg-night">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 py-8 sm:px-8 lg:px-20 lg:py-12">
        <nav aria-label="Breadcrumb" className="text-[13px] text-ink-muted dark:text-snow-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href={`/${locale}/mentors`} className="hover:text-teal dark:hover:text-teal-dark">
                {tp('eyebrow')}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ink dark:text-snow" aria-current="page">
              {mentor.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex min-w-0 flex-col gap-10">
            {/* Header */}
            <header className="flex flex-col gap-5 sm:flex-row sm:items-start">
              {mentor.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mentor.photo} alt="" className="h-24 w-24 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary-50 text-4xl font-semibold text-primary-700 dark:bg-night-pill dark:text-primary-300" aria-hidden="true">
                  {mentor.name.trim().charAt(0).toUpperCase()}
                </span>
              )}
              <div className="flex min-w-0 flex-col gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {cats.slice(0, 3).map((k) => (
                    <span key={k} className={ui.pillTeal}>
                      {tM(`categories.${k}`)}
                    </span>
                  ))}
                  {mentor.verified ? <span className={ui.pillMuted}>{tM('verified')}</span> : null}
                </div>
                <h1 className="text-3xl font-semibold leading-[1.15] text-ink dark:text-snow sm:text-[40px]">{mentor.name}</h1>
                <p className="text-lg leading-[1.5] text-ink-muted dark:text-snow-muted">{mentor.title}</p>
                {mentor.location ? (
                  <p className={`flex items-center gap-1.5 text-[13px] ${ui.muted}`}>
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {mentor.location}
                  </p>
                ) : null}
              </div>
            </header>

            {body ? (
              <section className="flex flex-col gap-4">
                <h2 className={ui.h2}>{t('about')}</h2>
                <p className="whitespace-pre-line text-[15px] leading-[1.75] text-ink-muted dark:text-snow-muted">{body}</p>
              </section>
            ) : null}

            {mentor.specialties?.length ? (
              <section className="flex flex-col gap-4">
                <h2 className={ui.h2}>{t('specialties')}</h2>
                <ul className="flex flex-wrap gap-2">
                  {mentor.specialties.map((s) => (
                    <li key={s} className={`${ui.card} rounded-full px-3.5 py-1.5 text-sm text-ink dark:text-snow`}>
                      {s}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {textBlocks.length ? (
              <section className="flex flex-col gap-4">
                <h2 className={ui.h2}>{t('mentoringInfo')}</h2>
                <div className="flex flex-col gap-4">
                  {textBlocks.map((b) => (
                    <div key={b.title} className={`${ui.card} p-5`}>
                      <h3 className="mb-2 text-sm font-semibold text-ink dark:text-snow">{b.title}</h3>
                      <p className="whitespace-pre-line text-sm leading-[1.65] text-ink-muted dark:text-snow-muted">{b.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {(mentor.recommendedFor || mentor.notRecommendedFor) && (
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {mentor.recommendedFor ? (
                  <div className="rounded-2xl bg-primary-50 p-6 dark:bg-night-pill">
                    <h3 className="mb-2 text-base font-semibold text-ink dark:text-snow">{t('recommendedFor')}</h3>
                    <p className="whitespace-pre-line text-sm leading-[1.6] text-ink-muted dark:text-snow-muted">{mentor.recommendedFor}</p>
                  </div>
                ) : null}
                {mentor.notRecommendedFor ? (
                  <div className="rounded-2xl bg-[#f8f0df] p-6 dark:bg-[#2a2418]">
                    <h3 className="mb-2 text-base font-semibold text-ink dark:text-snow">{t('notRecommendedFor')}</h3>
                    <p className="whitespace-pre-line text-sm leading-[1.6] text-ink-muted dark:text-snow-muted">{mentor.notRecommendedFor}</p>
                  </div>
                ) : null}
              </section>
            )}

            <Notice tone="caution" title={tp('detailNoticeTitle')}>
              {tp('detailNoticeBody')}
              {note ? <span className="mt-1 block">{note}</span> : null}
            </Notice>
          </div>

          {/* Booking panel */}
          <aside className={`${ui.card} flex flex-col gap-5 p-7 lg:sticky lg:top-28`}>
            <span className={`w-fit ${mentor.availability === 'available' ? ui.pillTeal : ui.pillMuted}`}>
              {mentor.availability === 'available' ? t('inquiryAvailable') : tp('limited')}
            </span>
            <div>
              <p className="text-[28px] font-semibold text-ink dark:text-snow">{price.free ? tM('free') : price.label}</p>
              {!price.free && price.perHour ? <p className={`text-sm ${ui.muted}`}>{tM('perHour')}</p> : null}
            </div>
            <div className="h-px w-full bg-hairline dark:bg-hairline-dark" />
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[13px]">
              {details.map((d) => (
                <div key={d.label} className="contents">
                  <dt className={ui.muted}>{d.label}</dt>
                  <dd className="text-right font-medium text-ink dark:text-snow">{d.value}</dd>
                </div>
              ))}
            </dl>
            <p className={`text-xs ${ui.muted}`}>{t('avgResponse', { time: mentor.responseTime || t('defaultResponse') })}</p>
            {isSelf ? (
              <Link href={`/${locale}/my/profile?tab=mentor`} className={ui.btnPrimary}>
                {tp('editProfile')}
              </Link>
            ) : (
              <div className="flex flex-col gap-2.5">
                <button type="button" onClick={handleBookSession} disabled={isBooking} className={`${ui.btnPrimary} w-full`}>
                  {isBooking ? t('booking') : t('bookSession')}
                </button>
                <button type="button" onClick={toggleFavorite} aria-pressed={isFavorite} className={`${ui.btnOutline} w-full`}>
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-teal dark:text-teal-dark' : ''}`} aria-hidden="true" />
                  {isFavorite ? tp('saved') : tp('save')}
                </button>
              </div>
            )}
            {bookingMessage ? (
              <p className="text-[13px] font-medium text-teal dark:text-teal-dark" role="status">
                {bookingMessage}
              </p>
            ) : !isAuthenticated ? (
              <p className={`text-xs ${ui.muted}`}>{tp('loginToBook')}</p>
            ) : null}
            {mentor.email && user?.role === 'admin' ? (
              <p className={`border-t border-hairline pt-3 text-xs dark:border-hairline-dark ${ui.muted}`}>{t('adminOnly', { email: mentor.email })}</p>
            ) : null}
            <Link href={`/${locale}/my/schedule`} className={`${ui.btnGhost} text-xs`}>
              {tp('seeSchedule')}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
