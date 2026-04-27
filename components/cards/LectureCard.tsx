'use client';

import Link from 'next/link';
import { Lecture } from '@/types';
import { Star, Users, Clock, ArrowRight, PlayCircle, Heart } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useEffect, useState, type MouseEvent } from 'react';
import { lectureWishlistApi } from '@/lib/api/client';
import { useAuth } from '@/lib/contexts/AuthContext';

interface LectureCardProps {
  lecture: Lecture;
}

export default function LectureCard({ lecture }: LectureCardProps) {
  const locale = useLocale();
  const { isAuthenticated } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!isAuthenticated) {
        setWishlisted(false);
        return;
      }
      const res = await lectureWishlistApi.list();
      if (!active) return;
      setWishlisted((res.data?.wishlist || []).some((w) => w.lectureId === lecture.id));
    };
    load();
    return () => {
      active = false;
    };
  }, [isAuthenticated, lecture.id]);

  const toggleWishlist = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    if (wishlisted) {
      const res = await lectureWishlistApi.remove(lecture.id);
      if (!res.error) setWishlisted(false);
      return;
    }
    const res = await lectureWishlistApi.add(lecture.id);
    if (!res.error) setWishlisted(true);
  };

  return (
    <Link href={`/${locale}/lectures/${lecture.id}`}>
      <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 relative">
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
            <span className="px-3 py-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-gray-700 dark:text-slate-200 text-xs font-semibold rounded-lg">
              {lecture.category}
            </span>
          </div>
          <button
            type="button"
            onClick={toggleWishlist}
            className={`absolute top-4 right-4 p-2 rounded-lg ${
              wishlisted ? 'bg-red-50 text-red-600' : 'bg-white/90 dark:bg-slate-800/90 text-gray-600 dark:text-slate-300'
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500' : ''}`} />
          </button>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
            {lecture.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-3 font-medium">{lecture.instructor}</p>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-5 line-clamp-2 leading-relaxed">{lecture.description}</p>
          
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-slate-400 mb-5 pb-5 border-b border-gray-100 dark:border-slate-700">
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
              <span className="text-3xl font-extrabold text-gray-900 dark:text-slate-100">₩{lecture.price.toLocaleString()}</span>
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


