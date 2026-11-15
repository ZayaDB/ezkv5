'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Receipt } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useFormatDate } from '@/lib/i18n/useFormatDate';
import { cancelPayment } from '@/lib/payments/client';
import { ui } from '@/components/lnk/ui';

type Row = {
  payment_id: string;
  order_name: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  paid_at: string | null;
  created_at: string;
  refunded_amount: number;
  user_id: string;
  mentor_sessions: { scheduled_at: string; status: string } | null;
  mentor_profiles: { user_id: string } | null;
};

const FREE_CANCEL_HOURS = 24;

const statusTone: Record<Row['status'], string> = {
  paid: 'bg-primary-50 text-teal dark:bg-primary-950/40 dark:text-teal-dark',
  pending: 'bg-[#f8f0df] text-[#75582b] dark:bg-[#2a2418] dark:text-[#e2c48f]',
  failed: 'bg-hairline/60 text-ink-muted dark:bg-night-pill dark:text-snow-muted',
  cancelled: 'bg-hairline/60 text-ink-muted dark:bg-night-pill dark:text-snow-muted',
};

export default function MyPaymentsPage() {
  const t = useTranslations('payments');
  const locale = useLocale();
  const fmt = useFormatDate();
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('payments')
      .select('payment_id, order_name, amount, status, paid_at, created_at, refunded_amount, user_id, mentor_sessions(scheduled_at, status), mentor_profiles(user_id)')
      .in('status', ['paid', 'cancelled', 'pending'])
      .order('created_at', { ascending: false })
      .limit(100);
    // hide abandoned checkouts older than 30 minutes
    const cutoff = Date.now() - 30 * 60_000;
    setRows(((data as unknown as Row[]) || []).filter((r) => r.status !== 'pending' || new Date(r.created_at).getTime() > cutoff));
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const doCancel = async (paymentId: string) => {
    setBusy(true);
    setMessage(null);
    const r = await cancelPayment(paymentId);
    setBusy(false);
    setConfirming(null);
    if (r.error === 'too_late') setMessage({ tone: 'err', text: t('cancelTooLate', { hours: r.hours ?? FREE_CANCEL_HOURS }) });
    else if (r.error) setMessage({ tone: 'err', text: t('cancelFailed') });
    else setMessage({ tone: 'ok', text: t('cancelDone') });
    load();
  };

  const won = (n: number) => `₩${n.toLocaleString('ko-KR')}`;

  return (
    <div className="w-full space-y-8">
      <header className="space-y-2">
        <p className={ui.eyebrow}>{t('historyEyebrow')}</p>
        <h1 className="text-2xl font-semibold text-ink dark:text-snow sm:text-[32px]">{t('historyTitle')}</h1>
        <p className={ui.muted}>{t('historySubtitle')}</p>
      </header>

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

      {rows === null ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-hairline/50 dark:bg-night-card" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className={`${ui.card} flex flex-col items-center gap-4 p-10 text-center`}>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-teal dark:bg-primary-950/40 dark:text-teal-dark">
            <Receipt className="h-6 w-6" />
          </span>
          <p className={ui.muted}>{t('empty')}</p>
          <Link href={`/${locale}/mentors`} className={ui.btnPrimary}>{t('findMentor')}</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const sessionAt = r.mentor_sessions?.scheduled_at;
            const isBuyer = r.user_id === user?.id;
            const isMentor = r.mentor_profiles?.user_id === user?.id;
            const hoursLeft = sessionAt ? (new Date(sessionAt).getTime() - Date.now()) / 3_600_000 : -1;
            const canCancel = r.status === 'paid' && hoursLeft > 0 && (isMentor || (isBuyer && hoursLeft >= FREE_CANCEL_HOURS));
            return (
              <li key={r.payment_id} className={`${ui.card} p-5`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusTone[r.status]}`}>{t(`status_${r.status}`)}</span>
                      {isMentor && !isBuyer && (
                        <span className="rounded-full border border-hairline px-2.5 py-0.5 text-xs text-ink-muted dark:border-hairline-dark dark:text-snow-muted">{t('asMentor')}</span>
                      )}
                    </div>
                    <p className="truncate font-semibold text-ink dark:text-snow">{r.order_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-ink dark:text-snow">{won(r.amount)}</p>
                    {r.refunded_amount > 0 && <p className={`text-xs ${ui.muted}`}>{t('refunded', { amount: won(r.refunded_amount) })}</p>}
                  </div>
                </div>
                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  {sessionAt && (
                    <div className="flex gap-2">
                      <dt className={ui.muted}>{t('sessionAt')}</dt>
                      <dd className="text-ink dark:text-snow">{fmt(sessionAt, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Seoul' })} KST</dd>
                    </div>
                  )}
                  {r.paid_at && (
                    <div className="flex gap-2">
                      <dt className={ui.muted}>{t('paidAt')}</dt>
                      <dd className="text-ink dark:text-snow">{fmt(r.paid_at, { dateStyle: 'medium' })}</dd>
                    </div>
                  )}
                </dl>

                {!canCancel && r.status === 'paid' && isBuyer && !isMentor && hoursLeft > 0 && (
                  <p className={`mt-4 border-t border-hairline pt-4 text-xs dark:border-hairline-dark ${ui.muted}`}>
                    {t('cancelTooLate', { hours: FREE_CANCEL_HOURS })}
                  </p>
                )}

                {canCancel && (
                  <div className="mt-4 border-t border-hairline pt-4 dark:border-hairline-dark">
                    {confirming === r.payment_id ? (
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-ink dark:text-snow">{t('cancelConfirm')}</p>
                        <div className="flex gap-2">
                          <button type="button" disabled={busy} onClick={() => doCancel(r.payment_id)} className="inline-flex h-10 items-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                            {t('cancelYes')}
                          </button>
                          <button type="button" disabled={busy} onClick={() => setConfirming(null)} className={`${ui.btnOutline} h-10`}>
                            {t('cancelNo')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setConfirming(r.payment_id)} className="text-sm font-semibold text-red-600 hover:underline dark:text-red-400">
                        {t('cancel')}
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
