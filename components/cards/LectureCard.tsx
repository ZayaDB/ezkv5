'use client';

import Link from 'next/link';
import { Lecture } from '@/types';
import { Star, Users, Clock, ArrowRight, PlayCircle } from 'lucide-react';
import { useLocale } from 'next-intl';

interface LectureCardProps {
  lecture: Lecture;
}

export default function LectureCard({ lecture }: LectureCardProps) {
  const locale = useLocale();

  return (
    <Link href={`/${locale}/lectures/${lecture.id}`}>
      <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 relative">
        {/* Image with gradient overlay */}
        <div className="relative h-48 bg-gradient-to-br from-primary-400 via-primary-500 to-accent-500 overflow-hidden">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayCircle className="w-16 h-16 text-white/80 group-hover:scale-110 transition-transform" />
          </div>
          <div className="absolute top-4 left-4 flex gap-2">
            <span
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg backdrop-blur-sm ${
                lecture.type === 'online'
                  ? 'bg-blue-500/90 text-white'
                  : 'bg-green-500/90 text-white'
              }`}
            >
              {lecture.type === 'online' ? '온라인' : '오프라인'}
            </span>
            <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold rounded-lg">
              {lecture.category}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
            {lecture.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3 font-medium">{lecture.instructor}</p>
          <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">{lecture.description}</p>
          
          <div className="flex items-center justify-between text-sm text-gray-600 mb-5 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{lecture.rating}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{lecture.students.toLocaleString()}명</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{lecture.duration}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-3xl font-extrabold text-gray-900">₩{lecture.price.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-primary-600 font-semibold group-hover:gap-3 transition-all">
              <span>자세히 보기</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}


