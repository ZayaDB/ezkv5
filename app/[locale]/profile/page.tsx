'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Settings, User as UserIcon, Mail, MapPin, Globe, Save, Edit2 } from 'lucide-react';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    languages: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${locale}/login`);
      return;
    }
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        location: user.location || '',
        languages: user.languages || [],
      });
    }
  }, [user, authLoading, router, locale]);

  const handleSave = async () => {
    setSaving(true);
    // TODO: API로 사용자 정보 업데이트
    // const response = await authApi.updateUser(formData);
    // if (response.data) {
    //   setUser(response.data.user);
    //   setIsEditing(false);
    // }
    setIsEditing(false);
    setSaving(false);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">{t('title')}</h1>
          <p className="text-xl text-white/90">프로필을 관리하세요</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-white">{user.name.charAt(0)}</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-600 mt-1">
                  {user.role === 'mentee' ? '멘티' : user.role === 'mentor' ? '멘토' : '관리자'}
                </p>
              </div>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors"
              >
                <Edit2 className="w-5 h-5" />
                {t('edit')}
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? '저장 중...' : t('save')}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                {t('name')}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{user.name}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t('email')}
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{user.email}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t('location')}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="예: 서울, 대한민국"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {formData.location || '설정되지 않음'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('bio')}</label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  placeholder="자기소개를 입력하세요..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 min-h-[100px]">
                  {formData.bio || '자기소개가 없습니다.'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {t('languages')}
              </label>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {['한국어', 'English', '中文', '日本語', 'Монгол'].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        const newLangs = formData.languages.includes(lang)
                          ? formData.languages.filter((l) => l !== lang)
                          : [...formData.languages, lang];
                        setFormData({ ...formData, languages: newLangs });
                      }}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                        formData.languages.includes(lang)
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.languages.length > 0 ? (
                    formData.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-4 py-2 bg-primary-100 text-primary-700 rounded-xl font-semibold"
                      >
                        {lang}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">언어가 설정되지 않았습니다</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


