'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { AlertTriangle, CheckCircle2, Clock3, RotateCcw, XCircle } from 'lucide-react';
import { confirmPayment } from '@/lib/payments/client';
import { PageShell, ui } from '@/components/lnk/ui';

type View = 'checking' | 'paid' | 'course' | 'free' | 'conflict' | 'failed' | 'pending' | 'error';

export default function PaymentCompletePage() {
  const t = useTranslations('payments');
  const locale = useLocale();
  const [view, setView] = useState<View>('checking');
  const [paymentId, setPaymentId] = useState('');
  const [lectureId, setLectureId] = useState<string | null>(null);

  const check = useCallback(async (id: string) => {
    setView('checking');
    // The webhook may still be on its way; retry a few times while pending.
    for (let attempt = 0; attempt < 4; attempt++) {
      const r = await confirmPayment(id);
      if ('error' in r) {
        if (r.error === 'auth_required' || r.error === 'not_found') return setView('error');
      } else if (r.status === 'paid') {
        if ('lectureId' in r && r.lectureId) {
          setLectureId(r.lectureId);
          return setView('course');
        }
        return setView('refundedForConflict' in r && r.refundedForConflict ? 'conflict' : 'paid');
      } else if (r.status === 'failed' || r.status === 'cancelled') {
        return setView('failed');
      }
      await new Promise((res) => setTimeout(res, 1500 * (attempt + 1)));
    }
    setView('pending');
  }, []);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('free') === '1') return setView('free');
    const id = q.get('paymentId') || '';
    setPaymentId(id);
    if (!id) return setView('error');
    // Mobile redirect: PortOne appends `code` when the buyer cancelled or the payment failed.
    if (q.get('code')) return setView('failed');
    void check(id);
  }, [check]);

  const content: Record<Exclude<View, 'checking'>, { icon: typeof CheckCircle2; tone: string; title: string; body: string }> = {
    paid: { icon: CheckCircle2, tone: 'text-teal dark:text-teal-dark bg-primary-50 dark:bg-primary-950/40', title: t('paidTitle'), body: t('paidBody') },
    course: { icon: CheckCircle2, tone: 'text-teal dark:text-teal-dark bg-primary-50 dark:bg-primary-950/40', title: t('courseTitle'), body: t('courseBody') },
    free: { icon: CheckCircle2, tone: 'text-teal dark:text-teal-dark bg-primary-50 dark:bg-primary-950/40', title: t('freeTitle'), body: t('paidBody') },
    conflict: { icon: RotateCcw, tone: 'text-[#75582b] bg-[#f8f0df] dark:text-[#e2c48f] dark:bg-[#2a2418]', title: t('conflictTitle'), body: t('conflictBody') },
    failed: { icon: XCircle, tone: 'text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-950/40', title: t('failedTitle'), body: t('failedBody') },
    pending: { icon: Clock3, tone: 'text-[#75582b] bg-[#f8f0df] dark:text-[#e2c48f] dark:bg-[#2a2418]', title: t('pendingTitle'), body: t('pendingBody') },
    error: { icon: AlertTriangle, tone: 'text-[#75582b] bg-[#f8f0df] dark:text-[#e2c48f] dark:bg-[#2a2418]', title: t('errorTitle'), body: t('errorBody') },
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-lg py-10">
        <div className={`${ui.card} p-8 text-center`}>
          {view === 'checking' ? (
            <div className="space-y-4 py-6">
              <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-2 border-teal border-t-transparent dark:border-teal-dark dark:border-t-transparent" />
              <p className={ui.muted}>{t('checking')}</p>
            </div>
          ) : (
            (() => {
              const c = content[view];
              const Icon = c.icon;
              return (
                <div className="space-y-5">
                  <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${c.tone}`}>
                    <Icon className="h-7 w-7" />
                  </span>
                  <div className="space-y-2">
                    <h1 className="text-2xl font-semibold text-ink dark:text-snow">{c.title}</h1>
                    <p className={`text-sm leading-relaxed ${ui.muted}`}>{c.body}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                    {view === 'course' && lectureId && (
                      <>
                        <Link href={`/${locale}/lectures/${lectureId}`} className={ui.btnPrimary}>{t('toCourse')}</Link>
                        <Link href={`/${locale}/my/payments`} className={ui.btnOutline}>{t('toPayments')}</Link>
                      </>
                    )}
                    {(view === 'paid' || view === 'free') && (
                      <>
                        <Link href={`/${locale}/my/schedule`} className={ui.btnPrimary}>{t('toSchedule')}</Link>
                        <Link href={`/${locale}/my/payments`} className={ui.btnOutline}>{t('toPayments')}</Link>
                      </>
                    )}
                    {(view === 'pending' || view === 'error') && paymentId && (
                      <button type="button" onClick={() => check(paymentId)} className={ui.btnPrimary}>{t('retry')}</button>
                    )}
                    {(view === 'failed' || view === 'conflict') && (
                      <Link href={`/${locale}/mentors`} className={ui.btnPrimary}>{t('tryAgain')}</Link>
                    )}
                    {(view === 'pending' || view === 'error') && (
                      <Link href={`/${locale}/my/payments`} className={ui.btnOutline}>{t('toPayments')}</Link>
                    )}
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </PageShell>
  );
}
