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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="relative overflow-hidden bg-gradient-to-br from-accent-600 via-accent-500 to-primary-500 py-16">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">{t('title')}</h1>
          <p className="text-xl text-white/90 max-w-2xl">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSelectedType(null)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                selectedType === null
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300'
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
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300'
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
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300'
              }`}
            >
              {t('offline')}
            </button>
          </div>
        </div>

        <div className="mb-6 text-gray-600">
          <span className="font-semibold text-gray-900">{filtered.length}</span>개의 강의
        </div>

        {initialLectures.length === 0 ? (
          <EmptyState
            title="등록된 강의가 없습니다"
            description="시드 스크립트를 실행하면 샘플 강의가 표시됩니다."
            actionLabel="홈으로"
            actionHref={`/${locale}`}
          />
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((lecture) => (
              <LectureCard key={lecture.id} lecture={lecture} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-600">선택한 타입에 해당하는 강의가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
