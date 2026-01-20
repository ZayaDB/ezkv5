import { getTranslations } from 'next-intl/server';
import { mockStudyInfo } from '@/data/mockData';
import StudyInfoCard from '@/components/cards/StudyInfoCard';

export default async function StudyInKoreaPage() {
  const t = await getTranslations('studyInKorea');

  const categories = [
    { id: 'visa', label: t('visa'), icon: '🛂' },
    { id: 'housing', label: t('housing'), icon: '🏠' },
    { id: 'hospital', label: t('hospital'), icon: '🏥' },
    { id: 'lifeTips', label: t('lifeTips'), icon: '💡' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">{t('title')}</h1>
          <p className="text-xl text-white/90">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Navigation - Modern Design */}
        <div className="mb-12 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:from-primary-50 hover:to-primary-100 transition-all hover:scale-105"
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="font-semibold text-gray-700 group-hover:text-primary-600 transition-colors">
                  {category.label}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Study Info by Category */}
        {categories.map((category) => {
          const categoryInfo = mockStudyInfo.filter((info) => info.category === category.id);
          if (categoryInfo.length === 0) return null;

          return (
            <section key={category.id} id={category.id} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-3xl">{category.icon}</span>
                {category.label}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categoryInfo.map((info) => (
                  <StudyInfoCard key={info.id} info={info} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

