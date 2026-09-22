'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Lecture } from '@/types';
import LectureCard from '@/components/cards/LectureCard';
import EmptyState from '@/components/ui/EmptyState';

interface Props {
  initialLectures: Lecture[];
  locale: string;
}

export default function LecturesPageClient({ initialLectures, locale }: Props) {
  const t = useTranslations('lectures');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!selectedType) return initialLectures;
    return initialLectures.filter((l) => l.type === selectedType);
  }, [initialLectures, selectedType]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="relative overflow-hidden bg-gradient-to-br from-accent-600 via-accent-500 to-primary-500 py-10">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">{t('title')}</h1>
          <p className="text-base text-white/90 max-w-xl">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSelectedType(null)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                selectedType === null
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-primary-300'
              }`}
            >
              {t('all')}
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('online')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                selectedType === 'online'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-primary-300'
              }`}
            >
              {t('online')}
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('offline')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                selectedType === 'offline'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-primary-300'
              }`}
            >
              {t('offline')}
            </button>
          </div>
        </div>

        <div className="mb-6 text-gray-600 dark:text-slate-400">
          {t('count', { count: filtered.length })}
        </div>

        {initialLectures.length === 0 ? (
          <EmptyState
            title={t('emptyTitle')}
            description={t('emptyDescription')}
            actionLabel={t('emptyAction')}
            actionHref={`/${locale}`}
          />
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((lecture) => (
              <LectureCard key={lecture.id} lecture={lecture} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700">
            <p className="text-gray-600 dark:text-slate-400">{t('noMatch')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
