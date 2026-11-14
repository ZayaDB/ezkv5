'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { mentorsApi, sessionApi } from '@/lib/api/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import { storage } from '@/lib/storage';
import Link from 'next/link';
import {
  Star,
  MapPin,
  CheckCircle,
  MessageCircle,
  Clock,
  ArrowLeft,
  Heart,
} from 'lucide-react';
import { formatMentorHourlyPrice } from '@/lib/format/price';
import type { Mentor } from '@/types';
import Button from '@/components/ui/Button';

type MentorDetail = Mentor & { email?: string };

export default function MentorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const tMentors = useTranslations("mentors");
  const t = useTranslations("mentorDetail");
  const tCommon = useTranslations("common");
  const { user, isAuthenticated } = useAuth();
  const id = params.id as string;

  const [mentor, setMentor] = useState<MentorDetail | null | undefined>(undefined);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  const load = useCallback(async () => {
    const res = await mentorsApi.getById(id);
    if (res.error || !res.data) {
      setMentor(null);
      return;
    }
    const m = res.data as MentorDetail;
    setMentor(m);
    setIsFavorite(storage.isFavorite(m.id));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (mentor === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t("notFound")}</h1>
          <Link href={`/${locale}/mentors`} className="text-primary-600 font-semibold hover:underline">
            {t("backToList")}
          </Link>
        </div>
      </div>
    );
  }

  const priceDisplay = formatMentorHourlyPrice(mentor.price);

  const handleBookSession = async () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    if (isBooking) return;
    setIsBooking(true);
    setBookingMessage('');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);

    const result = await sessionApi.create({
      mentorId: mentor.id,
      date: tomorrow.toISOString(),
      duration: 60,
      type: 'online',
    });

    setIsBooking(false);
    if (result.error) {
      setBookingMessage(result.error);
      return;
    }
    setBookingMessage(t('bookingRequested'));
  };

  const toggleFavorite = () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`);
      return;
    }
    setIsFavorite(storage.toggleFavorite(mentor.id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}/mentors`}
            className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {tCommon("back")}
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden">
                {mentor.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mentor.photo}
                    alt={mentor.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <span className="text-5xl font-bold text-primary-600">{mentor.name.charAt(0)}</span>
                )}
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
                type="button"
                onClick={toggleFavorite}
                className={`p-4 rounded-xl transition-all ${
                  isFavorite ? 'bg-white text-red-500' : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                }`}
              >
                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500' : ''}`} />
              </button>
              <button
                type="button"
                onClick={handleBookSession}
                disabled={isBooking}
                className="px-8 py-4 bg-white text-primary-600 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isBooking ? t('booking') : t('bookSession')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="ds-panel p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("about")}</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{mentor.bio}</p>
            </div>
            <div className="ds-panel p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("mentoringInfo")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">{t("experience")}</span><p className="font-semibold text-gray-900">{t("years", { n: mentor.yearsOfExperience || 0 })}</p></div>
                <div><span className="text-gray-500">{t("sessionLength")}</span><p className="font-semibold text-gray-900">{t("minutes", { n: mentor.sessionDuration || 60 })}</p></div>
                <div><span className="text-gray-500">{t("sessionFormat")}</span><p className="font-semibold text-gray-900">{mentor.sessionFormat === 'offline' ? t('formatOffline') : mentor.sessionFormat === 'both' ? t('formatHybrid') : t('formatOnline')}</p></div>
                <div><span className="text-gray-500">{t("timezone")}</span><p className="font-semibold text-gray-900">{mentor.timezone || 'Asia/Seoul'}</p></div>
                <div className="md:col-span-2"><span className="text-gray-500">{t("education")}</span><p className="font-semibold text-gray-900">{mentor.education || tCommon('noInfo')}</p></div>
                <div className="md:col-span-2"><span className="text-gray-500">{t("careerSummary")}</span><p className="text-gray-700 whitespace-pre-line">{mentor.careerSummary || tCommon('noInfo')}</p></div>
                <div className="md:col-span-2"><span className="text-gray-500">{t("mentoringStyle")}</span><p className="text-gray-700 whitespace-pre-line">{mentor.mentoringStyle || tCommon('noInfo')}</p></div>
                <div className="md:col-span-2"><span className="text-gray-500">{t("recommendedFor")}</span><p className="text-gray-700 whitespace-pre-line">{mentor.recommendedFor || tCommon('noInfo')}</p></div>
                <div className="md:col-span-2"><span className="text-gray-500">{t("notRecommendedFor")}</span><p className="text-gray-700 whitespace-pre-line">{mentor.notRecommendedFor || tCommon('noInfo')}</p></div>
              </div>
            </div>

            <div className="ds-panel p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("specialties")}</h2>
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

            <div className="ds-panel p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("languages")}</h2>
              <div className="flex flex-wrap gap-3">
                {mentor.languages.map((lang) => (
                  <span key={lang} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="ds-panel p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t("bookingTitle")}</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-extrabold text-gray-900 mb-1">
                    {priceDisplay.free ? tMentors("free") : priceDisplay.label}
                  </div>
                  {priceDisplay.perHour ? (
                    <div className="text-sm text-gray-600">{tMentors("perHour")}</div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{t('avgResponse', { time: mentor.responseTime || t('defaultResponse') })}</span>
                </div>
                {mentor.availability === 'available' && (
                  <div className="px-4 py-2 bg-accent-50 text-accent-700 rounded-xl text-sm font-semibold text-center">
                    {t("inquiryAvailable")}
                  </div>
                )}
                <Button
                  type="button"
                  onClick={handleBookSession}
                  disabled={isBooking}
                  fullWidth
                  size="lg"
                >
                  {isBooking ? t('booking') : t('bookSession')}
                </Button>
                <Button
                  type="button"
                  onClick={handleBookSession}
                  variant="secondary"
                  fullWidth
                >
                  <MessageCircle className="w-5 h-5 inline mr-2" />
                  {t("sendMessage")}
                </Button>
                {bookingMessage && (
                  <p className="text-xs text-primary-700 font-semibold">{bookingMessage}</p>
                )}
              </div>
            </div>

            <div className="ds-panel p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t("stats")}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("reviewCount")}</span>
                  <span className="font-bold text-gray-900">{mentor.reviewCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("avgRating")}</span>
                  <span className="font-bold text-gray-900">{mentor.rating} ⭐</span>
                </div>
                {mentor.email && user?.role === 'admin' && (
                  <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">{t("adminOnly", { email: mentor.email })}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
