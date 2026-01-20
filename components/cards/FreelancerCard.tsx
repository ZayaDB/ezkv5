'use client';

import Link from 'next/link';
import { FreelancerGroup } from '@/types';
import { Users, Briefcase, ArrowRight, TrendingUp } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

interface FreelancerCardProps {
  group: FreelancerGroup;
}

export default function FreelancerCard({ group }: FreelancerCardProps) {
  const locale = useLocale();
  const t = useTranslations('freelancers');

  return (
    <Link href={`/${locale}/freelancers/${group.id}`}>
      <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 relative">
        {/* Gradient Image Header */}
        <div className="relative h-40 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 overflow-hidden">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold rounded-lg">
              {group.category}
            </span>
          </div>
          <div className="absolute bottom-4 right-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            {group.name}
          </h3>
          <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">
            {group.description}
          </p>
          
          <div className="flex items-center gap-6 mb-5 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">멤버</div>
                <div className="text-sm font-bold text-gray-900">{group.members.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-accent-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">채용 공고</div>
                <div className="text-sm font-bold text-gray-900">{group.jobsPosted}개</div>
              </div>
            </div>
          </div>
          
          <button className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
            <span>{t('join')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Link>
  );
}


