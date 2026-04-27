'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Mentor } from '@/types';
import { mentorMatchesCategoryKey } from '@/lib/data/queries';
import MentorCard from '@/components/cards/MentorCard';
import EmptyState from '@/components/ui/EmptyState';

interface Props {
  initialMentors: Mentor[];
  locale: string;
}

export default function MentorsPageClient({ initialMentors, locale }: Props) {
  const t = useTranslations('mentors');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">{t('title')}</h1>
          <p className="text-xl text-white/90 max-w-2xl">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-gray-100/80 dark:border-slate-700 backdrop-blur-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3">분야로 찾기</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                selectedCategory === null
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10'
              }`}
            >
              전체
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
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
            <span className="font-semibold text-gray-900 dark:text-slate-100">{filteredMentors.length}</span>명의 멘토
          </p>
        </div>

        {initialMentors.length === 0 ? (
          <EmptyState
            title="등록된 멘토가 없습니다"
            description="MongoDB 연결 후 터미널에서 npx tsx scripts/seed.ts 를 실행해 샘플 멘토를 넣거나, 멘토 계정으로 프로필을 등록하세요."
            actionLabel="홈으로"
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
            <p className="text-gray-600 dark:text-slate-400 text-lg">선택한 카테고리에 해당하는 멘토가 없습니다.</p>
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="mt-4 text-primary-600 font-semibold hover:underline"
            >
              필터 초기화
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
