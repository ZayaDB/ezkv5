'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { AlertTriangle, CalendarClock, Clock3, Lock, LogIn, Radio, XCircle } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getLesson, getProgress, isEnrolled, liveApi, saveProgress, type Lesson } from '@/lib/live/client';
import { LessonStatusPill, kstLabel, mmss } from '@/components/live/lessonUi';
import { PageShell, ui } from '@/components/lnk/ui';

const LiveClassroom = dynamic(() => import('@/components/live/LiveClassroom'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-[#0e1a18]" />,
});

type Role = 'host' | 'student' | 'preview' | null;

declare global {
  interface Window {
    Stream?: (el: HTMLIFrameElement) => {
      currentTime: number;
      duration: number;
      addEventListener: (ev: string, fn: () => void) => void;
      removeEventListener: (ev: string, fn: () => void) => void;
    };
  }
}

function loadStreamSdk(): Promise<void> {
  if (typeof window === 'undefined' || window.Stream) return Promise.resolve();
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://embed.videodelivery.net/embed/sdk.latest.js';
    s.onload = () => resolve();
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
}

export default function LessonPage() {
  const params = useParams();
  const lessonId = params.lessonId as string;
  const t = useTranslations('live');
  const locale = useLocale();
  const { user, loading: authLoading } = useAuth();

  const [lesson, setLesson] = useState<Lesson | null | undefined>(undefined);
  const [lecture, setLecture] = useState<{ id: string; title: string; instructor_id: string } | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [token, setToken] = useState<string | null>(null);
  const [left, setLeft] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [replay, setReplay] = useState<string | null>(null);
  const [resumeAt, setResumeAt] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const refresh = useCallback(async () => {
    const r = await getLesson(lessonId);
    setLesson(r?.lesson ?? null);
    setLecture(r?.lecture ?? null);
    return r;
  }, [lessonId]);

  // initial load + role
  useEffect(() => {
    if (authLoading) return;
    (async () => {
      const r = await refresh();
      if (!r || !user) return;
      const isHost = r.lecture?.instructor_id === user.id || user.role === 'admin';
      if (isHost) return setRole('host');
      if (r.lecture && (await isEnrolled(r.lecture.id, user.id))) return setRole('student');
      setRole(r.lesson.is_preview && r.lesson.status === 'ready' ? 'preview' : null);
    })();
  }, [authLoading, user, refresh]);

  // poll while waiting for the class to start or the replay to be ready
  useEffect(() => {
    if (!lesson || token) return;
    if (lesson.status === 'scheduled') {
      const id = setInterval(refresh, 15_000);
      return () => clearInterval(id);
    }
    if (lesson.status === 'processing') {
      const tick = async () => {
        const r = await liveApi.sync(lesson.id);
        if (r.status && r.status !== 'processing') void refresh();
      };
      void tick();
      const id = setInterval(tick, 12_000);
      return () => clearInterval(id);
    }
  }, [lesson, token, refresh]);

  // replay URL + resume position
  useEffect(() => {
    if (!lesson || lesson.status !== 'ready' || !role) return;
    (async () => {
      const r = await liveApi.replay(lesson.id);
      if (r.url) setReplay(r.url);
      if (user) {
        const p = await getProgress(user.id, [lesson.id]);
        const pos = p.get(lesson.id)?.position_seconds || 0;
        if (pos > 10 && !(lesson.replay_seconds && pos > lesson.replay_seconds - 15)) setResumeAt(pos);
      }
    })();
  }, [lesson, role, user]);

  // progress tracking through the Stream player SDK
  useEffect(() => {
    if (!replay || !user || !lesson || !iframeRef.current) return;
    let player: ReturnType<NonNullable<Window['Stream']>> | null = null;
    let last = 0;
    const onTime = () => {
      if (!player) return;
      const now = Date.now();
      if (now - last < 15_000) return;
      last = now;
      void saveProgress(user.id, lesson.id, player.currentTime, lesson.replay_seconds || player.duration || null);
    };
    const onEnd = () => player && void saveProgress(user.id, lesson.id, player.duration || player.currentTime, player.duration || null);
    loadStreamSdk().then(() => {
      if (!window.Stream || !iframeRef.current) return;
      player = window.Stream(iframeRef.current);
      player.addEventListener('timeupdate', onTime);
      player.addEventListener('ended', onEnd);
    });
    return () => {
      if (player) {
        if (player.currentTime > 5) void saveProgress(user.id, lesson.id, player.currentTime, lesson.replay_seconds || null);
        player.removeEventListener('timeupdate', onTime);
        player.removeEventListener('ended', onEnd);
      }
    };
  }, [replay, user, lesson]);

  const enter = async () => {
    if (!lesson) return;
    setJoining(true);
    setError('');
    const r: { token?: string; error?: string; opensAt?: string } =
      role === 'host' ? await liveApi.start(lesson.id) : await liveApi.join(lesson.id);
    setJoining(false);
    if (r.token) {
      setLeft(false);
      setToken(r.token);
      if (lesson.status !== 'live') void refresh();
      return;
    }
    if (r.error === 'not_configured') setError(t('notConfigured'));
    else if (r.error === 'not_started') setError(t('waitingHost'));
    else if (r.error === 'too_early' && r.opensAt) setError(t('opensSoon', { time: kstLabel(r.opensAt, locale) }));
    else setError(t('joinError'));
    void refresh();
  };

  const endClass = async () => {
    if (!lesson) return;
    setConfirmEnd(false);
    setToken(null);
    await liveApi.end(lesson.id);
    await refresh();
  };

  // ---------------------------------------------------------------- render
  if (lesson === undefined || authLoading) {
    return (
      <PageShell>
        <div className="h-[60vh] animate-pulse rounded-2xl bg-hairline/50 dark:bg-night-card" />
      </PageShell>
    );
  }

  const header = lesson && (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-2">
        <nav className="flex items-center gap-2 text-sm text-ink-muted dark:text-snow-muted">
          {lecture && <Link href={`/${locale}/lectures/${lecture.id}`} className="hover:text-teal dark:hover:text-teal-dark">{lecture.title}</Link>}
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <p className={ui.eyebrow}>{t('roomEyebrow')}</p>
          <LessonStatusPill status={lesson.status} />
        </div>
        <h1 className="text-2xl font-semibold text-ink dark:text-snow sm:text-[32px] sm:leading-[1.2]">{lesson.title}</h1>
        {lesson.scheduled_at && (
          <p className={`flex items-center gap-1.5 text-sm ${ui.muted}`}>
            <CalendarClock className="h-4 w-4" /> {kstLabel(lesson.scheduled_at, locale)} · {t('minutes', { n: lesson.duration_min })}
          </p>
        )}
      </div>
      {role === 'host' && lesson.status === 'live' && (
        confirmEnd ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/60 dark:bg-red-950/30">
            <span className="text-sm text-red-700 dark:text-red-300">{t('endConfirm')}</span>
            <button type="button" onClick={endClass} className="inline-flex h-9 items-center rounded-lg bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-700">{t('endYes')}</button>
            <button type="button" onClick={() => setConfirmEnd(false)} className={`${ui.btnOutline} h-9`}>{t('endNo')}</button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmEnd(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700">
            <XCircle className="h-4 w-4" /> {t('endClass')}
          </button>
        )
      )}
    </header>
  );

  const card = (icon: React.ReactNode, title: string, body?: string, action?: React.ReactNode) => (
    <div className={`${ui.card} mx-auto flex max-w-xl flex-col items-center gap-4 p-10 text-center`}>
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-teal dark:bg-primary-950/40 dark:text-teal-dark">{icon}</span>
      <h2 className="text-xl font-semibold text-ink dark:text-snow">{title}</h2>
      {body && <p className={`text-sm leading-relaxed ${ui.muted}`}>{body}</p>}
      {action}
    </div>
  );

  if (!lesson) {
    return (
      <PageShell>
        {card(<Lock className="h-6 w-6" />, t('noAccessTitle'), t('noAccessBody'), <Link href={`/${locale}/lectures`} className={ui.btnPrimary}>{t('toCourse')}</Link>)}
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        {header}
        {card(<LogIn className="h-6 w-6" />, t('loginTitle'), undefined, <Link href={`/${locale}/login`} className={ui.btnPrimary}>{t('loginCta')}</Link>)}
      </PageShell>
    );
  }

  if (!role) {
    return (
      <PageShell>
        {header}
        {card(
          <Lock className="h-6 w-6" />,
          t('noAccessTitle'),
          t('noAccessBody'),
          lecture && <Link href={`/${locale}/lectures/${lecture.id}`} className={ui.btnPrimary}>{t('toCourse')}</Link>
        )}
      </PageShell>
    );
  }

  // in the room
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
              void refresh();
            }}
          />
        </div>
        <p className={`mt-3 text-xs ${ui.muted}`}>{t('recordingNote')}</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {header}

      {lesson.status === 'cancelled' && card(<XCircle className="h-6 w-6" />, t('cancelledTitle'))}

      {(lesson.status === 'scheduled' || lesson.status === 'live') &&
        card(
          <Radio className="h-6 w-6" />,
          left ? t('leftTitle') : lesson.status === 'live' ? t('status_live') : t('scheduledFor', { when: lesson.scheduled_at ? kstLabel(lesson.scheduled_at, locale) : '' }),
          lesson.status === 'scheduled' && role !== 'host' ? t('waitingHost') : t('recordingNote'),
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={enter}
              disabled={joining || (lesson.status === 'scheduled' && role !== 'host')}
              className={`${ui.btnPrimary} ${lesson.status === 'live' ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:text-white' : ''}`}
            >
              <Radio className="h-4 w-4" />
              {role === 'host' ? (lesson.status === 'live' ? t('reenter') : t('start')) : left ? t('rejoin') : t('join')}
            </button>
            {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          </div>
        )}

      {lesson.status === 'processing' && card(<Clock3 className="h-6 w-6 animate-pulse" />, t('processingTitle'), t('processingBody'))}

      {lesson.status === 'failed' && card(<AlertTriangle className="h-6 w-6" />, t('failedTitle'), t('failedBody'))}

      {lesson.status === 'ready' && (
        <div className="space-y-3">
          <div className="relative w-full overflow-hidden rounded-2xl bg-black" style={{ paddingTop: '56.25%' }}>
            {replay ? (
              <iframe
                ref={iframeRef}
                src={`${replay}${resumeAt ? `?startTime=${Math.floor(resumeAt)}s` : ''}`}
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                title={lesson.title}
              />
            ) : (
              <div className="absolute inset-0 animate-pulse bg-[#0e1a18]" />
            )}
          </div>
          {resumeAt > 0 && <p className={`text-xs ${ui.muted}`}>{t('resumeFrom', { time: mmss(resumeAt) })}</p>}
        </div>
      )}
    </PageShell>
  );
}
