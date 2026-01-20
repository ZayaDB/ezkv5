'use client';

import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { mockLectures } from '@/data/mockData';
import Link from 'next/link';
import { Star, Users, Clock, PlayCircle, ArrowLeft, CheckCircle } from 'lucide-react';

export default function LectureDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const lecture = mockLectures.find((l) => l.id === params.id);

  if (!lecture) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">강의를 찾을 수 없습니다</h1>
          <Link href={`/${locale}/lectures`} className="text-primary-600 hover:text-primary-700">
            강의 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className={`bg-gradient-to-br ${
        lecture.type === 'online' 
          ? 'from-blue-600 via-blue-500 to-cyan-500'
          : 'from-green-600 via-green-500 to-emerald-500'
      } py-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}/lectures`}
            className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            뒤로 가기
          </Link>
          
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-full md:w-96 h-64 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <PlayCircle className="w-24 h-24 text-white/80" />
            </div>
            
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-4 py-2 rounded-xl font-semibold ${
                  lecture.type === 'online'
                    ? 'bg-blue-500/30 backdrop-blur-sm'
                    : 'bg-green-500/30 backdrop-blur-sm'
                }`}>
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

              <div className="flex items-center gap-4">
                <div>
                  <div className="text-4xl font-extrabold">₩{lecture.price.toLocaleString()}</div>
                </div>
                <button className="px-8 py-4 bg-white text-primary-600 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg hover:scale-105">
                  지금 등록하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">강의 소개</h2>
              <p className="text-gray-600 leading-relaxed">{lecture.description}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">강의 내용</h2>
              <ul className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">강의 내용 {i}: 상세 설명이 여기에 표시됩니다</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">강의 정보</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">강사</div>
                  <div className="font-semibold text-gray-900">{lecture.instructor}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">기간</div>
                  <div className="font-semibold text-gray-900">{lecture.duration}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">수강생</div>
                  <div className="font-semibold text-gray-900">{lecture.students.toLocaleString()}명</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">평점</div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">{lecture.rating}</span>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all hover:scale-[1.02]">
                  지금 등록하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


