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
      <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 relative">
        <div className="relative aspect-[16/9] bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900/30 dark:to-blue-900/20 overflow-hidden">
          {lecture.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={lecture.image}
              alt={lecture.title}
              className="absolute inset-0 h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
          ) : null}
          <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-slate-900/10 transition-colors" />
          {!lecture.image && (
            <div className="absolute inset-0 flex items-center justify-center">
              <PlayCircle className="w-14 h-14 text-primary-400/70 group-hover:scale-110 transition-transform" />
            </div>
          )}
          <div className="absolute top-4 left-4 flex gap-2">
            <span
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg backdrop-blur-sm ${
                lecture.type === 'online'
                  ? 'bg-primary-600/90 text-white'
                  : 'bg-emerald-600/90 text-white'
              }`}
            >
              {lecture.type === 'online' ? '온라인' : '오프라인'}
            </span>
            <span className="px-3 py-1.5 bg-white/90 dark:bg-slate-900/85 backdrop-blur-sm text-gray-700 dark:text-slate-200 text-xs font-semibold rounded-lg">
              {lecture.category}
            </span>
          </div>
          <button
            type="button"
            onClick={toggleWishlist}
            className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
              wishlisted
                ? 'bg-red-50/95 text-red-600'
                : 'bg-white/90 dark:bg-slate-900/85 text-gray-600 dark:text-slate-300 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500' : ''}`} />
          </button>
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2 group-hover:text-primary-700 transition-colors line-clamp-2">
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
              <span className="text-base sm:text-lg font-bold text-primary-600">₩{lecture.price.toLocaleString()}</span>
            </div>
            <div className="inline-flex items-center text-xs font-semibold text-primary-700 dark:text-primary-300">
              <span>자세히 보기</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}


