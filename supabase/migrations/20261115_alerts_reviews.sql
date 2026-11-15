-- 알림 (예약·취소·완료·리뷰·시작 30분 전) + 멘토 리뷰 + 강의 리뷰 코멘트

-- 1) 알림: 번역용 파라미터와 중복 방지 키
alter table public.user_alerts add column if not exists params jsonb;
alter table public.user_alerts add column if not exists ref_id uuid;
create unique index if not exists user_alerts_kind_ref_uniq
  on public.user_alerts (user_id, kind, ref_id) where ref_id is not null;

create or replace function private.push_alert(
  p_user uuid, p_kind text, p_severity text, p_url text, p_params jsonb, p_ref uuid
) returns void language plpgsql security definer set search_path = public as $$
begin
  if p_user is null then return; end if;
  insert into public.user_alerts (user_id, kind, severity, title, message, action_url, params, ref_id, dismissed, read)
  values (p_user, p_kind, p_severity, p_kind, null, p_url, p_params, p_ref, false, false)
  on conflict (user_id, kind, ref_id) where ref_id is not null do nothing;
end $$;
revoke all on function private.push_alert(uuid, text, text, text, jsonb, uuid) from public, anon, authenticated;

-- 2) 상담 상태가 바뀌면 양쪽에 알림
create or replace function private.notify_session_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_mentor uuid;
  v_mentor_name text;
  v_mentee_name text;
  v_at text := to_char(new.scheduled_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
begin
  if new.status is not distinct from old.status then return new; end if;
  select mp.user_id, coalesce(p.name, '') into v_mentor, v_mentor_name
    from public.mentor_profiles mp left join public.profiles p on p.id = mp.user_id
   where mp.id = new.mentor_profile_id;
  select coalesce(name, '') into v_mentee_name from public.profiles where id = new.mentee_id;

  if old.status = 'pending_payment' and new.status = 'upcoming' then
    perform private.push_alert(v_mentor, 'booking_new', 'info', '/my/mentor',
      jsonb_build_object('name', v_mentee_name, 'at', v_at), new.id);
    perform private.push_alert(new.mentee_id, 'booking_paid', 'info', '/my/schedule',
      jsonb_build_object('name', v_mentor_name, 'at', v_at), new.id);
  elsif old.status = 'upcoming' and new.status = 'cancelled' then
    perform private.push_alert(v_mentor, 'booking_cancelled', 'warning', '/my/mentor',
      jsonb_build_object('name', v_mentee_name, 'at', v_at), new.id);
    perform private.push_alert(new.mentee_id, 'booking_cancelled', 'warning', '/my/payments',
      jsonb_build_object('name', v_mentor_name, 'at', v_at), new.id);
  elsif old.status = 'upcoming' and new.status = 'completed' then
    perform private.push_alert(new.mentee_id, 'review_request', 'info', '/sessions/' || new.id,
      jsonb_build_object('name', v_mentor_name), new.id);
  end if;
  return new;
end $$;
revoke all on function private.notify_session_change() from public, anon, authenticated;

drop trigger if exists notify_session_change on public.mentor_sessions;
create trigger notify_session_change after update of status on public.mentor_sessions
  for each row execute function private.notify_session_change();

-- 3) 시작 30분 전 알림 (5분마다 실행)
create or replace function private.queue_upcoming_reminders()
returns void language plpgsql security definer set search_path = public as $$
declare r record;
begin
  for r in
    select s.id, s.mentee_id, s.scheduled_at, mp.user_id as mentor_id,
           coalesce(pm.name, '') as mentor_name, coalesce(pe.name, '') as mentee_name
      from public.mentor_sessions s
      join public.mentor_profiles mp on mp.id = s.mentor_profile_id
      left join public.profiles pm on pm.id = mp.user_id
      left join public.profiles pe on pe.id = s.mentee_id
     where s.status = 'upcoming'
       and s.scheduled_at between now() + interval '15 minutes' and now() + interval '35 minutes'
  loop
    perform private.push_alert(r.mentee_id, 'session_soon', 'warning', '/sessions/' || r.id,
      jsonb_build_object('name', r.mentor_name, 'at', to_char(r.scheduled_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')), r.id);
    perform private.push_alert(r.mentor_id, 'session_soon', 'warning', '/sessions/' || r.id,
      jsonb_build_object('name', r.mentee_name, 'at', to_char(r.scheduled_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')), r.id);
  end loop;

  for r in
    select ll.id as lesson_id, ll.title as lesson_title, ll.scheduled_at, e.user_id
      from public.lecture_lessons ll
      join public.lecture_enrollments e on e.lecture_id = ll.lecture_id
     where ll.status = 'scheduled'
       and ll.scheduled_at between now() + interval '15 minutes' and now() + interval '35 minutes'
       and e.status = 'active'
  loop
    perform private.push_alert(r.user_id, 'lesson_soon', 'warning', '/lessons/' || r.lesson_id,
      jsonb_build_object('title', coalesce(r.lesson_title, ''), 'at', to_char(r.scheduled_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')), r.lesson_id);
  end loop;
end $$;
revoke all on function private.queue_upcoming_reminders() from public, anon, authenticated;

create extension if not exists pg_cron;
select cron.schedule('lnk-upcoming-reminders', '*/5 * * * *', $$select private.queue_upcoming_reminders()$$);

-- 4) 멘토 리뷰: 완료된 상담의 멘티만, 상담당 1개
create table if not exists public.mentor_reviews (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.mentor_sessions(id) on delete cascade,
  mentor_profile_id uuid not null references public.mentor_profiles(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_mentor_reviews_mentor on public.mentor_reviews (mentor_profile_id, created_at desc);
create index if not exists idx_mentor_reviews_reviewer on public.mentor_reviews (reviewer_id);
alter table public.mentor_reviews enable row level security;
drop policy if exists "mentor_reviews: public read" on public.mentor_reviews;
create policy "mentor_reviews: public read" on public.mentor_reviews for select to anon, authenticated using (true);
-- 쓰기는 RPC로만

create or replace function public.submit_mentor_review(p_session_id uuid, p_rating integer, p_comment text default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := auth.uid();
  v_mp uuid;
  v_mentor uuid;
  v_new boolean;
begin
  if v_me is null then raise exception 'auth required' using errcode = '28000'; end if;
  if p_rating < 1 or p_rating > 5 then raise exception 'invalid rating' using errcode = '22023'; end if;
  select s.mentor_profile_id into v_mp from public.mentor_sessions s
   where s.id = p_session_id and s.mentee_id = v_me and s.status = 'completed';
  if v_mp is null then raise exception 'completed session required' using errcode = '42501'; end if;

  v_new := not exists (select 1 from public.mentor_reviews where session_id = p_session_id);
  insert into public.mentor_reviews (session_id, mentor_profile_id, reviewer_id, rating, comment)
  values (p_session_id, v_mp, v_me, p_rating, nullif(btrim(coalesce(p_comment, '')), ''))
  on conflict (session_id) do update
    set rating = excluded.rating, comment = excluded.comment, updated_at = now();

  perform set_config('app.mentor_resubmit', 'on', true);
  update public.mentor_profiles mp
     set rating = st.avg_rating, review_count = st.cnt
    from (select count(*)::int cnt, coalesce(round(avg(rating)::numeric, 2), 0) avg_rating
            from public.mentor_reviews where mentor_profile_id = v_mp) st
   where mp.id = v_mp;
  perform set_config('app.mentor_resubmit', 'off', true);

  if v_new then
    select user_id into v_mentor from public.mentor_profiles where id = v_mp;
    perform private.push_alert(v_mentor, 'review_new', 'info', '/mentors/' || v_mp,
      jsonb_build_object('rating', p_rating), p_session_id);
  end if;
end $$;
revoke execute on function public.submit_mentor_review(uuid, integer, text) from public, anon;
grant execute on function public.submit_mentor_review(uuid, integer, text) to authenticated;

-- 5) 강의 리뷰: 코멘트 추가, 공개 읽기, 리뷰 수 컬럼
alter table public.lectures add column if not exists review_count integer not null default 0;

create or replace function public.enforce_lectures_moderation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if current_setting('app.lecture_counter', true) = 'on'
     or current_setting('app.lecture_resubmit', true) = 'on' then
    return new;
  end if;
  if auth.uid() is null then
    return new;
  end if;
  if public.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.approval_status := 'pending';
    new.rating := 0;
    new.students := 0;
    new.review_count := 0;
  else
    new.approval_status := old.approval_status;
    new.rating := old.rating;
    new.students := old.students;
    new.review_count := old.review_count;
  end if;
  return new;
end;
$$;
revoke execute on function public.enforce_lectures_moderation() from public, anon, authenticated;

alter table public.lecture_reviews add column if not exists comment text
  check (comment is null or char_length(comment) <= 1000);
drop policy if exists "lecture_reviews: public read" on public.lecture_reviews;
create policy "lecture_reviews: public read" on public.lecture_reviews for select to anon, authenticated using (true);

drop function if exists public.upsert_lecture_review(uuid, integer);
create or replace function public.upsert_lecture_review(p_lecture_id uuid, p_rating integer, p_comment text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'auth required'; end if;
  if p_rating < 1 or p_rating > 5 then raise exception 'invalid rating'; end if;
  if not exists (
    select 1 from public.lecture_enrollments e
     where e.user_id = auth.uid() and e.lecture_id = p_lecture_id
       and e.payment_status in ('paid', 'free') and e.status <> 'cancelled'
  ) then
    raise exception 'enrollment required';
  end if;

  insert into public.lecture_reviews (lecture_id, user_id, rating, comment)
  values (p_lecture_id, auth.uid(), p_rating, nullif(btrim(coalesce(p_comment, '')), ''))
  on conflict (lecture_id, user_id)
  do update set rating = excluded.rating, comment = excluded.comment, updated_at = now();

  perform set_config('app.lecture_counter', 'on', true);
  update public.lectures l
     set review_count = st.cnt, rating = st.avg_rating
    from (select count(*)::int cnt, coalesce(round(avg(rating)::numeric, 2), 0) avg_rating
            from public.lecture_reviews where lecture_id = p_lecture_id) st
   where l.id = p_lecture_id;
  perform set_config('app.lecture_counter', 'off', true);
end $$;
revoke execute on function public.upsert_lecture_review(uuid, integer, text) from public, anon;
grant execute on function public.upsert_lecture_review(uuid, integer, text) to authenticated;
