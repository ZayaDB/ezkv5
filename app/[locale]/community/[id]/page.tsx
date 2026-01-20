'use client';

import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { mockCommunityGroups } from '@/data/mockData';
import { auth } from '@/lib/auth/localStorage';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Hash, ArrowLeft, MessageSquare, Calendar } from 'lucide-react';

export default function CommunityDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('community');
  const router = useRouter();
  const group = mockCommunityGroups.find((g) => g.id === params.id);
  const user = auth.getCurrentUser();

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">커뮤니티를 찾을 수 없습니다</h1>
          <Link href={`/${locale}/community`} className="text-primary-600 hover:text-primary-700">
            커뮤니티 목록으로 돌아가기
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
      <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}/community`}
            className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            뒤로 가기
          </Link>
          
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Hash className="w-16 h-16 text-white" />
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
            {/* Recent Posts */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">최근 게시글</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <h3 className="font-semibold text-gray-900 mb-2">샘플 게시글 제목 {i}</h3>
                    <p className="text-sm text-gray-600 mb-2">게시글 내용이 여기에 표시됩니다...</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>작성자 이름</span>
                      <span>•</span>
                      <span>2시간 전</span>
                      <span>•</span>
                      <span>12 댓글</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">커뮤니티 정보</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">멤버</div>
                  <div className="text-2xl font-bold text-gray-900">{group.members.toLocaleString()}명</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">태그</div>
                  <div className="flex flex-wrap gap-2">
                    {group.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
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


