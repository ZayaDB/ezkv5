import { getTranslations } from 'next-intl/server';
import { queryCommunityGroups } from '@/lib/data/queries';
import CommunityCard from '@/components/cards/CommunityCard';
import EmptyState from '@/components/ui/EmptyState';
import PublicFeedSection from '@/components/feed/PublicFeedSection';
import type { CommunityGroup } from '@/types';

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('community');

  let groups: CommunityGroup[] = [];
  try {
    groups = await queryCommunityGroups({ limit: 200 });
  } catch {
    groups = [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 py-16">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(ellipse_at_top_right,_white,_transparent_55%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">{t('title')}</h1>
          <p className="text-xl text-white/90 max-w-2xl">{t('subtitle')}</p>
          <p className="mt-4 text-white/80 text-sm font-medium">{groups.length}개 그룹</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {groups.length === 0 ? (
          <EmptyState
            title="커뮤니티 그룹이 없습니다"
            description="시드 데이터를 삽입하면 그룹 카드가 표시됩니다."
            actionLabel="홈으로"
            actionHref={`/${locale}`}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <CommunityCard key={group.id} group={group} />
            ))}
          </div>
        )}

        <section className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">{t('feedSectionTitle')}</h2>
          <p className="text-sm text-zinc-600 mb-6">{t('feedSectionSubtitle')}</p>
          <PublicFeedSection feedType="community" />
        </section>
      </div>
    </div>
  );
}
