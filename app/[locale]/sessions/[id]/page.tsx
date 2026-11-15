'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { AlertTriangle, CalendarClock, LogIn, MessageCircle, Video } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { fetchPublicProfiles } from '@/lib/supabase/publicProfiles';
import { startConversation } from '@/lib/supabase/messages';
import { sessionRoomWindow } from '@/lib/live/sessionRoom';
import { PageShell, ui } from '@/components/lnk/ui';
import { ReviewForm } from '@/components/reviews/Reviews';
import { getMySessionReview, submitMentorReview } from '@/lib/supabase/reviews';

const LiveClassroom = dynamic(() => import('@/components/live/LiveClassroom'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-[#0e1a18]" />,
});

type SessionInfo = {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  otherId: string;
  otherName: string;
  iAmMentor: boolean;
};

export default function SessionRoomPage() {
  const t = useTranslations('sessionRoom');
  const locale = useLocale();
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [info, setInfo] = useState<SessionInfo | null | undefined>(undefined);
  const [token, setToken] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [left, setLeft] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [myReview, setMyReview] = useState<{ rating: number; comment: string } | null | undefined>(undefined);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  const load = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('mentor_sessions')
      .select('id, scheduled_at, duration, status, mentee_id, mentor_profiles(user_id)')
      .eq('id', id)
      .maybeSingle();
    if (!data) {
      setInfo(null);
      return;
    }
    const mentorId = (data.mentor_profiles as unknown as { user_id?: string } | null)?.user_id || '';
    const iAmMentor = mentorId === user.id;
    const otherId = iAmMentor ? (data.mentee_id as string) : mentorId;
    const names = await fetchPublicProfiles(supabase, [otherId]);
    setInfo({
      id: data.id as string,
      scheduledAt: data.scheduled_at as string,
      duration: Number(data.duration || 60),
      status: data.status as string,
      otherId,
      otherName: names.get(otherId)?.name || '',
      iAmMentor,
    });
    if (!iAmMentor && data.status === 'completed') setMyReview(await getMySessionReview(data.id as string));
  }, [id, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const join = async () => {
    setJoining(true);
    setError('');
    try {
      const res = await fetch('/api/sessions/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.token) {
        setLeft(false);
        setToken(body.token);
      } else if (body.error === 'too_early') setError(t('tooEarly'));
      else if (body.error === 'ended') setError(t('ended'));
      else if (body.error === 'not_configured') setError(t('notConfigured'));
      else setError(t('joinFailed'));
    } catch {
      setError(t('joinFailed'));
    } finally {
      setJoining(false);
    }
  };

  const openChat = async () => {
    if (!info) return;
    try {
      const cid = await startConversation(info.otherId);
      window.location.href = `/${locale}/my/messages?c=${cid}`;
    } catch {
      /* ignore */
    }
  };

  const whenLabel = (iso: string) =>
    new Intl.DateTimeFormat(locale === 'kr' ? 'ko-KR' : locale === 'mn' ? 'mn-MN' : 'en-US', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'Asia/Seoul',
    }).format(new Date(iso));

  const notice = (icon: React.ReactNode, title: string, body: string, action?: React.ReactNode) => (
    <div className={`${ui.card} mx-auto flex w-full max-w-lg flex-col items-center gap-4 p-10 text-center`}>
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-teal dark:bg-primary-950/40 dark:text-teal-dark">{icon}</span>
      <h1 className="text-xl font-semibold text-ink dark:text-snow">{title}</h1>
      <p className={`text-sm ${ui.muted}`}>{body}</p>
      {action}
    </div>
  );

  if (!authLoading && !user) {
    return (
      <PageShell>
        {notice(
          <LogIn className="h-6 w-6" />,
          t('loginTitle'),
          t('loginBody'),
          <Link href={`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/sessions/${id}`)}`} className={ui.btnPrimary}>
            {t('login')}
          </Link>
        )}
      </PageShell>
    );
  }
  if (info === undefined) {
    return (
      <PageShell>
        <div className="h-64 animate-pulse rounded-2xl bg-hairline/50 dark:bg-night-card" />
      </PageShell>
    );
  }
  if (info === null) {
    return <PageShell>{notice(<AlertTriangle className="h-6 w-6" />, t('notFoundTitle'), t('notFoundBody'))}</PageShell>;
  }

  const header = (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="space-y-1">
        <p className={ui.eyebrow}>{t('eyebrow')}</p>
        <h1 className="text-2xl font-semibold text-ink dark:text-snow">
          {t('title', { name: info.otherName || t('unknownUser') })}
        </h1>
        <p className={`text-sm ${ui.muted}`}>{t('when', { when: whenLabel(info.scheduledAt), minutes: info.duration })}</p>
      </div>
      <button type="button" onClick={openChat} className={ui.btnOutline}>
        <MessageCircle className="h-4 w-4" />
        {t('openChat')}
      </button>
    </header>
  );

  if (token) {
    return (
      <PageShell>
        {header}
        <div className="h-[calc(100vh-14rem)] min-h-[480px]">
          <LiveClassroom
            token={token}
            onLeft={() => {
              setToken(null);
              setLeft(true);
            }}
          />
        </div>
        <p className={`mt-3 text-xs ${ui.muted}`}>{t('privacyNote')}</p>
      </PageShell>
    );
  }

  const w = sessionRoomWindow(info.scheduledAt, info.duration);
  const cancelled = info.status === 'cancelled';
  const ended = info.status === 'completed' || now > w.closes;
  const early = now < w.opens;

  return (
    <PageShell>
      {header}
      {cancelled
        ? notice(<AlertTriangle className="h-6 w-6" />, t('cancelledTitle'), t('cancelledBody'))
        : ended
          ? (
              <div className="space-y-6">
                {notice(<CalendarClock className="h-6 w-6" />, t('endedTitle'), t('endedBody'))}
                {info.status === 'completed' && !info.iAmMentor && myReview !== undefined && (
                  <div className="mx-auto w-full max-w-lg">
                    <ReviewForm
                      initial={myReview}
                      title={t('reviewPrompt', { name: info.otherName || t('unknownUser') })}
                      onSubmit={(rating, comment) => submitMentorReview(info.id, rating, comment)}
                    />
                  </div>
                )}
              </div>
            )
          : notice(
              <Video className="h-6 w-6" />,
              left ? t('leftTitle') : early ? t('waitTitle') : t('readyTitle'),
              early ? t('waitBody', { minutes: 10 }) : t('readyBody'),
              <div className="flex w-full flex-col items-center gap-2">
                <button type="button" onClick={join} disabled={early || joining} className={ui.btnPrimary}>
                  <Video className="h-4 w-4" />
                  {joining ? t('joining') : left ? t('rejoin') : t('join')}
                </button>
                {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
                <p className={`text-xs ${ui.muted}`}>{t('deviceHint')}</p>
              </div>
            )}
    </PageShell>
  );
}
