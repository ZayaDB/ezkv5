'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { mockLectures } from '@/data/mockData';
import LectureCard from '@/components/cards/LectureCard';

export default function LecturesPage() {
  const t = useTranslations('lectures');
  const locale = useLocale();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Filter lectures by type
  const filteredLectures = selectedType
    ? mockLectures.filter((lecture) => lecture.type === selectedType)
    : mockLectures;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-accent-600 via-accent-500 to-primary-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">{t('title')}</h1>
          <p className="text-xl text-white/90">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Type Filter - Modern Design */}
        <div className="mb-10 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                selectedType === null
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md hover:shadow-lg hover:scale-105'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              {t('all')}
            </button>
            <button
              onClick={() => setSelectedType('online')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                selectedType === 'online'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md hover:shadow-lg hover:scale-105'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              {t('online')}
            </button>
            <button
              onClick={() => setSelectedType('offline')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                selectedType === 'offline'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md hover:shadow-lg hover:scale-105'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              {t('offline')}
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-600">
          {filteredLectures.length}개의 강의를 찾았습니다
        </div>

        {/* Lectures Grid */}
        {filteredLectures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLectures.map((lecture) => (
              <LectureCard key={lecture.id} lecture={lecture} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">선택한 타입에 해당하는 강의가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
