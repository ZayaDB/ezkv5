'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { mockMentors } from '@/data/mockData';
import { auth } from '@/lib/auth/localStorage';
import { storage } from '@/lib/storage';
import Link from 'next/link';
import { Star, MapPin, CheckCircle, MessageCircle, Calendar, Clock, ArrowLeft, Heart } from 'lucide-react';
import { useState } from 'react';

export default function MentorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('mentors');
  const mentor = mockMentors.find((m) => m.id === params.id);
  const user = auth.getCurrentUser();
  const [isFavorite, setIsFavorite] = useState(storage.isFavorite(mentor?.id || ''));

  if (!mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">멘토를 찾을 수 없습니다</h1>
          <Link
            href={`/${locale}/mentors`}
            className="text-primary-600 hover:text-primary-700"
          >
            멘토 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const handleBookSession = () => {
    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }
    // In real app, this would open booking modal
    alert('세션 예약 기능은 곧 추가될 예정입니다!');
  };

  const toggleFavorite = () => {
    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }
    const newState = storage.toggleFavorite(mentor.id);
    setIsFavorite(newState);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}/mentors`}
            className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            뒤로 가기
          </Link>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-5xl font-bold text-primary-600">{mentor.name.charAt(0)}</span>
              </div>
              {mentor.verified && (
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                  <CheckCircle className="w-6 h-6 text-primary-500 fill-primary-500" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-white">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-3">{mentor.name}</h1>
              <p className="text-xl text-white/90 mb-4">{mentor.title}</p>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{mentor.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{mentor.rating}</span>
                  <span className="text-white/80">({mentor.reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={toggleFavorite}
                className={`p-4 rounded-xl transition-all ${
                  isFavorite
                    ? 'bg-white text-red-500'
                    : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                }`}
              >
                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500' : ''}`} />
              </button>
              <button
                onClick={handleBookSession}
                className="px-8 py-4 bg-white text-primary-600 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg hover:scale-105"
              >
                세션 예약하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">소개</h2>
              <p className="text-gray-600 leading-relaxed">{mentor.bio}</p>
            </div>

            {/* Specialties */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">전문 분야</h2>
              <div className="flex flex-wrap gap-3">
                {mentor.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="px-4 py-2 bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700 rounded-xl font-semibold border border-primary-200"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">언어</h2>
              <div className="flex flex-wrap gap-3">
                {mentor.languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">세션 예약</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-extrabold text-gray-900 mb-1">
                    {mentor.price === 'Free' ? '무료' : `₩${(mentor.price * 1300).toLocaleString()}`}
                  </div>
                  {mentor.price !== 'Free' && (
                    <div className="text-sm text-gray-600">/시간</div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>평균 응답 시간: 2시간</span>
                </div>
                {mentor.availability === 'available' && (
                  <div className="px-4 py-2 bg-accent-50 text-accent-700 rounded-xl text-sm font-semibold text-center">
                    이번 주 예약 가능
                  </div>
                )}
                <button
                  onClick={handleBookSession}
                  className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all hover:scale-[1.02]"
                >
                  세션 예약하기
                </button>
                <button className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:border-primary-300 hover:text-primary-600 transition-all">
                  <MessageCircle className="w-5 h-5 inline mr-2" />
                  메시지 보내기
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">통계</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">총 세션</span>
                  <span className="font-bold text-gray-900">1,200+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">응답률</span>
                  <span className="font-bold text-gray-900">99%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">평균 평점</span>
                  <span className="font-bold text-gray-900">{mentor.rating} ⭐</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


