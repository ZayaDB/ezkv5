'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { contentApi } from '@/lib/api/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';
import { Users, Briefcase, ArrowLeft, TrendingUp } from 'lucide-react';
import type { FreelancerGroup } from '@/types';

export default function FreelancerDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('freelancers');
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const id = params.id as string;

  const [group, setGroup] = useState<FreelancerGroup | null | undefined>(undefined);
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');

  const load = useCallback(async () => {
    const res = await contentApi.getFreelancer(id);
    if (res.error || !res.data) {
      setGroup(null);
      return;
    }
    setGroup(res.data as FreelancerGroup);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    if (applying) return;
    setApplying(true);
    setApplyMessage('');
    const res = await contentApi.applyFreelancer(id);
    setApplying(false);
    if (res.error) {
      setApplyMessage(res.error);
      return;
    }
    setApplyMessage(`${group?.name} 참여 신청이 접수되었습니다.`);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">프리랜서 그룹을 찾을 수 없습니다</h1>
          <Link href={`/${locale}/freelancers`} className="text-primary-600 font-semibold hover:underline">
            프리랜서 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const sampleJobs = [
    {
      title: `${group.category} 단기 프로젝트`,
      desc: '2주 내 납품 가능한 분을 찾습니다. 포트폴리오 링크를 지원 시 첨부해 주세요.',
      budget: '₩600,000 – ₩1,200,000',
      dur: '2주',
    },
    {
      title: '원격 협업 · 정기 유지보수',
      desc: '월 단위 소규모 업데이트와 문의 대응이 가능한 분을 우대합니다.',
      budget: '월 ₩400,000~',
      dur: '3개월+',
    },
    {
      title: '긴급 · 원데이 미팅 상담',
      desc: '오프라인/화상으로 1회성 컨설팅이 필요합니다.',
      budget: '₩150,000',
      dur: '1일',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
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
            <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <TrendingUp className="w-16 h-16 text-white" />
            </div>

            <div className="flex-1 text-white">
              <div className="mb-4">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl font-semibold">
                  {group.category}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{group.name}</h1>
              <p className="text-xl text-white/90 mb-6 max-w-3xl">{group.description}</p>

              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  <span className="text-2xl font-bold">{group.members.toLocaleString()}명</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-6 h-6" />
                  <span className="text-2xl font-bold">{group.jobsPosted}건+ 공고</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleJoin}
                disabled={applying}
                className="px-8 py-4 bg-white text-primary-600 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {applying ? '처리 중...' : t('join')}
              </button>
              {applyMessage && <p className="text-sm font-semibold text-white/90 mt-3">{applyMessage}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">샘플 채용 공고</h2>
              <p className="text-gray-600 text-sm mb-6">
                실제 지원·결제 연동 전, 이 카테고리에서 자주 올라오는 형태의 공고 예시입니다.
              </p>
              <div className="space-y-4">
                {sampleJobs.map((job, i) => (
                  <div
                    key={i}
                    className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary-200 transition-colors"
                  >
                    <h3 className="font-bold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{job.desc}</p>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span>예산: {job.budget}</span>
                        <span>·</span>
                        <span>기간: {job.dur}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleJoin}
                        disabled={applying}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-semibold shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {applying ? '처리 중...' : '지원하기'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">그룹 정보</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">멤버</div>
                  <div className="text-2xl font-bold text-gray-900">{group.members.toLocaleString()}명</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">활성 채용 공고(표시)</div>
                  <div className="text-2xl font-bold text-gray-900">{group.jobsPosted}건</div>
                </div>
                <button
                  type="button"
                  onClick={handleJoin}
                  disabled={applying}
                  className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {applying ? '처리 중...' : t('join')}
                </button>
                {applyMessage && <p className="text-xs text-primary-700 font-semibold">{applyMessage}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
