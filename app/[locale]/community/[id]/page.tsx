'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { contentApi } from '@/lib/api/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';
import { Users, Hash, ArrowLeft } from 'lucide-react';
import type { CommunityGroup } from '@/types';

export default function CommunityDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('community');
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const id = params.id as string;

  const [group, setGroup] = useState<CommunityGroup | null | undefined>(undefined);

  const load = useCallback(async () => {
    const res = await contentApi.getCommunity(id);
    if (res.error || !res.data) {
      setGroup(null);
      return;
    }
    setGroup(res.data as CommunityGroup);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleJoin = () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    alert(`${group?.name} 가입 요청이 접수되었습니다. (승인·채팅 연동은 준비 중입니다)`);
  };

  if (group === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">커뮤니티를 찾을 수 없습니다</h1>
          <Link href={`/${locale}/community`} className="text-primary-600 font-semibold hover:underline">
            커뮤니티 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const highlights = [
    { title: `${group.name} 오리엔테이션`, excerpt: '신입 멤버를 위한 가이드라인과 자주 묻는 질문을 정리했습니다.', meta: '운영진 · 1일 전' },
    { title: '이번 주 모임 일정 공유', excerpt: '오프라인·온라인 모임 시간을 투표로 정합니다. 참여해 주세요.', meta: '멤버 · 3일 전' },
    { title: '정보 공유: 체류·비자 팁', excerpt: '최근 유학생 커뮤니티에서 논의된 체류 관련 링크와 주의사항입니다.', meta: '멤버 · 5일 전' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
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
            <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <Hash className="w-16 h-16 text-white" />
            </div>

            <div className="flex-1 text-white">
              <div className="mb-4">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl font-semibold">
                  {group.category}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{group.name}</h1>
              <p className="text-xl text-white/90 mb-6 max-w-3xl">{group.description}</p>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  <span className="text-2xl font-bold">{group.members.toLocaleString()}명</span>
                </div>
              </div>

              <button
                type="button"
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
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">그룹 하이라이트</h2>
              <p className="text-gray-600 text-sm mb-6">
                실제 게시판 연동 전까지, 이 그룹에서 다루는 대표 주제를 미리 보여 드립니다.
              </p>
              <div className="space-y-4">
                {highlights.map((post, i) => (
                  <div
                    key={i}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{post.excerpt}</p>
                    <div className="text-xs text-gray-500">{post.meta}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
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
                  type="button"
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
