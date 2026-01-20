'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { mockMentors } from '@/data/mockData';
import MentorCard from '@/components/cards/MentorCard';

export default function MentorsPage() {
  const t = useTranslations('mentors');
  const locale = useLocale();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter mentors by category
  const filteredMentors = selectedCategory
    ? mockMentors.filter((mentor) => 
        mentor.specialties.some((s) => 
          s.toLowerCase().includes(selectedCategory.toLowerCase())
        )
      )
    : mockMentors;

  const categories = [
    { key: 'visa', label: t('categories.visa') },
    { key: 'housing', label: t('categories.housing') },
    { key: 'healthcare', label: t('categories.healthcare') },
    { key: 'academic', label: t('categories.academic') },
    { key: 'career', label: t('categories.career') },
    { key: 'dailyLife', label: t('categories.dailyLife') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">{t('title')}</h1>
          <p className="text-xl text-white/90">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters - Modern Design */}
        <div className="mb-10 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                selectedCategory === null
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md hover:shadow-lg hover:scale-105'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              전체
            </button>
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  selectedCategory === category.key
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md hover:shadow-lg hover:scale-105'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-600">
          {filteredMentors.length}명의 멘토를 찾았습니다
        </div>

        {/* Mentors Grid */}
        {filteredMentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">선택한 카테고리에 해당하는 멘토가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
