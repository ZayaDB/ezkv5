'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/lib/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import { listPendingMentors, setMentorApproval, type PendingMentorApplication } from '@/lib/supabase/moderation';
import { Search, UserPlus, Users } from 'lucide-react';
import Toast from '@/components/ui/Toast';
import LoadingState from '@/components/ui/LoadingState';
import AdminUserTable from '@/components/admin/users/AdminUserTable';
import UserDetailModal from '@/components/admin/users/UserDetailModal';
import MentorApplicationDetails from '@/components/admin/moderation/MentorApplicationDetails';
import ModerationReviewModal from '@/components/admin/moderation/ModerationReviewModal';

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: 'mentee' | 'mentor' | 'admin';
  locale: string;
  createdAt: string;
  mentorProfile?: {
    title: string;
    location: string;
    specialties: string[];
    rating: number;
    reviewCount: number;
    verified: boolean;
  } | null;
}


export default function AdminUsersPage() {
  const locale = useLocale();
  const tMod = useTranslations('adminModeration');
  const t = useTranslations('admin');
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [mentorPending, setMentorPending] = useState<PendingMentorApplication[]>([]);
  const [reviewMentor, setReviewMentor] = useState<PendingMentorApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('mentee');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [adminForm, setAdminForm] = useState({
    email: '',
    name: '',
    password: '',
    locale: 'kr' as 'kr' | 'en' | 'mn',
  });
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== 'admin')) {
      router.push(`/${locale}/login`);
      return;
    }
    if (currentUser?.role === 'admin') {
      void loadUsers();
      void loadMentorPending();
    }
  }, [page, search, roleFilter, currentUser, authLoading, locale, router]);

  const loadUsers = async () => {
    setLoading(true);
    const response = await adminApi.getUsers({
      role: roleFilter || undefined,
      search: search || undefined,
      page,
      limit: 20,
    });
    if (response.data) {
      setUsers(response.data.users || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } else {
      setToast({ message: response.error || t('usersLoadFailed'), variant: 'error' });
    }
    setLoading(false);
  };

  const loadMentorPending = async () => {
    try {
      setMentorPending(await listPendingMentors());
    } catch {
      setMentorPending([]);
    }
  };

  const loadUserDetail = async (userId: string) => {
    setSelectedUserId(userId);
    setLoadingDetail(true);
    const response = await adminApi.getUserDetail(userId);
    if (response.data) {
      setSelectedUserDetail(response.data);
    } else {
      setToast({ message: response.error || t('userDetailFailed'), variant: 'error' });
      setSelectedUserId(null);
    }
    setLoadingDetail(false);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await adminApi.createAdminUser(adminForm);
    if (response.error) {
      setToast({ message: response.error, variant: 'error' });
      return;
    }
    setToast({ message: t('adminCreated'), variant: 'success' });
    setAdminForm({ email: '', name: '', password: '', locale: 'kr' });
    await loadUsers();
  };

  const handleResetPassword = async () => {
    if (!selectedUserId || !newPassword) return;
    const response = await adminApi.resetUserPassword({
      userId: selectedUserId,
      newPassword,
    });
    if (response.error) {
      setToast({ message: response.error, variant: 'error' });
      return;
    }
    setToast({ message: t('passwordReset'), variant: 'success' });
    setNewPassword('');
  };

  const handleMentorModeration = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await setMentorApproval(id, status);
      setToast({
        message: status === 'approved' ? t('mentorApproved') : t('mentorRejected'),
        variant: 'success',
      });
      await Promise.all([loadMentorPending(), loadUsers()]);
      setReviewMentor(null);
    } catch (e: unknown) {
      setToast({
        message: e instanceof Error ? e.message : t('actionFailed'),
        variant: 'error',
      });
    }
  };

  const roleStats = useMemo(() => {
    const mentee = users.filter((u) => u.role === 'mentee').length;
    const mentor = users.filter((u) => u.role === 'mentor').length;
    const admin = users.filter((u) => u.role === 'admin').length;
    return { mentee, mentor, admin };
  }, [users]);

  if (authLoading || !currentUser) {
    return <LoadingState message={t("checkingPermission")} />;
  }

  return (
    <div className="bg-brand-mist rounded-2xl border border-brand-line">
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

      <div className="px-6 sm:px-8 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-ink">{t("usersTitle")}</h1>
          <p className="text-brand-soft mt-1">{t("usersSubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-brand-line p-4">
            <p className="text-sm text-brand-soft">{t("roleMenteeLong")}</p>
            <p className="text-3xl font-bold text-brand-ink">{roleStats.mentee}</p>
          </div>
          <div className="bg-white rounded-xl border border-brand-line p-4">
            <p className="text-sm text-brand-soft">{t("roleMentor")}</p>
            <p className="text-3xl font-bold text-brand-ink">{roleStats.mentor}</p>
          </div>
          <div className="bg-white rounded-xl border border-brand-line p-4">
            <p className="text-sm text-brand-soft">{t("roleAdmin")}</p>
            <p className="text-3xl font-bold text-brand-ink">{roleStats.admin}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-brand-line p-5">
          <h2 className="text-lg font-semibold text-brand-ink mb-3">{t("mentorReviewTitle")}</h2>
          {mentorPending.length === 0 ? (
            <p className="text-sm text-brand-soft">{t("noPendingMentors")}</p>
          ) : (
            <div className="space-y-3">
              {mentorPending.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setReviewMentor(item)}
                  className="w-full text-left rounded-xl border border-brand-line bg-brand-mist p-4 hover:bg-white hover:ring-1 hover:ring-primary-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-brand-ink">{item.title || t('mentorApplication')}</p>
                    <span className="text-[11px] font-semibold text-primary-600 shrink-0">
                      {tMod('openReview')}
                    </span>
                  </div>
                  <p className="text-xs text-brand-soft mt-1">
                    {item.user?.name} · {item.user?.email}
                  </p>
                  <p className="text-xs text-brand-soft">
                    {item.location || '-'} · {(item.specialties || []).join(', ') || t('noSpecialty')}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleCreateAdmin} className="bg-white rounded-xl border border-brand-line p-5 space-y-3">
            <h2 className="text-lg font-semibold text-brand-ink flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary-600" />
              {t("addAdmin")}
            </h2>
            <input
              required
              placeholder={t("email")}
              value={adminForm.email}
              onChange={(e) => setAdminForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm"
            />
            <input
              required
              placeholder={t("name")}
              value={adminForm.name}
              onChange={(e) => setAdminForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm"
            />
            <input
              required
              minLength={8}
              type="password"
              placeholder={t("initialPassword")}
              value={adminForm.password}
              onChange={(e) => setAdminForm((p) => ({ ...p, password: e.target.value }))}
              className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm"
            />
            <select
              value={adminForm.locale}
              onChange={(e) => setAdminForm((p) => ({ ...p, locale: e.target.value as 'kr' | 'en' | 'mn' }))}
              className="w-full rounded-lg border border-brand-line px-3 py-2 text-sm"
            >
              <option value="kr">kr</option>
              <option value="en">en</option>
              <option value="mn">mn</option>
            </select>
            <button className="w-full rounded-lg bg-primary-600 text-white py-2 font-semibold hover:bg-primary-700">
              {t("createAdmin")}
            </button>
          </form>

          <div className="lg:col-span-2 bg-white rounded-xl border border-brand-line p-5">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-soft/70" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-brand-line text-sm"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-brand-line px-3 py-2 text-sm"
              >
                <option value="">{t("all")}</option>
                <option value="mentee">{t("roleMentee")}</option>
                <option value="mentor">{t("roleMentor")}</option>
                <option value="admin">{t("roleAdmin")}</option>
              </select>
              <button
                type="button"
                onClick={() => void loadUsers()}
                className="rounded-lg bg-brand-ink text-white px-4 py-2 text-sm font-semibold"
              >
                {t("search")}
              </button>
            </div>

            <AdminUserTable users={users} loading={loading} onOpenUser={(id) => void loadUserDetail(id)} />

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded bg-brand-mist disabled:opacity-50"
                >
                  {tMod("prev")}
                </button>
                <span>{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded bg-brand-mist disabled:opacity-50"
                >
                  {tMod("next")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {reviewMentor && (
        <ModerationReviewModal
          title={tMod('reviewMentorTitle')}
          subtitle={`${reviewMentor.user?.name || ''} · ${reviewMentor.user?.email || ''}`}
          onClose={() => setReviewMentor(null)}
          onApprove={() => void handleMentorModeration(reviewMentor.id, 'approved')}
          onReject={() => void handleMentorModeration(reviewMentor.id, 'rejected')}
        >
          <MentorApplicationDetails item={reviewMentor} framed={false} />
        </ModerationReviewModal>
      )}

      <UserDetailModal
        isOpen={!!selectedUserId}
        loading={loadingDetail}
        detail={selectedUserDetail}
        newPassword={newPassword}
        onChangePassword={setNewPassword}
        onClose={() => {
          setSelectedUserId(null);
          setSelectedUserDetail(null);
        }}
        onResetPassword={() => void handleResetPassword()}
      />
    </div>
  );
}

