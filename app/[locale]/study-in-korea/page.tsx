import { getTranslations } from 'next-intl/server';
import { queryStudyInfos } from '@/lib/data/queries';
import StudyInfoCard from '@/components/cards/StudyInfoCard';
import EmptyState from '@/components/ui/EmptyState';
import type { StudyInfo } from '@/types';

export default async function StudyInKoreaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('studyInKorea');

  let items: StudyInfo[] = [];
  try {
    items = await queryStudyInfos();
  } catch {
    items = [];
  }

  const categories = [
    { id: 'visa', label: t('visa'), icon: '🛂' },
    { id: 'housing', label: t('housing'), icon: '🏠' },
    { id: 'hospital', label: t('hospital'), icon: '🏥' },
    { id: 'lifeTips', label: t('lifeTips'), icon: '💡' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 py-10">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">{t('title')}</h1>
          <p className="text-base text-white/90 max-w-xl">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:from-primary-50 hover:to-primary-100 transition-all hover:scale-[1.02]"
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="font-semibold text-gray-700 group-hover:text-primary-600 transition-colors">
                  {category.label}
                </span>
              </a>
            ))}
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyState
            title={t('emptyTitle')}
            description={t('emptyDescription')}
            actionLabel={t('emptyAction')}
            actionHref={`/${locale}`}
          />
        ) : (
          categories.map((category) => {
            const categoryInfo = items.filter((info) => info.category === category.id);
            if (categoryInfo.length === 0) return null;

            return (
              <section key={category.id} id={category.id} className="mb-16 scroll-mt-24">
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
          })
        )}
      </div>
    </div>
  );
}
