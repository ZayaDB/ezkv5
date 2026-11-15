'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarDays, Clock, CreditCard, Globe2, Info, Wallet } from 'lucide-react';
import { mentorsApi } from '@/lib/api/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import { formatMentorHourlyPrice } from '@/lib/format/price';
import { formatDate } from '@/lib/i18n/dateFormat';
import {
  availablePayOptions,
  confirmPayment,
  createCheckout,
  CheckoutError,
  getBusySlots,
  requestPortOnePayment,
  type PayOption,
} from '@/lib/payments/client';
import type { Mentor } from '@/types';
import { Notice, PageShell, ui } from '@/components/lnk/ui';

const KST_OFFSET = '+09:00';
const DAYS_AHEAD = 14;
const FIRST_HOUR = 9;
const LAST_START_HOUR = 21; // last slot starts 21:00 KST

/** YYYY-MM-DD of `d` in Korea time */
function kstDateKey(d: Date) {
  return new Date(d.getTime() + 9 * 3_600_000).toISOString().slice(0, 10);
}
function kstSlot(dateKey: string, hh: number, mm: number) {
  return new Date(`${dateKey}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00${KST_OFFSET}`);
}

export default function BookSessionPage() {
  const params = useParams();
  const id = params.id as string;
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('booking');
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [mentor, setMentor] = useState<Mentor | null | undefined>(undefined);
  const [busy, setBusy] = useState<{ start: number; end: number }[]>([]);
  const [dateKey, setDateKey] = useState('');
  const [slot, setSlot] = useState<Date | null>(null);
  const [duration, setDuration] = useState(60);
  const [format, setFormat] = useState<'online' | 'offline'>('online');
  const [notes, setNotes] = useState('');
  const payOptions = useMemo(() => availablePayOptions(), []);
  const [payOption, setPayOption] = useState<PayOption>('card');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const days = useMemo(() => {
    const today = kstDateKey(new Date());
    return Array.from({ length: DAYS_AHEAD }, (_, i) => {
      const d = new Date(`${today}T12:00:00${KST_OFFSET}`);
      d.setUTCDate(d.getUTCDate() + i);
      return kstDateKey(d);
    });
  }, []);

  useEffect(() => {
    if (!dateKey && days.length) setDateKey(days[0]);
  }, [days, dateKey]);

  const load = useCallback(async () => {
    const res = await mentorsApi.getById(id);
    if (res.error || !res.data) return setMentor(null);
    const m = res.data as Mentor;
    setMentor(m);
    setDuration(m.sessionDuration && [30, 60, 90, 120].includes(m.sessionDuration) ? m.sessionDuration : 60);
    setFormat(m.sessionFormat === 'offline' ? 'offline' : 'online');
  }, [id]);

  const loadBusy = useCallback(async () => {
    const from = new Date();
    const to = new Date(Date.now() + (DAYS_AHEAD + 1) * 86_400_000);
    setBusy(await getBusySlots(id, from, to));
  }, [id]);

  useEffect(() => {
    load();
    loadBusy();
  }, [load, loadBusy]);

  const slots = useMemo(() => {
    if (!dateKey) return [];
    const earliest = Date.now() + 60 * 60_000;
    const out: { at: Date; disabled: boolean }[] = [];
    for (let h = FIRST_HOUR; h <= LAST_START_HOUR; h++) {
      for (const m of [0, 30]) {
        if (h === LAST_START_HOUR && m === 30) continue;
        const at = kstSlot(dateKey, h, m);
        const start = at.getTime();
        const end = start + duration * 60_000;
        const clash = busy.some((b) => b.start < end && b.end > start);
        out.push({ at, disabled: start < earliest || clash });
      }
    }
    return out;
  }, [dateKey, duration, busy]);

  useEffect(() => {
    // drop a selection that became unavailable (duration change / new busy data)
    if (slot && !slots.some((s) => !s.disabled && s.at.getTime() === slot.getTime())) setSlot(null);
  }, [slots, slot]);

  if (mentor === undefined || authLoading) {
    return (
      <PageShell>
        <div className="h-64 animate-pulse rounded-2xl bg-hairline/50 dark:bg-night-card" />
      </PageShell>
    );
  }
  if (mentor === null) {
    router.replace(`/${locale}/mentors`);
    return null;
  }

  const name = mentor.name || '';
  const hourly = typeof mentor.price === 'number' ? mentor.price : 0;
  const priceInfo = formatMentorHourlyPrice(mentor.price);
  const isFree = priceInfo.free === true;
  const estimate = Math.ceil((hourly * duration) / 60);
  const amountLabel = isFree ? t('free') : `₩${estimate.toLocaleString('ko-KR')}`;
  const isSelf = Boolean(user && (mentor as Mentor & { userId?: string }).userId === user.id);
  const paymentsReady = isFree || payOptions.length > 0;
  const formatOptions: ('online' | 'offline')[] =
    mentor.sessionFormat === 'both' ? ['online', 'offline'] : [mentor.sessionFormat === 'offline' ? 'offline' : 'online'];

  const fmtDay = (key: string) => ({
    weekday: formatDate(new Date(`${key}T12:00:00${KST_OFFSET}`), locale, { weekday: 'short', timeZone: 'Asia/Seoul' }),
    day: Number(key.slice(8, 10)),
    month: Number(key.slice(5, 7)),
  });
  const fmtTime = (d: Date) =>
    new Date(d.getTime() + 9 * 3_600_000).toISOString().slice(11, 16);
  const whenLabel = slot
    ? `${formatDate(slot, locale, { dateStyle: 'medium', timeZone: 'Asia/Seoul' })} · ${fmtTime(slot)} KST`
    : t('pickTime');

  const submit = async () => {
    if (!slot || submitting) return;
    setError('');
    setSubmitting(true);
    try {
      const checkout = await createCheckout({ mentorId: mentor.id, scheduledAt: slot, duration, type: format, notes });
      if (checkout.free) {
        router.push(`/${locale}/payments/complete?free=1`);
        return;
      }
      const result = await requestPortOnePayment({
        checkout,
        option: payOption,
        locale,
        customer: { fullName: user?.name, email: user?.email },
      });
      if (!result.ok) {
        setError(t('errPayCancelled'));
        setSubmitting(false);
        loadBusy();
        return;
      }
      router.push(`/${locale}/payments/complete?paymentId=${encodeURIComponent(result.paymentId)}`);
      void confirmPayment(result.paymentId); // warm start; the complete page confirms again
    } catch (e) {
      const code = e instanceof CheckoutError ? e.code : 'unknown';
      setError(
        code === 'tooSoon' ? t('errTooSoon')
          : code === 'tooFar' ? t('errTooFar')
            : code === 'taken' ? t('errTaken')
              : code === 'self' ? t('selfBooking')
                : t('errUnknown')
      );
      if (code === 'taken') loadBusy();
      setSubmitting(false);
    }
  };

  const payChoices: { key: PayOption; icon: typeof CreditCard; label: string; desc: string }[] = [
    { key: 'card', icon: CreditCard, label: t('payCard'), desc: t('payCardDesc') },
    { key: 'easyPay', icon: Wallet, label: t('payEasy'), desc: t('payEasyDesc') },
    { key: 'globalCard', icon: Globe2, label: t('payGlobal'), desc: t('payGlobalDesc') },
  ].filter((c) => payOptions.includes(c.key as PayOption)) as typeof payChoices;

  const chip = (active: boolean, disabled = false) =>
    `rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
      disabled
        ? 'cursor-not-allowed border-hairline text-ink-muted/40 line-through dark:border-hairline-dark dark:text-snow-muted/40'
        : active
          ? 'border-teal bg-teal text-white dark:border-teal-dark dark:bg-teal-dark dark:text-night'
          : 'border-hairline bg-white text-ink hover:border-teal dark:border-hairline-dark dark:bg-night-card dark:text-snow dark:hover:border-teal-dark'
    }`;

  return (
    <PageShell>
      <nav className="mb-6 flex items-center gap-2 text-sm text-ink-muted dark:text-snow-muted">
        <Link href={`/${locale}/mentors/${mentor.id}`} className="hover:text-teal dark:hover:text-teal-dark">{name || t('back')}</Link>
        <span>/</span>
        <span className="text-ink dark:text-snow">{t('breadcrumb')}</span>
      </nav>

      <header className="mb-8 space-y-3">
        <p className={ui.eyebrow}>{t('eyebrow')}</p>
        <h1 className={ui.h1}>{t('title', { name })}</h1>
        <p className={ui.lead}>{isFree ? t('subtitleFree') : t('subtitle')}</p>
      </header>

      {!isAuthenticated ? (
        <Notice tone="info" title={t('loginRequired')}>
          <Link href={`/${locale}/login`} className={`${ui.btnPrimary} mt-3`}>{t('loginCta')}</Link>
        </Notice>
      ) : isSelf ? (
        <Notice tone="caution" title={t('selfBooking')} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {/* Date */}
            <section className={`${ui.card} space-y-4 p-6`}>
              <h2 className="flex items-center gap-2 text-base font-semibold text-ink dark:text-snow">
                <CalendarDays className="h-4 w-4 text-teal dark:text-teal-dark" /> {t('stepDate')}
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {days.map((key) => {
                  const f = fmtDay(key);
                  const active = key === dateKey;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDateKey(key)}
                      aria-pressed={active}
                      className={`flex min-w-[64px] flex-col items-center rounded-xl border px-3 py-2 transition-colors ${
                        active
                          ? 'border-teal bg-teal text-white dark:border-teal-dark dark:bg-teal-dark dark:text-night'
                          : 'border-hairline bg-white text-ink hover:border-teal dark:border-hairline-dark dark:bg-night-card dark:text-snow'
                      }`}
                    >
                      <span className="text-xs opacity-80">{f.weekday}</span>
                      <span className="text-lg font-semibold">{f.day}</span>
                      <span className="text-[11px] opacity-70">{f.month}/{f.day}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Time */}
            <section className={`${ui.card} space-y-4 p-6`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-base font-semibold text-ink dark:text-snow">
                  <Clock className="h-4 w-4 text-teal dark:text-teal-dark" /> {t('stepTime')}
                </h2>
                <span className={`text-xs ${ui.muted}`}>{t('timezoneNote')}</span>
              </div>
              {slots.every((s) => s.disabled) ? (
                <p className={ui.muted}>{t('noSlots')}</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
                  {slots.map((s) => {
                    const active = slot?.getTime() === s.at.getTime();
                    return (
                      <button
                        key={s.at.toISOString()}
                        type="button"
                        disabled={s.disabled}
                        onClick={() => setSlot(s.at)}
                        aria-pressed={active}
                        className={chip(active, s.disabled)}
                      >
                        {fmtTime(s.at)}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Details */}
            <section className={`${ui.card} space-y-5 p-6`}>
              <h2 className="text-base font-semibold text-ink dark:text-snow">{t('stepDetails')}</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-ink dark:text-snow">{t('duration')}</p>
                  <div className="flex flex-wrap gap-2">
                    {[30, 60, 90].map((m) => (
                      <button key={m} type="button" onClick={() => setDuration(m)} aria-pressed={duration === m} className={chip(duration === m)}>
                        {t('minutes', { n: m })}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-ink dark:text-snow">{t('format')}</p>
                  <div className="flex flex-wrap gap-2">
                    {formatOptions.map((f) => (
                      <button key={f} type="button" onClick={() => setFormat(f)} aria-pressed={format === f} className={chip(format === f)}>
                        {t(f)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-ink dark:text-snow">{t('notes')}</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder={t('notesPlaceholder')}
                  className={`${ui.input} h-auto py-2`}
                />
              </label>
            </section>

            {/* Payment method */}
            {!isFree && (
              <section className={`${ui.card} space-y-4 p-6`}>
                <h2 className="text-base font-semibold text-ink dark:text-snow">{t('stepPayment')}</h2>
                {payChoices.length === 0 ? (
                  <p className={ui.muted}>{t('paymentsUnavailable')}</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {payChoices.map(({ key, icon: Icon, label, desc }) => {
                      const active = payOption === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setPayOption(key)}
                          aria-pressed={active}
                          className={`rounded-xl border p-4 text-left transition-colors ${
                            active
                              ? 'border-teal bg-primary-50 dark:border-teal-dark dark:bg-primary-950/40'
                              : 'border-hairline hover:border-teal/60 dark:border-hairline-dark'
                          }`}
                        >
                          <Icon className="mb-2 h-5 w-5 text-teal dark:text-teal-dark" />
                          <p className="text-sm font-semibold text-ink dark:text-snow">{label}</p>
                          <p className={`mt-1 text-xs ${ui.muted}`}>{desc}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className={`${ui.card} space-y-5 p-6`}>
              <h2 className="text-base font-semibold text-ink dark:text-snow">{t('summary')}</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className={ui.muted}>{t('mentor')}</dt>
                  <dd className="text-right font-medium text-ink dark:text-snow">{name}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className={ui.muted}>{t('when')}</dt>
                  <dd className="text-right font-medium text-ink dark:text-snow">{whenLabel}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className={ui.muted}>{t('duration')}</dt>
                  <dd className="text-right font-medium text-ink dark:text-snow">{t('minutes', { n: duration })} · {t(format)}</dd>
                </div>
              </dl>
              <div className="border-t border-hairline pt-4 dark:border-hairline-dark">
                <div className="flex items-end justify-between">
                  <span className="text-sm font-medium text-ink dark:text-snow">{t('total')}</span>
                  <span className="text-2xl font-semibold text-ink dark:text-snow">{amountLabel}</span>
                </div>
                {!isFree && <p className={`mt-1 text-right text-xs ${ui.muted}`}>{t('perHourNote', { price: priceInfo.label })}</p>}
              </div>

              {error && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={submit}
                disabled={!slot || submitting || !paymentsReady}
                className={`${ui.btnPrimary} w-full`}
              >
                {submitting ? t('processing') : isFree ? t('bookFreeButton') : t('payButton', { amount: amountLabel })}
              </button>

              {!isFree && process.env.NEXT_PUBLIC_PORTONE_TEST_MODE === '1' && (
                <p className="rounded-lg bg-[#f8f0df] px-3 py-2 text-center text-xs font-medium text-[#75582b] dark:bg-[#2a2418] dark:text-[#e2c48f]">
                  {t('testMode')}
                </p>
              )}

              <div className="flex gap-2 rounded-lg bg-surface p-3 text-xs text-ink-muted dark:bg-night dark:text-snow-muted">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <div>
                  <p className="font-semibold text-ink dark:text-snow">{t('policyTitle')}</p>
                  <p className="mt-1 leading-relaxed">{t('policyBody')}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </PageShell>
  );
}
