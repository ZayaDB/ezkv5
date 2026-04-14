'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/lib/contexts/AuthContext';
import { adminApi } from '@/lib/api/client';
import { Calendar, Mail, Search, Shield, UserPlus, Users } from 'lucide-react';
import Toast from '@/components/ui/Toast';
import LoadingState from '@/components/ui/LoadingState';

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

interface MentorPendingRow {
  id: string;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
  title?: string;
  location?: string;
  specialties?: string[];
}

export default function AdminUsersPage() {
  const locale = useLocale();
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [mentorPending, setMentorPending] = useState<MentorPendingRow[]>([]);
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
      setToast({ message: response.error || '사용자 목록 조회 실패', variant: 'error' });
    }
    setLoading(false);
  };

  const loadMentorPending = async () => {
    const response = await adminApi.getModerationQueue();
    if (response.data) {
      setMentorPending(response.data.mentorPending || []);
    }
  };

  const loadUserDetail = async (userId: string) => {
    setSelectedUserId(userId);
    setLoadingDetail(true);
    const response = await adminApi.getUserDetail(userId);
    if (response.data) {
      setSelectedUserDetail(response.data);
    } else {
      setToast({ message: response.error || '사용자 상세 조회 실패', variant: 'error' });
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
    setToast({ message: '관리자 계정이 생성되었습니다.', variant: 'success' });
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
    setToast({ message: '비밀번호가 초기화되었습니다.', variant: 'success' });
    setNewPassword('');
  };

  const handleMentorModeration = async (id: string, status: 'approved' | 'rejected') => {
    const response = await adminApi.updateModerationStatus({
      type: 'mentor',
      id,
      status,
    });
    if (response.error) {
      setToast({ message: response.error, variant: 'error' });
      return;
    }
    setToast({
      message: status === 'approved' ? '멘토 승인 처리되었습니다.' : '멘토 반려 처리되었습니다.',
      variant: 'success',
    });
    await Promise.all([loadMentorPending(), loadUsers()]);
  };

  const roleStats = useMemo(() => {
    const mentee = users.filter((u) => u.role === 'mentee').length;
    const mentor = users.filter((u) => u.role === 'mentor').length;
    const admin = users.filter((u) => u.role === 'admin').length;
    return { mentee, mentor, admin };
  }, [users]);

  if (authLoading || !currentUser) {
    return <LoadingState message="권한 확인 중..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">관리자 사용자 콘솔</h1>
          <p className="text-slate-600 mt-1">관리자 추가, 비밀번호 초기화, 학생 상세 열람</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">학생(멘티)</p>
            <p className="text-3xl font-bold text-slate-900">{roleStats.mentee}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">멘토</p>
            <p className="text-3xl font-bold text-slate-900">{roleStats.mentor}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">관리자</p>
            <p className="text-3xl font-bold text-slate-900">{roleStats.admin}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">멘토 신청 승인/반려</h2>
          {mentorPending.length === 0 ? (
            <p className="text-sm text-slate-500">대기 중인 멘토 신청이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {mentorPending.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{item.title || '멘토 신청'}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.user?.name} · {item.user?.email}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.location || '-'} · {(item.specialties || []).join(', ') || '분야 미입력'}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => void handleMentorModeration(item.id, 'approved')}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      승인
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleMentorModeration(item.id, 'rejected')}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-50"
                    >
                      반려
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleCreateAdmin} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary-600" />
              관리자 추가
            </h2>
            <input
              required
              placeholder="이메일"
              value={adminForm.email}
              onChange={(e) => setAdminForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="이름"
              value={adminForm.name}
              onChange={(e) => setAdminForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              required
              minLength={8}
              type="password"
              placeholder="초기 비밀번호(8자 이상)"
              value={adminForm.password}
              onChange={(e) => setAdminForm((p) => ({ ...p, password: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <select
              value={adminForm.locale}
              onChange={(e) => setAdminForm((p) => ({ ...p, locale: e.target.value as 'kr' | 'en' | 'mn' }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="kr">kr</option>
              <option value="en">en</option>
              <option value="mn">mn</option>
            </select>
            <button className="w-full rounded-lg bg-primary-600 text-white py-2 font-semibold hover:bg-primary-700">
              관리자 생성
            </button>
          </form>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="이름/이메일 검색"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">전체</option>
                <option value="mentee">학생</option>
                <option value="mentor">멘토</option>
                <option value="admin">관리자</option>
              </select>
              <button
                type="button"
                onClick={() => void loadUsers()}
                className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-semibold"
              >
                조회
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="py-2">사용자</th>
                    <th className="py-2">역할</th>
                    <th className="py-2">가입일</th>
                    <th className="py-2">상세</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-500">불러오는 중...</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="border-b last:border-b-0">
                        <td className="py-3">
                          <div className="font-medium text-slate-900">{u.name}</div>
                          <div className="text-slate-500 flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {u.email}
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-1 rounded bg-slate-100 text-slate-700">
                            {u.role === 'mentee' ? '학생' : u.role === 'mentor' ? '멘토' : '관리자'}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(u.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            type="button"
                            onClick={() => void loadUserDetail(u.id)}
                            className="text-primary-600 font-semibold hover:underline"
                          >
                            보기
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded bg-slate-100 disabled:opacity-50"
                >
                  이전
                </button>
                <span>{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded bg-slate-100 disabled:opacity-50"
                >
                  다음
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedUserId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                사용자 상세
              </h3>
              <button onClick={() => { setSelectedUserId(null); setSelectedUserDetail(null); }} className="text-slate-500">닫기</button>
            </div>

            {loadingDetail || !selectedUserDetail ? (
              <p className="text-slate-500 mt-4">불러오는 중...</p>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50">
                    <p className="text-xs text-slate-500">이름</p>
                    <p className="font-semibold text-slate-900">{selectedUserDetail.user.name}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50">
                    <p className="text-xs text-slate-500">이메일</p>
                    <p className="font-semibold text-slate-900">{selectedUserDetail.user.email}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50">
                    <p className="text-xs text-slate-500">역할</p>
                    <p className="font-semibold text-slate-900">{selectedUserDetail.user.role}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50">
                    <p className="text-xs text-slate-500">언어</p>
                    <p className="font-semibold text-slate-900">{selectedUserDetail.user.locale}</p>
                  </div>
                </div>

                {selectedUserDetail.user.role === 'mentee' && (
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50">
                    <p className="font-semibold text-blue-900">학생 정보</p>
                    <p className="text-sm text-blue-800 mt-1">
                      수강 {selectedUserDetail.stats?.enrollmentCount || 0}건 / 세션 {selectedUserDetail.stats?.sessionCount || 0}건
                    </p>
                  </div>
                )}

                {selectedUserDetail.user.mentorProfile && (
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50">
                    <p className="font-semibold text-emerald-900">멘토 프로필</p>
                    <p className="text-sm text-emerald-900 mt-1">{selectedUserDetail.user.mentorProfile.title}</p>
                    <p className="text-sm text-emerald-800">{selectedUserDetail.user.mentorProfile.location}</p>
                  </div>
                )}

                <div className="border rounded-xl p-4">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-600" />
                    비밀번호 초기화
                  </h4>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="password"
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="새 비밀번호 (8자 이상)"
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => void handleResetPassword()}
                      className="rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold"
                    >
                      초기화
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

