import { getTranslations } from 'next-intl/server';
import { mockFreelancerGroups } from '@/data/mockData';
import FreelancerCard from '@/components/cards/FreelancerCard';

export default async function FreelancersPage() {
  const t = await getTranslations('freelancers');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-600 via-red-500 to-pink-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">{t('title')}</h1>
          <p className="text-xl text-white/90">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Freelancer Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockFreelancerGroups.map((group) => (
            <FreelancerCard key={group.id} group={group} />
          ))}
        </div>
      </div>
    </div>
  );
}

