import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowRight, Users, BookOpen, MessageSquare, Briefcase, GraduationCap, Sparkles, Globe } from 'lucide-react';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('home');

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Modern Gradient Design */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 py-24 lg:py-32">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>한국 유학의 새로운 시작</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href={`/${locale}/mentors`}
                className="group inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                {t('cta')}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={`/${locale}/study-in-korea`}
                className="inline-flex items-center bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all border-2 border-white/30"
              >
                유학 가이드 보기
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-white/90">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-accent-300 rounded-full animate-pulse"></div>
                <span className="font-semibold">{t('trustedBy')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5" />
                <span className="font-semibold">{t('activeIn')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Modern Card Design */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              모든 것이 한 곳에
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              한국 유학에 필요한 모든 서비스를 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href={`/${locale}/mentors`}
              className="group relative bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">멘토 찾기</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  경험 많은 멘토들과 연결하여 비자, 주거, 학업 등 모든 것을 도와드립니다.
                </p>
                <div className="flex items-center text-primary-600 font-semibold group-hover:gap-2 transition-all">
                  자세히 보기
                  <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link
              href={`/${locale}/lectures`}
              className="group relative bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">강의</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  온라인 및 오프라인 강의를 통해 한국어와 전문 지식을 배우세요.
                </p>
                <div className="flex items-center text-primary-600 font-semibold group-hover:gap-2 transition-all">
                  자세히 보기
                  <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link
              href={`/${locale}/community`}
              className="group relative bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">커뮤니티</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  다른 유학생들과 경험을 공유하고 네트워크를 구축하세요.
                </p>
                <div className="flex items-center text-primary-600 font-semibold group-hover:gap-2 transition-all">
                  자세히 보기
                  <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link
              href={`/${locale}/freelancers`}
              className="group relative bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">프리랜서</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  프리랜서 일자리와 기회를 찾아 수입을 올리세요.
                </p>
                <div className="flex items-center text-primary-600 font-semibold group-hover:gap-2 transition-all">
                  자세히 보기
                  <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link
              href={`/${locale}/study-in-korea`}
              className="group relative bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">한국 유학 정보</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  비자, 주거, 병원, 생활 팁 등 한국 유학에 필요한 모든 정보.
                </p>
                <div className="flex items-center text-primary-600 font-semibold group-hover:gap-2 transition-all">
                  자세히 보기
                  <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

