-- Live classes & lessons (Cloudflare RealtimeKit + Stream).
-- Lesson metadata is public for approved lectures; meeting/recording identifiers live in a
-- private table that only server routes can touch through secret-guarded functions.

create table if not exists public.lecture_lessons (
  id uuid primary key default gen_random_uuid(),
  lecture_id uuid not null references public.lectures(id) on delete cascade,
  position integer not null default 0,
  title text not null check (char_length(title) between 1 and 200),
  description text,
  kind text not null default 'live' check (kind in ('live', 'video')),
  scheduled_at timestamptz,
  duration_min integer not null default 60 check (duration_min between 10 and 360),
  status text not null default 'scheduled'
    check (status in ('scheduled', 'live', 'processing', 'ready', 'failed', 'cancelled')),
  is_preview boolean not null default false,
  replay_seconds integer,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists lecture_lessons_lecture_idx on public.lecture_lessons(lecture_id, position);
create index if not exists lecture_lessons_schedule_idx on public.lecture_lessons(scheduled_at) where status = 'scheduled';

alter table public.lecture_lessons enable row level security;

drop policy if exists "lessons: read approved" on public.lecture_lessons;
create policy "lessons: read approved" on public.lecture_lessons
  for select using (exists (
    select 1 from public.lectures l where l.id = lecture_lessons.lecture_id and l.approval_status = 'approved'
  ));

drop policy if exists "lessons: instructor all" on public.lecture_lessons;
create policy "lessons: instructor all" on public.lecture_lessons
  for all using (exists (
    select 1 from public.lectures l where l.id = lecture_lessons.lecture_id and l.instructor_id = auth.uid()
  )) with check (exists (
    select 1 from public.lectures l where l.id = lecture_lessons.lecture_id and l.instructor_id = auth.uid()
  ));

drop policy if exists "lessons: admin all" on public.lecture_lessons;
create policy "lessons: admin all" on public.lecture_lessons
  for all using (public.is_admin()) with check (public.is_admin());

-- Instructors edit title/schedule/order; the live/recording lifecycle is server-controlled.
create or replace function public.enforce_lecture_lessons_write()
returns trigger
language plpgsql
security invoker
set search_path to 'public'
as $$
begin
  if current_user not in ('authenticated', 'anon') or public.is_admin() then
    if tg_op = 'UPDATE' then new.updated_at := now(); end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'scheduled';
    new.replay_seconds := null;
    new.started_at := null;
    new.ended_at := null;
    return new;
  end if;

  -- UPDATE by the instructor
  new.lecture_id := old.lecture_id;
  new.replay_seconds := old.replay_seconds;
  new.started_at := old.started_at;
  new.ended_at := old.ended_at;
  new.updated_at := now();
  if new.status is distinct from old.status then
    -- only a not-yet-started lesson can be cancelled (or restored) by the instructor
    if not (old.status in ('scheduled', 'cancelled') and new.status in ('scheduled', 'cancelled')) then
      new.status := old.status;
    end if;
  end if;
  -- the schedule can't move once the class has started
  if old.status not in ('scheduled', 'cancelled') then
    new.scheduled_at := old.scheduled_at;
    new.kind := old.kind;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_lecture_lessons_write on public.lecture_lessons;
create trigger enforce_lecture_lessons_write
  before insert or update on public.lecture_lessons
  for each row execute function public.enforce_lecture_lessons_write();

-- Private media identifiers (RealtimeKit meeting / recording, Stream video)
create table if not exists private.lesson_media (
  lesson_id uuid primary key references public.lecture_lessons(id) on delete cascade,
  meeting_id text unique,
  recording_id text,
  recording_status text,
  stream_uid text,
  updated_at timestamptz not null default now()
);
revoke all on private.lesson_media from public, anon, authenticated;

-- Watch progress
create table if not exists public.lesson_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lecture_lessons(id) on delete cascade,
  position_seconds integer not null default 0 check (position_seconds >= 0),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
alter table public.lesson_progress enable row level security;

drop policy if exists "progress: own" on public.lesson_progress;
create policy "progress: own" on public.lesson_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "progress: instructor read" on public.lesson_progress;
create policy "progress: instructor read" on public.lesson_progress
  for select using (exists (
    select 1 from public.lecture_lessons ls join public.lectures l on l.id = ls.lecture_id
     where ls.id = lesson_progress.lesson_id and l.instructor_id = auth.uid()
  ));

-- Server-only helpers --------------------------------------------------------

create or replace function public.lesson_media_get(p_secret text, p_lesson_id uuid default null, p_meeting_id text default null)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare r private.lesson_media%rowtype;
begin
  if p_secret is null or p_secret <> (select value from private.app_config where key = 'payment_hook_secret') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_lesson_id is not null then
    select * into r from private.lesson_media where lesson_id = p_lesson_id;
  else
    select * into r from private.lesson_media where meeting_id = p_meeting_id;
  end if;
  if not found then return null; end if;
  return to_jsonb(r);
end;
$$;

-- p_media:  {meeting_id, recording_id, recording_status, stream_uid}  (only keys present are written)
-- p_lesson: {status, started_at, ended_at, replay_seconds}
create or replace function public.lesson_media_update(p_secret text, p_lesson_id uuid, p_media jsonb default '{}'::jsonb, p_lesson jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if p_secret is null or p_secret <> (select value from private.app_config where key = 'payment_hook_secret') then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  insert into private.lesson_media (lesson_id) values (p_lesson_id) on conflict (lesson_id) do nothing;
  update private.lesson_media set
    meeting_id       = case when p_media ? 'meeting_id' then p_media->>'meeting_id' else meeting_id end,
    recording_id     = case when p_media ? 'recording_id' then p_media->>'recording_id' else recording_id end,
    recording_status = case when p_media ? 'recording_status' then p_media->>'recording_status' else recording_status end,
    stream_uid       = case when p_media ? 'stream_uid' then p_media->>'stream_uid' else stream_uid end,
    updated_at = now()
  where lesson_id = p_lesson_id;

  if p_lesson <> '{}'::jsonb then
    update public.lecture_lessons set
      status         = coalesce(p_lesson->>'status', status),
      started_at     = case when p_lesson ? 'started_at' then (p_lesson->>'started_at')::timestamptz else started_at end,
      ended_at       = case when p_lesson ? 'ended_at' then (p_lesson->>'ended_at')::timestamptz else ended_at end,
      replay_seconds = case when p_lesson ? 'replay_seconds' then (p_lesson->>'replay_seconds')::integer else replay_seconds end,
      updated_at = now()
    where id = p_lesson_id;
  end if;
end;
$$;

revoke all on function public.lesson_media_get(text, uuid, text) from public;
revoke all on function public.lesson_media_update(text, uuid, jsonb, jsonb) from public;
grant execute on function public.lesson_media_get(text, uuid, text) to anon, authenticated;
grant execute on function public.lesson_media_update(text, uuid, jsonb, jsonb) to anon, authenticated;
