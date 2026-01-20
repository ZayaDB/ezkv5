'use client';

import Link from 'next/link';
import { Mentor } from '@/types';
import { Star, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import { useLocale } from 'next-intl';

interface MentorCardProps {
  mentor: Mentor;
}

export default function MentorCard({ mentor }: MentorCardProps) {
  const locale = useLocale();

  return (
    <Link href={`/${locale}/mentors/${mentor.id}`}>
      <div className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 overflow-hidden relative">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
        
        <div className="relative">
          <div className="flex items-start gap-4 mb-5">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-3xl font-bold text-white">
                  {mentor.name.charAt(0)}
                </span>
              </div>
              {mentor.verified && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                  <CheckCircle className="w-5 h-5 text-primary-500 fill-primary-500" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 truncate mb-1 group-hover:text-primary-600 transition-colors">
                {mentor.name}
              </h3>
              <p className="text-sm text-gray-600 truncate mb-2">{mentor.title}</p>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">{mentor.location}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-base font-bold text-gray-900">{mentor.rating}</span>
            </div>
            <span className="text-sm text-gray-500">({mentor.reviewCount.toLocaleString()} reviews)</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {mentor.specialties.slice(0, 3).map((specialty) => (
              <span
                key={specialty}
                className="px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 group-hover:border-primary-200 group-hover:bg-primary-50 transition-all"
              >
                {specialty}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-gray-100">
            <div>
              <span className="text-3xl font-extrabold text-gray-900">
                {mentor.price === 'Free' ? '무료' : `₩${(mentor.price * 1300).toLocaleString()}`}
              </span>
              {mentor.price !== 'Free' && (
                <span className="text-sm text-gray-500 ml-1">/시간</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {mentor.availability === 'available' && (
                <span className="px-3 py-1.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-xs font-semibold rounded-full shadow-sm">
                  예약 가능
                </span>
              )}
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}


