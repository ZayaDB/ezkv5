'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { CheckCircle2, GraduationCap, Info, Video } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { fetchPublicProfiles } from '@/lib/supabase/publicProfiles';
import { cancelPayment } from '@/lib/payments/client';
import { sessionRoomWindow } from '@/lib/live/sessionRoom';
import MessageButton from '@/components/messages/MessageButton';
import { SectionHeader, StatTile, ui } from '@/components/lnk/ui';

type SessionRow = {
  id: string;
  scheduledAt: string;
  duration: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes: string | null;
  menteeId: string;
  menteeName: string;
  paymentId: string | null;
  amount: number;
};

type PaymentRow = {
  payment_id: string;
  order_name: string;
  amount: number;
  refunded_amount: number;
  status: 'paid' | 'cancelled';
  paid_at: string | null;
  lecture_id: string | null;
  mentor_profile_id: string | null;
  session_id: string | null;
  lectures: { instructor_id: string } | null;
};

type Tab = 'upcoming' | 'past';

const won = (n: number) => `₩${n.toLocaleString('ko-KR')}`;
const net = (p: PaymentRow) => Math.max(0, p.amount - (p.refunded_amount || 0));

/** "YYYY-MM" in Korea time */
const kstMonth = (iso: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit' }).format(new Date(iso));

/**
 * Mentor-mode overview: earnings/booking stats on top, the page's shared content (children) in the
 * middle, then session bookings and earnings at the bottom.
 */
export default function MentorOverview({ children }: { children?: ReactNode }) {
  const t = useTranslations('mentorCenter');
  const locale = useLocale();
  const { user } = useAuth();
  const [profileId, setProfileId] = useState<string | null | undefined>(undefined);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [tab, setTab] = useState<Tab>('upcoming');
  const [busy, setBusy] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);
  const now = Date.now();

  const load = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    const { data: mp } = await supabase
      .from('mentor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('approval_status', 'approved')
      .maybeSingle();
    const mpId = (mp?.id as string) || null;
    setProfileId(mpId);

    const [sessRes, payRes] = await Promise.all([
      mpId
        ? supabase
            .from('mentor_sessions')
            .select('id, scheduled_at, duration, status, notes, mentee_id')
            .eq('mentor_profile_id', mpId)
            .in('status', ['upcoming', 'completed', 'cancelled'])
            .order('scheduled_at', { ascending: true })
            .limit(300)
        : Promise.resolve({ data: [] as Record<string, unknown>[] }),
      supabase
        .from('payments')
        .select('payment_id, order_name, amount, refunded_amount, status, paid_at, lecture_id, mentor_profile_id, session_id, lectures(instructor_id)')
        .in('status', ['paid', 'cancelled'])
        .not('paid_at', 'is', null)
        .order('paid_at', { ascending: false })
        .limit(500),
    ]);

    // payments: keep only money I received (as mentor or instructor), not my own purchases
    const mine = ((payRes.data as unknown as PaymentRow[]) || []).filter(
      (p) => (mpId && p.mentor_profile_id === mpId) || p.lectures?.instructor_id === user.id
    );
    setPayments(mine);

    const rows = (sessRes.data as Record<string, unknown>[]) || [];
    const names = await fetchPublicProfiles(supabase, rows.map((r) => String(r.mentee_id)));
    const bySession = new Map(mine.filter((p) => p.session_id).map((p) => [p.session_id as string, p]));
    setSessions(
      rows.map((r) => {
        const p = bySession.get(String(r.id));
        return {
          id: String(r.id),
          scheduledAt: String(r.scheduled_at),
          duration: Number(r.duration || 60),
          status: r.status as SessionRow['status'],
          notes: (r.notes as string) || null,
          menteeId: String(r.mentee_id),
          menteeName: names.get(String(r.mentee_id))?.name || '',
          paymentId: p && p.status === 'paid' ? p.payment_id : null,
          amount: p ? net(p) : 0,
        };
      })
    );
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const thisMonth = kstMonth(new Date().toISOString());
    const monthNet = payments.filter((p) => p.paid_at && kstMonth(p.paid_at) === thisMonth).reduce((s, p) => s + net(p), 0);
    const totalNet = payments.reduce((s, p) => s + net(p), 0);
    const refunded = payments.reduce((s, p) => s + (p.refunded_amount || 0), 0);
    const upcoming = sessions.filter((s) => s.status === 'upcoming').length;
    const completed = sessions.filter((s) => s.status === 'completed').length;
    // last 6 months, oldest first
    const months: { key: string; total: number }[] = [];
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const m = new Date(d.getFullYear(), d.getMonth() - i, 15);
      months.push({ key: kstMonth(m.toISOString()), total: 0 });
    }
    for (const p of payments) {
      if (!p.paid_at) continue;
      const row = months.find((m) => m.key === kstMonth(p.paid_at as string));
      if (row) row.total += net(p);
    }
    return { monthNet, totalNet, refunded, upcoming, completed, months };
  }, [payments, sessions]);

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat(locale === 'kr' ? 'ko-KR' : locale === 'mn' ? 'mn-MN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'Asia/Seoul',
    }).format(new Date(iso));
  const monthLabel = (key: string) => {
    const [y, m] = key.split('-').map(Number);
    return new Intl.DateTimeFormat(locale === 'kr' ? 'ko-KR' : locale === 'mn' ? 'mn-MN' : 'en-US', { month: 'short' }).format(new Date(y, m - 1, 15));
  };

  const complete = async (s: SessionRow) => {
    setBusy(s.id);
    setMessage(null);
    const { error } = await createClient().from('mentor_sessions').update({ status: 'completed' }).eq('id', s.id);
    setBusy(null);
    setMessage(error ? { tone: 'err', text: t('completeFailed') } : { tone: 'ok', text: t('completeDone') });
    void load();
  };

  const refund = async (s: SessionRow) => {
    if (!s.paymentId) return;
    setBusy(s.id);
    setMessage(null);
    const r = await cancelPayment(s.paymentId);
    setBusy(null);
    setConfirming(null);
    setMessage(r.error ? { tone: 'err', text: t('refundFailed') } : { tone: 'ok', text: t('refundDone') });
    void load();
  };

  if (profileId === undefined) {
    return (
      <>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-hairline/50 dark:bg-night-card" />
          ))}
        </div>
        {children}
      </>
    );
  }

  if (profileId === null && payments.length === 0) {
    return (
      <>
        <div className={`${ui.card} flex flex-wrap items-center justify-between gap-4 p-6`}>
          <p className={`text-sm ${ui.muted}`}>{t('notMentor')}</p>
          <Link href={`/${locale}/my/profile?tab=mentor`} className={ui.btnPrimary}>
            {t('applyMentor')}
          </Link>
        </div>
        {children}
      </>
    );
  }

  const upcomingList = sessions.filter((s) => s.status === 'upcoming');
  const pastList = sessions.filter((s) => s.status !== 'upcoming').reverse();
  const list = tab === 'upcoming' ? upcomingList : pastList;
  const maxMonth = Math.max(1, ...stats.months.map((m) => m.total));

  return (
    <>
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label={t('title')}>
        <StatTile label={t('statMonth')} value={won(stats.monthNet)} hint={t('chartTitle')} href="#earnings" />
        <StatTile
          label={t('statTotal')}
          value={won(stats.totalNet)}
          hint={stats.refunded ? t('statRefunded', { amount: won(stats.refunded) }) : t('settlementTitle')}
          href="#earnings"
        />
        <StatTile label={t('statUpcoming')} value={t('countSessions', { count: stats.upcoming })} hint={t('bookingsTitle')} href="#bookings" />
        <StatTile label={t('statCompleted')} value={t('countSessions', { count: stats.completed })} hint={t('tabPast')} href="#bookings" />
      </section>

      {children}

      {message && (
        <div
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.tone === 'ok'
              ? 'border-primary-200 bg-primary-50 text-primary-800 dark:border-primary-900 dark:bg-primary-950/40 dark:text-primary-200'
              : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Bookings */}
      <section id="bookings" className="scroll-mt-28 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeader title={t('bookingsTitle')} />
          <div className="flex gap-1 rounded-lg bg-surface p-1 dark:bg-night">
            {(['upcoming', 'past'] as Tab[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                  tab === k ? 'bg-white text-ink shadow-sm dark:bg-night-card dark:text-snow' : ui.muted
                }`}
              >
                {k === 'upcoming' ? t('tabUpcoming', { count: upcomingList.length }) : t('tabPast')}
              </button>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <div className={`${ui.card} p-8 text-center text-sm ${ui.muted}`}>{tab === 'upcoming' ? t('emptyUpcoming') : t('emptyPast')}</div>
        ) : (
          <ul className="space-y-3">
            {list.map((s) => {
              const w = sessionRoomWindow(s.scheduledAt, s.duration);
              const roomOpen = s.status === 'upcoming' && now >= w.opens && now <= w.closes;
              const started = now >= new Date(s.scheduledAt).getTime();
              return (
                <li key={s.id} className={`${ui.card} p-5`}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={
                            s.status === 'upcoming' ? ui.pillTeal : s.status === 'completed' ? ui.pillMuted : ui.pillSand
                          }
                        >
                          {t(`status_${s.status}`)}
                        </span>
                        <span className="text-sm font-semibold text-ink dark:text-snow">{fmt(s.scheduledAt)}</span>
                        <span className={`text-xs ${ui.muted}`}>{t('minutes', { minutes: s.duration })}</span>
                      </div>
                      <p className="text-sm text-ink dark:text-snow">
                        <Link href={`/${locale}/users/${s.menteeId}`} className="font-semibold hover:text-teal dark:hover:text-teal-dark">
                          {s.menteeName || t('mentee')}
                        </Link>
                        {s.amount > 0 && <span className={`ml-2 ${ui.muted}`}>· {won(s.amount)}</span>}
                      </p>
                      {s.notes && <p className={`max-w-xl whitespace-pre-wrap text-[13px] ${ui.muted}`}>{t('notes', { notes: s.notes })}</p>}
                    </div>

                    {s.status === 'upcoming' && (
                      <div className="flex flex-wrap items-center gap-2">
                        {roomOpen ? (
                          <Link href={`/${locale}/sessions/${s.id}`} className={`${ui.btnPrimary} !h-9 !px-4`}>
                            <Video className="h-4 w-4" />
                            {t('joinRoom')}
                          </Link>
                        ) : (
                          <span className={ui.pillMuted}>{t('roomOpensAt')}</span>
                        )}
                        <MessageButton userId={s.menteeId} className="[&_button]:!h-9 [&_button]:!px-4" />
                        {started && (
                          <button type="button" disabled={busy === s.id} onClick={() => complete(s)} className={`${ui.btnOutline} !h-9 !px-4`}>
                            <CheckCircle2 className="h-4 w-4" />
                            {t('markComplete')}
                          </button>
                        )}
                        {!started && s.paymentId && (
                          confirming === s.id ? (
                            <span className="flex items-center gap-2">
                              <span className="text-xs text-red-600 dark:text-red-400">{t('refundConfirm', { amount: won(s.amount) })}</span>
                              <button type="button" disabled={busy === s.id} onClick={() => refund(s)} className="h-9 rounded-lg bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                                {t('refundYes')}
                              </button>
                              <button type="button" onClick={() => setConfirming(null)} className={`${ui.btnOutline} !h-9 !px-3 text-xs`}>
                                {t('refundNo')}
                              </button>
                            </span>
                          ) : (
                            <button type="button" onClick={() => setConfirming(s.id)} className={`${ui.btnGhost} !text-red-600 dark:!text-red-400`}>
                              {t('cancelRefund')}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Revenue */}
      <section id="earnings" className="scroll-mt-28 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeader title={t('revenueTitle')} />
          <Link href={`/${locale}/my/lectures`} className={ui.btnGhost}>
            <GraduationCap className="h-4 w-4" />
            {t('manageCourses')}
          </Link>
        </div>

        <div className={`${ui.card} p-5`}>
          <p className={`mb-4 text-xs font-semibold ${ui.muted}`}>{t('chartTitle')}</p>
          <div className="flex h-40 items-end gap-3" role="img" aria-label={t('chartTitle')}>
            {stats.months.map((m) => (
              <div key={m.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className={`text-[11px] ${m.total ? 'font-semibold text-ink dark:text-snow' : ui.muted}`}>
                  {m.total ? won(m.total) : '—'}
                </span>
                <div
                  className="w-full max-w-12 rounded-t-md bg-teal dark:bg-teal-dark"
                  style={{ height: `${Math.max(m.total ? 6 : 2, (m.total / maxMonth) * 100)}%`, opacity: m.total ? 1 : 0.2 }}
                />
                <span className={`text-[11px] ${ui.muted}`}>{monthLabel(m.key)}</span>
              </div>
            ))}
          </div>
        </div>

        {payments.length === 0 ? (
          <div className={`${ui.card} p-8 text-center text-sm ${ui.muted}`}>{t('emptyRevenue')}</div>
        ) : (
          <div className={`${ui.card} overflow-x-auto`}>
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className={`border-b border-hairline text-left text-xs dark:border-hairline-dark ${ui.muted}`}>
                  <th className="px-5 py-3 font-semibold">{t('colDate')}</th>
                  <th className="px-5 py-3 font-semibold">{t('colItem')}</th>
                  <th className="px-5 py-3 font-semibold">{t('colKind')}</th>
                  <th className="px-5 py-3 text-right font-semibold">{t('colAmount')}</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 50).map((p) => (
                  <tr key={p.payment_id} className="border-b border-hairline last:border-0 dark:border-hairline-dark">
                    <td className={`whitespace-nowrap px-5 py-3 ${ui.muted}`}>{p.paid_at ? fmt(p.paid_at) : '—'}</td>
                    <td className="px-5 py-3 text-ink dark:text-snow">{p.order_name}</td>
                    <td className={`px-5 py-3 ${ui.muted}`}>{p.lecture_id ? t('kindCourse') : t('kindSession')}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-right">
                      <span className="font-semibold text-ink dark:text-snow">{won(net(p))}</span>
                      {p.refunded_amount > 0 && <span className={`ml-2 text-xs ${ui.muted}`}>{t('refundedShort', { amount: won(p.refunded_amount) })}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex gap-2 rounded-lg bg-surface p-4 text-xs text-ink-muted dark:bg-night dark:text-snow-muted">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div className="space-y-1 leading-relaxed">
            <p className="font-semibold text-ink dark:text-snow">{t('settlementTitle')}</p>
            <p>{t('settlementBody')}</p>
          </div>
        </div>
      </section>
    </>
  );
}
