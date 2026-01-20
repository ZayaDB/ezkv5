'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function Footer() {
  const t = useTranslations('common');
  const locale = useLocale();

  const getLocalizedPath = (path: string) => {
    return `/${locale}${path}`;
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <h3 className="text-2xl font-extrabold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                MentorLink
              </h3>
            </div>
            <p className="text-gray-400 leading-relaxed">
              한국 유학을 위한 신뢰할 수 있는 가이드
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href={getLocalizedPath('/mentors')} className="hover:text-white transition-colors">
                  {t('mentors')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/lectures')} className="hover:text-white transition-colors">
                  {t('lectures')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/community')} className="hover:text-white transition-colors">
                  {t('community')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href={getLocalizedPath('/study-in-korea')} className="hover:text-white transition-colors">
                  {t('studyInKorea')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/freelancers')} className="hover:text-white transition-colors">
                  {t('freelancers')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href={getLocalizedPath('/help')} className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/contact')} className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 MentorLink. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}


