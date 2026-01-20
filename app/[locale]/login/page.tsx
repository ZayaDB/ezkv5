'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 이미 로그인되어 있으면 대시보드로 리다이렉트
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push(`/${locale}/admin/dashboard`);
      } else {
        router.push(`/${locale}/dashboard`);
      }
    }
  }, [user, router, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (!result.success) {
        setError(result.error || t('loginError'));
        setLoading(false);
        return;
      }

      // 로그인 성공 - Context가 업데이트되면 useEffect에서 자동으로 리다이렉트됨
      setLoading(false);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || t('loginError'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-white font-bold text-3xl bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                M
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-white">MentorLink</h1>
          </div>
          <p className="text-white/90 text-lg">{t('welcomeBack')}</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder={t('emailPlaceholder')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder={t('passwordPlaceholder')}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-primary-500 rounded" />
                <span className="ml-2 text-sm text-gray-600">{t('rememberMe')}</span>
              </label>
              <Link
                href={`/${locale}/forgot-password`}
                className="text-sm text-primary-600 font-semibold hover:text-primary-700"
              >
                {t('forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('loggingIn')}
                </>
              ) : (
                <>
                  {t('login')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('noAccount')}{' '}
              <Link
                href={`/${locale}/signup`}
                className="text-primary-600 font-semibold hover:text-primary-700"
              >
                {t('signUp')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

