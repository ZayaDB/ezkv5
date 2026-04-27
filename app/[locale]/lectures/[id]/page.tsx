'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { contentApi, enrollmentApi, lectureWishlistApi } from '@/lib/api/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';
import { Star, Users, Clock, PlayCircle, ArrowLeft, CheckCircle, Heart } from 'lucide-react';
import type { Lecture } from '@/types';
import Button from '@/components/ui/Button';

function syllabusFromDescription(description: string): string[] {
  const lines = description
    .split(/\n|•|-\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (lines.length >= 2) return lines.slice(0, 8);
  return [
    '커리큘럼 소개 및 학습 목표',
    '핵심 개념과 실습',
    '사례 기반 학습',
    '복습 및 Q&A',
    '과제 및 다음 단계 안내',
  ];
}

export default function LectureDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const id = params.id as string;

  const [lecture, setLecture] = useState<Lecture | null | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollMessage, setEnrollMessage] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);

  const load = useCallback(async () => {
    const res = await contentApi.getLecture(id);
    if (res.error || !res.data) {
      setLecture(null);
      return;
    }
    setLecture(res.data as Lecture);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let active = true;
    const checkEnrollment = async () => {
      if (!isAuthenticated) return;
      const res = await enrollmentApi.getMine();
      const list = res.data?.enrollments || [];
      if (!active) return;
      setIsEnrolled(list.some((e: any) => e?.lecture?.id === id));
    };
    checkEnrollment();
    return () => {
      active = false;
    };
  }, [id, isAuthenticated]);

  useEffect(() => {
    let active = true;
    const loadWishlist = async () => {
      if (!isAuthenticated) return;
      const res = await lectureWishlistApi.list();
      if (!active) return;
      const list = res.data?.wishlist || [];
      setIsWishlisted(list.some((w) => w.lectureId === id));
    };
    loadWishlist();
    return () => {
      active = false;
    };
  }, [id, isAuthenticated]);

  if (lecture === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">강의를 찾을 수 없습니다</h1>
          <Link href={`/${locale}/lectures`} className="text-primary-600 font-semibold hover:underline">
            강의 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const syllabus = syllabusFromDescription(lecture.description);

  const enroll = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    if (isEnrolled || isSubmitting) return;
    setIsSubmitting(true);
    setEnrollMessage('');
    const res = await enrollmentApi.create(id);
    setIsSubmitting(false);
    if (res.error) {
      setEnrollMessage(res.error);
      return;
    }
    setIsEnrolled(true);
    setEnrollMessage('수강 신청이 완료되었습니다.');
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    if (isWishlisted) {
      const res = await lectureWishlistApi.remove(id);
      if (!res.error) setIsWishlisted(false);
      return;
    }
    const res = await lectureWishlistApi.add(id);
    if (!res.error) setIsWishlisted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div
        className={`bg-gradient-to-br ${
          lecture.type === 'online'
            ? 'from-blue-600 via-blue-500 to-cyan-500'
            : 'from-green-600 via-green-500 to-emerald-500'
        } py-16`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}/lectures`}
            className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            뒤로 가기
          </Link>

          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-full md:w-96 h-64 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <PlayCircle className="w-24 h-24 text-white/90" />
            </div>

            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span
                  className={`px-4 py-2 rounded-xl font-semibold ${
                    lecture.type === 'online'
                      ? 'bg-blue-500/30 backdrop-blur-sm'
                      : 'bg-green-500/30 backdrop-blur-sm'
                  }`}
                >
                  {lecture.type === 'online' ? '온라인' : '오프라인'}
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl font-semibold">
                  {lecture.category}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{lecture.title}</h1>
              <p className="text-xl text-white/90 mb-6">{lecture.instructor}</p>

              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{lecture.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{lecture.students.toLocaleString()}명 수강</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{lecture.duration}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="text-4xl font-extrabold">₩{lecture.price.toLocaleString('ko-KR')}</div>
                <Button
                  type="button"
                  onClick={toggleWishlist}
                  className={`${
                    isWishlisted ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-white/20 text-white border border-white/30'
                  }`}
                  variant="ghost"
                >
                  <Heart className={`w-4 h-4 inline mr-2 ${isWishlisted ? 'fill-red-500' : ''}`} />
                  {isWishlisted ? '찜됨' : '찜하기'}
                </Button>
                <Button
                  type="button"
                  onClick={enroll}
                  disabled={isSubmitting || isEnrolled}
                  variant="secondary"
                  size="lg"
                >
                  {isSubmitting ? '신청 중...' : isEnrolled ? '수강 신청 완료' : '지금 등록하기'}
                </Button>
              </div>
              {enrollMessage && (
                <p className="text-sm font-semibold text-white/90 mt-3">{enrollMessage}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="ds-panel p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">강의 소개</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{lecture.description}</p>
            </div>
            <div className="ds-panel p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">학습 안내</h2>
              <div className="space-y-4 text-sm text-gray-700">
                <div><p className="text-gray-500">짧은 소개</p><p className="font-medium">{lecture.shortDescription || '정보 없음'}</p></div>
                <div><p className="text-gray-500">대상 학습자</p><p className="whitespace-pre-line">{lecture.targetAudience || '정보 없음'}</p></div>
                <div><p className="text-gray-500">사전 요구사항</p><p className="whitespace-pre-line">{lecture.prerequisites || '없음'}</p></div>
                {lecture.whatYouWillLearn && lecture.whatYouWillLearn.length > 0 && (
                  <div>
                    <p className="text-gray-500 mb-1">배우게 될 내용</p>
                    <ul className="list-disc pl-5 space-y-1">{lecture.whatYouWillLearn.map((x, i) => <li key={i}>{x}</li>)}</ul>
                  </div>
                )}
              </div>
            </div>

            <div className="ds-panel p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">커리큘럼 하이라이트</h2>
              <ul className="space-y-3">
                {syllabus.map((line, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="ds-panel p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">강의 정보</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-gray-600 mb-1">강사</div>
                  <div className="font-semibold text-gray-900">{lecture.instructor}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">기간</div>
                  <div className="font-semibold text-gray-900">{lecture.duration}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">난이도</div>
                  <div className="font-semibold text-gray-900">{lecture.difficulty || 'beginner'}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">총 레슨 / 시간</div>
                  <div className="font-semibold text-gray-900">{lecture.totalLessons || 0}개 / {lecture.totalHours || 0}h</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">최대 수강생</div>
                  <div className="font-semibold text-gray-900">{lecture.maxStudents || 30}명</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">수강생</div>
                  <div className="font-semibold text-gray-900">{lecture.students.toLocaleString()}명</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">평점</div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">{lecture.rating}</span>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={enroll}
                  disabled={isSubmitting || isEnrolled}
                  fullWidth
                  size="lg"
                >
                  {isSubmitting ? '신청 중...' : isEnrolled ? '수강 신청 완료' : '지금 등록하기'}
                </Button>
                {enrollMessage && (
                  <p className="text-xs text-primary-700 font-semibold">{enrollMessage}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
