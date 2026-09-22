'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Mentor } from '@/types';
import { mentorMatchesCategoryKey, type MentorCategoryKey } from '@/lib/mentors/categoryFilter';
import MentorCard from '@/components/cards/MentorCard';
import EmptyState from '@/components/ui/EmptyState';

interface Props {
  initialMentors: Mentor[];
  locale: string;
  initialCategory?: MentorCategoryKey | null;
}

export default function MentorsPageClient({
  initialMentors,
  locale,
  initialCategory = null,
}: Props) {
  const t = useTranslations('mentors');
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);

  const pickCategory = (key: string | null) => {
    setSelectedCategory(key);
    router.replace(key ? `/${locale}/mentors?category=${key}` : `/${locale}/mentors`, { scroll: false });
  };

  const filteredMentors = useMemo(() => {
    return initialMentors.filter((m) => mentorMatchesCategoryKey(m, selectedCategory));
  }, [initialMentors, selectedCategory]);

  const categories = [
    { key: 'visa', label: t('categories.visa') },
    { key: 'housing', label: t('categories.housing') },
    { key: 'healthcare', label: t('categories.healthcare') },
    { key: 'academic', label: t('categories.academic') },
    { key: 'career', label: t('categories.career') },
    { key: 'dailyLife', label: t('categories.dailyLife') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 py-10">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">{t('title')}</h1>
          <p className="text-base text-white/90 max-w-xl">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-gray-100/80 dark:border-slate-700 backdrop-blur-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3">{t('filter')}</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => pickCategory(null)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                selectedCategory === null
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10'
              }`}
            >
              {t('all')}
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category.key}
                onClick={() => pickCategory(category.key)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  selectedCategory === category.key
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <p className="text-gray-600 dark:text-slate-400">
            {t('count', { count: filteredMentors.length })}
          </p>
        </div>

        {initialMentors.length === 0 ? (
          <EmptyState
            title={t('emptyTitle')}
            description={t('emptyDescription')}
            actionLabel={t('emptyAction')}
            actionHref={`/${locale}`}
          />
        ) : filteredMentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 shadow-sm">
            <p className="text-gray-600 dark:text-slate-400 text-lg">{t('noMatch')}</p>
            <button
              type="button"
              onClick={() => pickCategory(null)}
              className="mt-4 text-primary-600 font-semibold hover:underline"
            >
              {t('resetFilter')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
