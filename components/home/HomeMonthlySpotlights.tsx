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

export default async function HomeMonthlySpotlights({
  locale,
  topLecture,
  topMentor,
}: {
  locale: string;
  topLecture: Lecture | null;
  topMentor: Mentor | null;
}) {
  const t = await getTranslations('home');

  return (
    <section className="py-16 sm:py-20 bg-slate-50/80 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 lg:items-stretch">
          <div className="flex flex-col min-h-0">
            <div className="flex items-center gap-2 text-primary-600 font-semibold text-sm uppercase tracking-wide mb-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              {t('monthlyBestBadge')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">{t('monthlyBestLecture')}</h2>
            <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base mb-6 lg:mb-8">{t('monthlyBestLectureHint')}</p>

            {topLecture ? (
              <Link
                href={`/${locale}/lectures/${topLecture.id}`}
                className="group flex flex-col flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-700 shadow-sm overflow-hidden hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="aspect-[16/9] bg-gradient-to-br from-primary-100 to-accent-100 relative overflow-hidden">
                  {topLecture.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={topLecture.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-primary-400/60" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 text-sm font-semibold text-gray-800 dark:text-slate-200 shadow-sm">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    {topLecture.rating.toFixed(1)}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-700">
                      {topLecture.type === 'online' ? t('typeOnline') : t('typeOffline')}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">{topLecture.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2 group-hover:text-primary-700 transition-colors">
                    {topLecture.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">{topLecture.instructor}</p>
                  <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">
                    {excerpt(topLecture.description, 160)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-600">
                      {formatKrw(topLecture.price, locale)}
                    </span>
                    <span className="inline-flex items-center text-primary-600 font-semibold text-sm group-hover:gap-2 transition-all">
                      {t('viewDetail')}
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex flex-col flex-1 justify-center rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-10 text-center min-h-[280px]">
                <BookOpen className="w-12 h-12 mx-auto text-gray-400 dark:text-slate-500 mb-4" />
                <p className="text-gray-600 dark:text-slate-400 mb-4">{t('emptyLecture')}</p>
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

          <div className="flex flex-col min-h-0">
            <div className="hidden lg:block h-[28px] mb-2" aria-hidden="true" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">{t('monthlyBestMentor')}</h2>
            <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base mb-6 lg:mb-8">{t('monthlyBestMentorHint')}</p>

            {topMentor ? (
              <Link
                href={`/${locale}/mentors/${topMentor.id}`}
                className="group flex flex-col flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-700 shadow-sm overflow-hidden hover:border-accent-300 hover:shadow-md transition-all"
              >
                <div className="aspect-[16/9] bg-gradient-to-br from-accent-100 to-primary-100 relative overflow-hidden">
                  {topMentor.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={topMentor.photo}
                      alt=""
                      className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl font-bold text-primary-500/40">{topMentor.name.slice(0, 1)}</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 text-sm font-semibold text-gray-800 dark:text-slate-200 shadow-sm">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    {topMentor.rating.toFixed(1)}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 group-hover:text-primary-700 transition-colors leading-snug">
                      {topMentor.name}
                    </h3>
                    {topMentor.verified && (
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-200 mb-1">{topMentor.title}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">{topMentor.location}</p>
                  <p className="text-gray-400 dark:text-slate-500 text-sm mb-3">
                    ({topMentor.reviewCount} {t('reviews')})
                  </p>
                  <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                    {excerpt(topMentor.bio, 160)}
                  </p>
                  <span className="inline-flex items-center text-primary-600 font-semibold text-sm mt-auto">
                    {t('viewDetail')}
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            ) : (
              <div className="flex flex-col flex-1 justify-center rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-10 text-center min-h-[280px]">
                <Users className="w-12 h-12 mx-auto text-gray-400 dark:text-slate-500 mb-4" />
                <p className="text-gray-600 dark:text-slate-400 mb-4">{t('emptyMentor')}</p>
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
