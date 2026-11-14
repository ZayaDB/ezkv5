'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { intlLocale } from '@/lib/i18n/config';
import { contentApi, enrollmentApi, lectureWishlistApi } from '@/lib/api/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';
import { Star, Users, Clock, PlayCircle, ArrowLeft, CheckCircle, Heart } from 'lucide-react';
import type { Lecture } from '@/types';
import Button from '@/components/ui/Button';

function syllabusFromDescription(description: string, fallback: string[]): string[] {
  const lines = description
    .split(/\n|•|-\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (lines.length >= 2) return lines.slice(0, 8);
  return fallback;
}

export default function LectureDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const tLec = useTranslations('lectures');
  const t = useTranslations('lectureDetail');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
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

  const isOwner = Boolean(user?.id && lecture?.instructorId && user.id === lecture.instructorId);

  useEffect(() => {
    let active = true;
    const checkEnrollment = async () => {
      if (!isAuthenticated || isOwner) return;
      const res = await enrollmentApi.getMine();
      const list = res.data?.enrollments || [];
      if (!active) return;
      setIsEnrolled(list.some((e: any) => e?.lecture?.id === id));
    };
    checkEnrollment();
    return () => {
      active = false;
    };
  }, [id, isAuthenticated, isOwner]);

  useEffect(() => {
    let active = true;
    const loadWishlist = async () => {
      if (!isAuthenticated || isOwner) return;
      const res = await lectureWishlistApi.list();
      if (!active) return;
      const list = res.data?.wishlist || [];
      setIsWishlisted(list.some((w) => w.lectureId === id));
    };
    loadWishlist();
    return () => {
      active = false;
    };
  }, [id, isAuthenticated, isOwner]);

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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t("notFound")}</h1>
          <Link href={`/${locale}/lectures`} className="text-primary-600 font-semibold hover:underline">
            {t("backToList")}
          </Link>
        </div>
      </div>
    );
  }

  const syllabus = syllabusFromDescription(lecture.description, t.raw("defaultCurriculum") as string[]);

  const enroll = async () => {
    if (isOwner) return;
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
    setEnrollMessage(t('enrolledMsg'));
  };

  const toggleWishlist = async () => {
    if (isOwner) return;
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
            {tCommon("back")}
          </Link>

          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-full md:w-96 h-64 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden relative">
              {lecture.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={lecture.image}
                  alt={lecture.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PlayCircle className="w-24 h-24 text-white/90" />
                </div>
              )}
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
                  {lecture.type === 'online' ? tLec('online') : tLec('offline')}
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
                  <span>{t("studentsEnrolled", { count: lecture.students.toLocaleString(intlLocale(locale)) })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{lecture.duration}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="text-4xl font-extrabold">₩{lecture.price.toLocaleString('ko-KR')}</div>
                {isOwner ? (
                  <Link
                    href={`/${locale}/my/lectures`}
                    className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-white/90"
                  >
                    {tLec('ownCourse')} · {tLec('manageOwn')}
                  </Link>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={toggleWishlist}
                      className={`${
                        isWishlisted ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-white/20 text-white border border-white/30'
                      }`}
                      variant="ghost"
                    >
                      <Heart className={`w-4 h-4 inline mr-2 ${isWishlisted ? 'fill-red-500' : ''}`} />
                      {isWishlisted ? t('wishlisted') : t('wishlist')}
                    </Button>
                    <Button
                      type="button"
                      onClick={enroll}
                      disabled={isSubmitting || isEnrolled}
                      variant="secondary"
                      size="lg"
                    >
                      {isSubmitting ? t('enrolling') : isEnrolled ? t('enrolled') : t('enrollNow')}
                    </Button>
                  </>
                )}
              </div>
              {!isOwner && enrollMessage && (
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("about")}</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{lecture.description}</p>
            </div>
            <div className="ds-panel p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("learningGuide")}</h2>
              <div className="space-y-4 text-sm text-gray-700">
                <div><p className="text-gray-500">{t("shortDescription")}</p><p className="font-medium">{lecture.shortDescription || tCommon('noInfo')}</p></div>
                <div><p className="text-gray-500">{t("targetAudience")}</p><p className="whitespace-pre-line">{lecture.targetAudience || tCommon('noInfo')}</p></div>
                <div><p className="text-gray-500">{t("prerequisites")}</p><p className="whitespace-pre-line">{lecture.prerequisites || tCommon('none')}</p></div>
                {lecture.whatYouWillLearn && lecture.whatYouWillLearn.length > 0 && (
                  <div>
                    <p className="text-gray-500 mb-1">{t("whatYouLearn")}</p>
                    <ul className="list-disc pl-5 space-y-1">{lecture.whatYouWillLearn.map((x, i) => <li key={i}>{x}</li>)}</ul>
                  </div>
                )}
              </div>
            </div>

            <div className="ds-panel p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("curriculumHighlights")}</h2>
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
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t("info")}</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-gray-600 mb-1">{t("instructor")}</div>
                  <div className="font-semibold text-gray-900">{lecture.instructor}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">{t("duration")}</div>
                  <div className="font-semibold text-gray-900">{lecture.duration}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">{t("level")}</div>
                  <div className="font-semibold text-gray-900">{lecture.difficulty || 'beginner'}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">{t("lessonsHours")}</div>
                  <div className="font-semibold text-gray-900">{t("lessonsHoursValue", { lessons: lecture.totalLessons || 0, hours: lecture.totalHours || 0 })}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">{t("maxStudents")}</div>
                  <div className="font-semibold text-gray-900">{tCommon("peopleCount", { count: lecture.maxStudents || 30 })}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">{t("students")}</div>
                  <div className="font-semibold text-gray-900">{tCommon("peopleCount", { count: lecture.students.toLocaleString(intlLocale(locale)) })}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">{t("rating")}</div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">{lecture.rating}</span>
                  </div>
                </div>
                {isOwner ? (
                  <Link
                    href={`/${locale}/my/lectures`}
                    className="block w-full text-center rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700"
                  >
                    {tLec('manageOwn')}
                  </Link>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={enroll}
                      disabled={isSubmitting || isEnrolled}
                      fullWidth
                      size="lg"
                    >
                      {isSubmitting ? t('enrolling') : isEnrolled ? t('enrolled') : t('enrollNow')}
                    </Button>
                    {enrollMessage && (
                      <p className="text-xs text-primary-700 font-semibold">{enrollMessage}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
