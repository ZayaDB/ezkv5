import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowRight, BookOpen, Star, Users } from 'lucide-react';
import type { Lecture, Mentor } from '@/types';

function formatKrw(amount: number, locale: string) {
  const loc = locale === 'en' ? 'en-US' : locale === 'mn' ? 'mn-MN' : 'ko-KR';
  return new Intl.NumberFormat(loc, {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount);
}

function excerpt(text: string, max: number) {
  const s = text.replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

function rankLabel(rank: number) {
  return `TOP ${rank}`;
}

export default async function HomeMonthlySpotlights({
  locale,
  topLectures,
  topMentors,
}: {
  locale: string;
  topLectures: Lecture[];
  topMentors: Mentor[];
}) {
  const t = await getTranslations('home');
  const lectureTop = topLectures.slice(0, 3);
  const mentorTop = topMentors.slice(0, 3);

  return (
    <section className="py-12 sm:py-14 bg-paper dark:bg-night">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-14 lg:space-y-16">
          <div>
            <div className="flex items-baseline justify-between gap-4 mb-6 pb-4 border-b border-hairline dark:border-hairline-dark">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink dark:text-parchment">
                {t('monthlyBestLectureTop3')}
              </h2>
              <span className="font-mono text-[11px] text-ink-muted dark:text-parchment-muted whitespace-nowrap">
                {t('monthlyBestLectureHint')}
              </span>
            </div>

            {lectureTop.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {lectureTop.map((lecture, idx) => (
                  <Link
                    key={lecture.id}
                    href={`/${locale}/lectures/${lecture.id}`}
                    className="group block rounded-sm overflow-hidden border border-hairline dark:border-hairline-dark bg-paper-card dark:bg-night-card hover:border-stamp dark:hover:border-stamp-dark transition-colors h-full"
                  >
                    <div className="flex flex-col h-full">
                      <div className="relative aspect-[16/9] bg-paper dark:bg-night">
                        {lecture.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={lecture.image}
                            alt={lecture.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-10 h-10 text-ink-muted/40 dark:text-parchment-muted/40" />
                          </div>
                        )}
                        <div className="absolute top-0 left-0 h-8 w-8 flex items-center justify-center bg-paper-card dark:bg-night-card border-b border-r border-hairline dark:border-hairline-dark font-mono text-[10px] font-semibold text-stamp dark:text-stamp-dark">
                          {rankLabel(idx + 1).replace('TOP ', 'No.')}
                        </div>
                        <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 bg-paper-card/95 dark:bg-night-card/95 font-mono text-[11px] text-ink dark:text-parchment">
                          <Star className="w-3 h-3 fill-stamp text-stamp dark:fill-stamp-dark dark:text-stamp-dark" />
                          {lecture.rating.toFixed(1)}
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-2 font-mono text-[11px] text-ink-muted dark:text-parchment-muted">
                          <span>{lecture.type === 'online' ? t('typeOnline') : t('typeOffline')}</span>
                          <span>·</span>
                          <span>{lecture.category}</span>
                        </div>
                        <h3 className="font-serif text-base sm:text-lg font-bold text-ink dark:text-parchment group-hover:text-stamp dark:group-hover:text-stamp-dark transition-colors line-clamp-2">
                          {lecture.title}
                        </h3>
                        <p className="text-sm text-ink-muted dark:text-parchment-muted mt-1">{lecture.instructor}</p>
                        <p className="text-sm text-ink-muted dark:text-parchment-muted mt-2 line-clamp-3 flex-1">
                          {excerpt(lecture.description, 120)}
                        </p>
                        <div className="mt-4 pt-4 border-t border-hairline dark:border-hairline-dark flex items-center justify-between gap-2">
                          <span className="text-sm sm:text-base font-semibold text-ink dark:text-parchment">
                            {formatKrw(lecture.price, locale)}
                          </span>
                          <span className="inline-flex items-center text-xs font-semibold text-stamp dark:text-stamp-dark">
                            {t('viewDetail')}
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-sm border border-dashed border-hairline dark:border-hairline-dark bg-paper-card dark:bg-night-card p-8 text-center">
                <BookOpen className="w-10 h-10 mx-auto text-ink-muted dark:text-parchment-muted mb-3" />
                <p className="text-ink-muted dark:text-parchment-muted mb-3">{t('emptyLecture')}</p>
                <Link
                  href={`/${locale}/lectures`}
                  className="inline-flex items-center text-stamp dark:text-stamp-dark font-semibold hover:underline"
                >
                  {t('goToLectures')}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-4 mb-6 pb-4 border-b border-hairline dark:border-hairline-dark">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink dark:text-parchment">
                {t('monthlyBestMentorTop3')}
              </h2>
              <span className="font-mono text-[11px] text-ink-muted dark:text-parchment-muted whitespace-nowrap">
                {t('monthlyBestMentorHint')}
              </span>
            </div>

            {mentorTop.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {mentorTop.map((mentor, idx) => (
                  <Link
                    key={mentor.id}
                    href={`/${locale}/mentors/${mentor.id}`}
                    className="group block rounded-sm overflow-hidden border border-hairline dark:border-hairline-dark bg-paper-card dark:bg-night-card hover:border-stamp dark:hover:border-stamp-dark transition-colors h-full"
                  >
                    <div className="flex flex-col h-full">
                      <div className="relative aspect-[16/9] bg-paper dark:bg-night">
                        {mentor.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={mentor.photo}
                            alt={mentor.name}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="w-10 h-10 text-ink-muted/40 dark:text-parchment-muted/40" />
                          </div>
                        )}
                        <div className="absolute top-0 left-0 h-8 w-8 flex items-center justify-center bg-paper-card dark:bg-night-card border-b border-r border-hairline dark:border-hairline-dark font-mono text-[10px] font-semibold text-stamp dark:text-stamp-dark">
                          {rankLabel(idx + 1).replace('TOP ', 'No.')}
                        </div>
                        <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 bg-paper-card/95 dark:bg-night-card/95 font-mono text-[11px] text-ink dark:text-parchment">
                          <Star className="w-3 h-3 fill-stamp text-stamp dark:fill-stamp-dark dark:text-stamp-dark" />
                          {mentor.rating.toFixed(1)}
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-serif text-base sm:text-lg font-bold text-ink dark:text-parchment truncate group-hover:text-stamp dark:group-hover:text-stamp-dark transition-colors">
                            {mentor.name}
                          </h3>
                          {mentor.verified && (
                            <span className="font-mono text-[10px] text-stamp dark:text-stamp-dark border border-stamp dark:border-stamp-dark rounded-full h-4 w-4 flex items-center justify-center shrink-0">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-ink-muted dark:text-parchment-muted truncate">{mentor.title}</p>
                        <p className="text-sm text-ink-muted dark:text-parchment-muted">{mentor.location}</p>
                        <p className="text-sm text-ink-muted dark:text-parchment-muted mt-2 line-clamp-3 flex-1">
                          {excerpt(mentor.bio, 120)}
                        </p>
                        <div className="mt-4 pt-4 border-t border-hairline dark:border-hairline-dark flex items-center justify-between gap-2">
                          <span className="font-mono text-xs text-ink-muted dark:text-parchment-muted">
                            {mentor.reviewCount} {t('reviews')}
                          </span>
                          <span className="inline-flex items-center text-xs font-semibold text-stamp dark:text-stamp-dark">
                            {t('viewDetail')}
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-sm border border-dashed border-hairline dark:border-hairline-dark bg-paper-card dark:bg-night-card p-8 text-center">
                <Users className="w-10 h-10 mx-auto text-ink-muted dark:text-parchment-muted mb-3" />
                <p className="text-ink-muted dark:text-parchment-muted mb-3">{t('emptyMentor')}</p>
                <Link
                  href={`/${locale}/mentors`}
                  className="inline-flex items-center text-stamp dark:text-stamp-dark font-semibold hover:underline"
                >
                  {t('goToMentors')}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
