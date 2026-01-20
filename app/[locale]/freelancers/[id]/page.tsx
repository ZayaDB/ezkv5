'use client';

import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { mockFreelancerGroups } from '@/data/mockData';
import { auth } from '@/lib/auth/localStorage';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Briefcase, ArrowLeft, TrendingUp } from 'lucide-react';

export default function FreelancerDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('freelancers');
  const router = useRouter();
  const group = mockFreelancerGroups.find((g) => g.id === params.id);
  const user = auth.getCurrentUser();

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">프리랜서 그룹을 찾을 수 없습니다</h1>
          <Link href={`/${locale}/freelancers`} className="text-primary-600 hover:text-primary-700">
            프리랜서 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const handleJoin = () => {
    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }
    alert(`${group.name}에 가입되었습니다!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-600 via-red-500 to-pink-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}/freelancers`}
            className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            뒤로 가기
          </Link>
          
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-16 h-16 text-white" />
            </div>
            
            <div className="flex-1 text-white">
              <div className="mb-4">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl font-semibold">
                  {group.category}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{group.name}</h1>
              <p className="text-xl text-white/90 mb-6">{group.description}</p>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  <span className="text-2xl font-bold">{group.members.toLocaleString()}명</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-6 h-6" />
                  <span className="text-2xl font-bold">{group.jobsPosted}개</span>
                </div>
              </div>

              <button
                onClick={handleJoin}
                className="px-8 py-4 bg-white text-primary-600 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg hover:scale-105"
              >
                {t('join')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Available Jobs */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">채용 공고</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-2">프로젝트 제목 {i}</h3>
                    <p className="text-sm text-gray-600 mb-4">프로젝트 설명이 여기에 표시됩니다...</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>예산: ₩500,000 - ₩1,000,000</span>
                        <span>•</span>
                        <span>기간: 2주</span>
                      </div>
                      <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-semibold">
                        지원하기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">그룹 정보</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">멤버</div>
                  <div className="text-2xl font-bold text-gray-900">{group.members.toLocaleString()}명</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">활성 채용 공고</div>
                  <div className="text-2xl font-bold text-gray-900">{group.jobsPosted}개</div>
                </div>
                <button
                  onClick={handleJoin}
                  className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  {t('join')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


