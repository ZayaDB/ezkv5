'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Eye, EyeOff, Plus, Radio, RotateCcw, Trash2, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  createLesson,
  deleteLesson,
  listLessons,
  setLessonCancelled,
  setLessonPreview,
  type Lesson,
} from '@/lib/live/client';
import { LessonStatusPill, kstLabel } from '@/components/live/lessonUi';
import { Notice, PageShell, ui } from '@/components/lnk/ui';

const EARLY_MIN = 30;

function kstToday() {
  return new Date(Date.now() + 9 * 3_600_000).toISOString().slice(0, 10);
}

export default function LessonManagerPage() {
  const params = useParams();
  const lectureId = params.id as string;
  const t = useTranslations('live');
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [lecture, setLecture] = useState<{ id: string; title: string; instructor_id: string } | null | undefined>(undefined);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(kstToday());
  const [time, setTime] = useState('19:00');
  const [duration, setDuration] = useState(60);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [startingId, setStartingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await createClient().from('lectures').select('id, title, instructor_id').eq('id', lectureId).maybeSingle();
    setLecture((data as typeof lecture) ?? null);
    setLessons(await listLessons(lectureId));
  }, [lectureId]);

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);

  const isOwner = Boolean(user && lecture && lecture.instructor_id === user.id) || user?.role === 'admin';
  const nextPosition = useMemo(() => (lessons.length ? Math.max(...lessons.map((l) => l.position)) + 1 : 1), [lessons]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const at = new Date(`${date}T${time}:00+09:00`);
    if (Number.isNaN(at.getTime()) || at.getTime() < Date.now()) return setError(t('pastTime'));
    if (!title.trim()) return setError(t('addError'));
    setBusy(true);
    try {
      await createLesson({ lectureId, title, description, scheduledAt: at, durationMin: duration, position: nextPosition });
      setTitle('');
      setDescription('');
      await load();
    } catch {
      setError(t('addError'));
    } finally {
      setBusy(false);
    }
  };

  const start = async (lesson: Lesson) => {
    setStartingId(lesson.id);
    // The lesson page performs the start call and shows the room.
    router.push(`/${locale}/lessons/${lesson.id}?host=1`);
  };

  const act = async (fn: () => Promise<void>) => {
    try {
      await fn();
    } finally {
      await load();
    }
  };

  if (lecture === undefined || authLoading) {
    return (
      <PageShell>
        <div className="h-64 animate-pulse rounded-2xl bg-hairline/50 dark:bg-night-card" />
      </PageShell>
    );
  }

  if (!lecture || !isOwner) {
    return (
      <PageShell>
        <Notice tone="caution" title={t('notOwner')} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <nav className="mb-6 flex items-center gap-2 text-sm text-ink-muted dark:text-snow-muted">
        <Link href={`/${locale}/lectures/${lecture.id}`} className="hover:text-teal dark:hover:text-teal-dark">{t('backToCourse')}</Link>
        <span>/</span>
        <span className="text-ink dark:text-snow">{t('managerEyebrow')}</span>
      </nav>

      <header className="mb-8 space-y-3">
        <p className={ui.eyebrow}>{t('managerEyebrow')}</p>
        <h1 className={ui.h1}>{t('managerTitle', { title: lecture.title })}</h1>
        <p className={`${ui.lead} max-w-3xl`}>{t('managerLead')}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Lessons */}
        <section className="space-y-3">
          {lessons.length === 0 ? (
            <p className={`${ui.card} p-6 text-sm ${ui.muted}`}>{t('empty')}</p>
          ) : (
            lessons.map((l) => {
              const opensAt = l.scheduled_at ? new Date(l.scheduled_at).getTime() - EARLY_MIN * 60_000 : 0;
              const canStart = l.status === 'live' || (l.status === 'scheduled' && Date.now() >= opensAt);
              return (
                <article key={l.id} className={`${ui.card} space-y-4 p-5`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <LessonStatusPill status={l.status} />
                        {l.is_preview && <span className="rounded-full border border-teal/40 px-2 py-0.5 text-[11px] font-semibold text-teal dark:text-teal-dark">{t('preview')}</span>}
                      </div>
                      <h2 className="text-lg font-semibold text-ink dark:text-snow">{l.title}</h2>
                      <p className={`text-sm ${ui.muted}`}>
                        {l.scheduled_at ? kstLabel(l.scheduled_at, locale) : ''} · {t('minutes', { n: l.duration_min })}
                      </p>
                      {l.description && <p className={`text-sm ${ui.muted}`}>{l.description}</p>}
                    </div>
                    {(l.status === 'scheduled' || l.status === 'live') && (
                      <div className="flex flex-col items-end gap-1">
                        <button
                          type="button"
                          disabled={!canStart || startingId === l.id}
                          onClick={() => start(l)}
                          className={`${ui.btnPrimary} h-10 ${l.status === 'live' ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:text-white' : ''}`}
                        >
                          <Radio className="h-4 w-4" />
                          {l.status === 'live' ? t('reenter') : t('start')}
                        </button>
                        {!canStart && l.scheduled_at && (
                          <span className={`text-[11px] ${ui.muted}`}>{t('opensSoon', { time: kstLabel(new Date(opensAt).toISOString(), locale) })}</span>
                        )}
                      </div>
                    )}
                    {(l.status === 'ready' || l.status === 'processing') && (
                      <Link href={`/${locale}/lessons/${l.id}`} className={`${ui.btnOutline} h-10`}>{t('watch')}</Link>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 border-t border-hairline pt-3 text-sm dark:border-hairline-dark">
                    {l.status === 'scheduled' && (
                      <button type="button" onClick={() => act(() => setLessonCancelled(l.id, true))} className="inline-flex items-center gap-1.5 font-medium text-ink-muted hover:text-red-600 dark:text-snow-muted">
                        <XCircle className="h-4 w-4" /> {t('cancel')}
                      </button>
                    )}
                    {l.status === 'cancelled' && (
                      <button type="button" onClick={() => act(() => setLessonCancelled(l.id, false))} className="inline-flex items-center gap-1.5 font-medium text-ink-muted hover:text-teal dark:text-snow-muted">
                        <RotateCcw className="h-4 w-4" /> {t('restore')}
                      </button>
                    )}
                    {l.status === 'ready' && (
                      <button type="button" onClick={() => act(() => setLessonPreview(l.id, !l.is_preview))} className="inline-flex items-center gap-1.5 font-medium text-ink-muted hover:text-teal dark:text-snow-muted">
                        {l.is_preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {l.is_preview ? t('unmarkPreview') : t('markPreview')}
                      </button>
                    )}
                    {l.status !== 'live' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(t('deleteConfirm'))) void act(() => deleteLesson(l.id));
                        }}
                        className="inline-flex items-center gap-1.5 font-medium text-ink-muted hover:text-red-600 dark:text-snow-muted"
                      >
                        <Trash2 className="h-4 w-4" /> {t('delete')}
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </section>

        {/* Add form */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <form onSubmit={add} className={`${ui.card} space-y-4 p-6`}>
            <h2 className="flex items-center gap-2 text-base font-semibold text-ink dark:text-snow">
              <Plus className="h-4 w-4 text-teal dark:text-teal-dark" /> {t('addTitle')}
            </h2>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-ink dark:text-snow">{t('fieldTitle')}</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required placeholder={t('fieldTitlePh')} className={ui.input} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-ink dark:text-snow">{t('fieldDesc')}</span>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={1000} className={`${ui.input} h-auto py-2`} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink dark:text-snow">{t('fieldDate')}</span>
                <input type="date" value={date} min={kstToday()} onChange={(e) => setDate(e.target.value)} required className={ui.input} />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink dark:text-snow">{t('fieldTime')}</span>
                <input type="time" value={time} step={900} onChange={(e) => setTime(e.target.value)} required className={ui.input} />
              </label>
            </div>
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-ink dark:text-snow">{t('fieldDuration')}</span>
              <div className="flex flex-wrap gap-2">
                {[30, 60, 90, 120].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDuration(m)}
                    aria-pressed={duration === m}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                      duration === m
                        ? 'border-teal bg-teal text-white dark:border-teal-dark dark:bg-teal-dark dark:text-night'
                        : 'border-hairline text-ink hover:border-teal dark:border-hairline-dark dark:text-snow'
                    }`}
                  >
                    {t('minutes', { n: m })}
                  </button>
                ))}
              </div>
            </div>
            {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <button type="submit" disabled={busy} className={`${ui.btnPrimary} w-full`}>
              {busy ? t('adding') : t('addButton')}
            </button>
            <p className={`text-xs ${ui.muted}`}>{t('recordingNote')}</p>
          </form>
        </aside>
      </div>
    </PageShell>
  );
}
