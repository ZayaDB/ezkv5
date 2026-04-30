'use client';

import Link from 'next/link';
import { Mentor } from '@/types';
import { Star, MapPin, CheckCircle, ArrowRight, Users } from 'lucide-react';
import { useLocale } from 'next-intl';
import { formatMentorHourlyPrice } from '@/lib/format/price';

interface MentorCardProps {
  mentor: Mentor;
}

export default function MentorCard({ mentor }: MentorCardProps) {
  const locale = useLocale();
  const priceDisplay = formatMentorHourlyPrice(mentor.price);

  return (
    <Link href={`/${locale}/mentors/${mentor.id}`}>
      <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-700 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 overflow-hidden relative">
        <div className="relative aspect-[16/9] bg-gradient-to-br from-accent-100 to-primary-100 dark:from-accent-900/30 dark:to-primary-900/20 overflow-hidden">
          {mentor.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mentor.photo}
              alt={mentor.name}
              className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="w-14 h-14 text-accent-400/70" />
            </div>
          )}
          <div className="absolute top-3 left-3 inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold bg-white/90 dark:bg-slate-900/85 text-accent-700 dark:text-accent-300">
            {mentor.specialties[0] || '멘토'}
          </div>
          <div className="absolute top-3 right-3 inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold bg-white/90 dark:bg-slate-900/85 text-amber-700">
            <Star className="w-3.5 h-3.5 mr-1 fill-amber-500 text-amber-500" />
            {mentor.rating.toFixed(1)}
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 truncate group-hover:text-primary-700 transition-colors">
              {mentor.name}
            </h3>
            {mentor.verified && (
              <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3.5 h-3.5 mr-1 fill-emerald-500 text-emerald-500" />
                인증
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-slate-300 truncate">{mentor.title}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin className="w-4 h-4 text-gray-400 dark:text-slate-500" />
            <span className="text-sm text-gray-500 dark:text-slate-400">{mentor.location}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {mentor.specialties.slice(0, 3).map((specialty) => (
              <span
                key={specialty}
                className="px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 text-xs font-medium"
              >
                {specialty}
              </span>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 dark:text-slate-400">
                리뷰 {mentor.reviewCount.toLocaleString()}개
              </span>
              {mentor.availability === 'available' && (
                <span className="px-2.5 py-1 bg-emerald-500 text-white text-[11px] font-semibold rounded-full">
                  예약 가능
                </span>
              )}
            </div>
            <div className="inline-flex items-center text-xs font-semibold text-primary-700 dark:text-primary-300">
              자세히 보기
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div className="mt-3">
            <span className="text-base sm:text-lg font-bold text-primary-600">{priceDisplay.label}</span>
            {priceDisplay.suffix && (
              <span className="text-xs text-gray-500 dark:text-slate-400 ml-1">{priceDisplay.suffix}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}


