'use client';

import { StudyInfo } from '@/types';
import { ArrowRight } from 'lucide-react';

interface StudyInfoCardProps {
  info: StudyInfo;
}

const categoryColors: Record<string, string> = {
  visa: 'from-blue-500 to-cyan-500',
  housing: 'from-green-500 to-emerald-500',
  hospital: 'from-red-500 to-pink-500',
  lifeTips: 'from-purple-500 to-indigo-500',
};

export default function StudyInfoCard({ info }: StudyInfoCardProps) {
  const gradientClass = categoryColors[info.category] || 'from-gray-500 to-gray-600';

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientClass}`}></div>
      
      <div className="relative">
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
          {info.title}
        </h3>
        <p className="text-gray-600 mb-5 line-clamp-3 leading-relaxed">
          {info.content}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {info.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 group-hover:border-primary-200 group-hover:bg-primary-50 transition-all"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center text-primary-600 font-semibold group-hover:gap-2 transition-all">
          <span>자세히 보기</span>
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}


