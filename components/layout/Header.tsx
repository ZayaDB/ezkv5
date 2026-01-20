'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Globe, Menu, X, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { locales } from '@/lib/i18n/config';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function Header() {
  const t = useTranslations('common');
  const locale = useLocale();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const getLocalizedPath = (path: string) => {
    return `/${locale}${path}`;
  };

  const switchLanguage = (newLocale: string) => {
    const currentPath = window.location.pathname;
    const pathWithoutLocale = currentPath.replace(`/${locale}`, '');
    window.location.href = `/${newLocale}${pathWithoutLocale}`;
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={getLocalizedPath('')} className="flex items-center group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-lg">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              MentorLink
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href={getLocalizedPath('')}
              className="text-gray-600 hover:text-primary-500 transition-colors"
            >
              {t('home')}
            </Link>
            <Link
              href={getLocalizedPath('/mentors')}
              className="text-gray-600 hover:text-primary-500 transition-colors"
            >
              {t('mentors')}
            </Link>
            <Link
              href={getLocalizedPath('/lectures')}
              className="text-gray-600 hover:text-primary-500 transition-colors"
            >
              {t('lectures')}
            </Link>
            <Link
              href={getLocalizedPath('/community')}
              className="text-gray-600 hover:text-primary-500 transition-colors"
            >
              {t('community')}
            </Link>
            <Link
              href={getLocalizedPath('/freelancers')}
              className="text-gray-600 hover:text-primary-500 transition-colors"
            >
              {t('freelancers')}
            </Link>
            <Link
              href={getLocalizedPath('/study-in-korea')}
              className="text-gray-600 hover:text-primary-500 transition-colors"
            >
              {t('studyInKorea')}
            </Link>
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="flex items-center space-x-1 text-gray-600 hover:text-primary-500 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <Globe className="w-5 h-5" />
                <span className="uppercase text-sm font-medium">{locale}</span>
              </button>
              {languageMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setLanguageMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                    {locales.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => {
                          switchLanguage(loc);
                          setLanguageMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                          locale === loc ? 'text-primary-500 font-medium' : 'text-gray-600'
                        }`}
                      >
                        {loc === 'kr' ? '한국어' : loc === 'en' ? 'English' : 'Монгол'}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg transition-shadow">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</div>
                    <div className="text-xs text-gray-500">{user?.email || ''}</div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</div>
                        <div className="text-xs text-gray-500 truncate">{user?.email || ''}</div>
                      </div>
                      
                      {user?.role === 'admin' ? (
                        <Link
                          href={getLocalizedPath('/admin/dashboard')}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          <span>관리자 대시보드</span>
                        </Link>
                      ) : (
                        <Link
                          href={getLocalizedPath('/profile')}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          <span>{t('profile')}</span>
                        </Link>
                      )}
                      
                      <Link
                        href={getLocalizedPath('/profile')}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>{t('profile')}</span>
                      </Link>
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          window.location.href = getLocalizedPath('/login');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('logout')}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href={getLocalizedPath('/login')}
                  className="text-gray-600 hover:text-primary-500 transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  href={getLocalizedPath('/signup')}
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {t('signup')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-600"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                href={getLocalizedPath('')}
                className="text-gray-600 hover:text-primary-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('home')}
              </Link>
              <Link
                href={getLocalizedPath('/mentors')}
                className="text-gray-600 hover:text-primary-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('mentors')}
              </Link>
              <Link
                href={getLocalizedPath('/lectures')}
                className="text-gray-600 hover:text-primary-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('lectures')}
              </Link>
              <Link
                href={getLocalizedPath('/community')}
                className="text-gray-600 hover:text-primary-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('community')}
              </Link>
              <Link
                href={getLocalizedPath('/freelancers')}
                className="text-gray-600 hover:text-primary-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('freelancers')}
              </Link>
              <Link
                href={getLocalizedPath('/study-in-korea')}
                className="text-gray-600 hover:text-primary-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('studyInKorea')}
              </Link>
              
              {isAuthenticated ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</div>
                      <div className="text-xs text-gray-500 truncate">{user?.email || ''}</div>
                    </div>
                  </div>
                  
                  {user?.role === 'admin' ? (
                    <Link
                      href={getLocalizedPath('/admin/dashboard')}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mb-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5" />
                      <span>관리자 대시보드</span>
                    </Link>
                  ) : (
                    <Link
                      href={getLocalizedPath('/profile')}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mb-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5" />
                      <span>{t('profile')}</span>
                    </Link>
                  )}
                  
                  <Link
                    href={getLocalizedPath('/profile')}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mb-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>{t('profile')}</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      window.location.href = getLocalizedPath('/login');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href={getLocalizedPath('/login')}
                    className="text-gray-600 hover:text-primary-500 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href={getLocalizedPath('/signup')}
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('signup')}
                  </Link>
                </>
              )}
              
              <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                <Globe className="w-5 h-5 text-gray-600" />
                {locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      switchLanguage(loc);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-3 py-1 rounded ${
                      locale === loc
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {loc.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
