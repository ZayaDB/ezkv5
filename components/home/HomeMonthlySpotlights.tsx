import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowRight, BookOpen, Sparkles, Star, Users } from 'lucide-react';
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
    <section className="py-16 sm:py-20 bg-slate-50/80 dark:bg-slate-950">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12 lg:space-y-14">
          <div>
            <div className="flex items-center gap-2 text-primary-600 font-semibold text-sm uppercase tracking-wide mb-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              {t('monthlyBestBadge')}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
              {t('monthlyBestLectureTop3')}
            </h2>
            <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base mb-6 lg:mb-8">
              {t('monthlyBestLectureHint')}
            </p>

            {lectureTop.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {lectureTop.map((lecture, idx) => (
                  <Link
                    key={lecture.id}
                    href={`/${locale}/lectures/${lecture.id}`}
                    className={`group block rounded-2xl overflow-hidden border bg-white dark:bg-slate-900 transition-all h-full ${
                      idx === 0
                        ? 'border-primary-300 dark:border-primary-700 shadow-md'
                        : 'border-gray-200/80 dark:border-slate-700 shadow-sm hover:border-primary-200'
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <div className="relative aspect-[16/9] bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900/30 dark:to-blue-900/20">
                        {lecture.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={lecture.image}
                            alt={lecture.title}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-14 h-14 text-primary-400/70" />
                          </div>
                        )}
                        <div
                          className={`absolute top-3 left-3 inline-flex items-center justify-center rounded-xl font-bold ${
                            idx === 0
                              ? 'h-9 px-3 bg-primary-600 text-white text-xs'
                              : 'h-8 px-2.5 bg-white/90 dark:bg-slate-900/80 text-primary-700 dark:text-primary-300 text-[11px]'
                          }`}
                        >
                          {rankLabel(idx + 1)}
                        </div>
                        <div className="absolute top-3 right-3 inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold bg-white/90 dark:bg-slate-900/80 text-amber-700">
                          <Star className="w-3.5 h-3.5 mr-1 fill-amber-500 text-amber-500" />
                          {lecture.rating.toFixed(1)}
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                            {lecture.type === 'online' ? t('typeOnline') : t('typeOffline')}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-slate-400">{lecture.category}</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-slate-100 group-hover:text-primary-700 transition-colors line-clamp-2">
                          {lecture.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-slate-400">{lecture.instructor}</p>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-2 line-clamp-3 flex-1">
                          {excerpt(lecture.description, 120)}
                        </p>
                        <div className="mt-4 flex items-center justify-between gap-2">
                          <span className="text-sm sm:text-base font-bold text-primary-600">
                            {formatKrw(lecture.price, locale)}
                          </span>
                          <span className="inline-flex items-center text-xs font-semibold text-primary-700 dark:text-primary-300">
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
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-gray-400 dark:text-slate-500 mb-3" />
                <p className="text-gray-600 dark:text-slate-400 mb-3">{t('emptyLecture')}</p>
                <Link
                  href={`/${locale}/lectures`}
                  className="inline-flex items-center text-primary-600 font-semibold hover:underline"
                >
                  {t('goToLectures')}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 text-accent-600 font-semibold text-sm uppercase tracking-wide mb-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              {t('monthlyBestBadge')}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
              {t('monthlyBestMentorTop3')}
            </h2>
            <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base mb-6 lg:mb-8">
              {t('monthlyBestMentorHint')}
            </p>

            {mentorTop.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {mentorTop.map((mentor, idx) => (
                  <Link
                    key={mentor.id}
                    href={`/${locale}/mentors/${mentor.id}`}
                    className={`group block rounded-2xl overflow-hidden border bg-white dark:bg-slate-900 transition-all h-full ${
                      idx === 0
                        ? 'border-accent-300 dark:border-accent-700 shadow-md'
                        : 'border-gray-200/80 dark:border-slate-700 shadow-sm hover:border-accent-200'
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <div className="relative aspect-[16/9] bg-gradient-to-br from-accent-100 to-primary-100 dark:from-accent-900/30 dark:to-primary-900/20">
                        {mentor.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={mentor.photo}
                            alt={mentor.name}
                            className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="w-14 h-14 text-accent-400/70" />
                          </div>
                        )}
                        <div
                          className={`absolute top-3 left-3 inline-flex items-center justify-center rounded-xl font-bold ${
                            idx === 0
                              ? 'h-9 px-3 bg-accent-600 text-white text-xs'
                              : 'h-8 px-2.5 bg-white/90 dark:bg-slate-900/80 text-accent-700 dark:text-accent-300 text-[11px]'
                          }`}
                        >
                          {rankLabel(idx + 1)}
                        </div>
                        <div className="absolute top-3 right-3 inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold bg-white/90 dark:bg-slate-900/80 text-amber-700">
                          <Star className="w-3.5 h-3.5 mr-1 fill-amber-500 text-amber-500" />
                          {mentor.rating.toFixed(1)}
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-slate-100 truncate group-hover:text-primary-700 transition-colors">
                            {mentor.name}
                          </h3>
                          {mentor.verified && (
                            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-slate-300 truncate">{mentor.title}</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{mentor.location}</p>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-2 line-clamp-3 flex-1">
                          {excerpt(mentor.bio, 120)}
                        </p>
                        <div className="mt-4 flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-500 dark:text-slate-400">
                            {mentor.reviewCount} {t('reviews')}
                          </span>
                          <span className="inline-flex items-center text-xs font-semibold text-primary-700 dark:text-primary-300">
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
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-400 dark:text-slate-500 mb-3" />
                <p className="text-gray-600 dark:text-slate-400 mb-3">{t('emptyMentor')}</p>
                <Link
                  href={`/${locale}/mentors`}
                  className="inline-flex items-center text-primary-600 font-semibold hover:underline"
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
