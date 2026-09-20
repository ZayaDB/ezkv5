-- 민감 필드 잠금: 클라이언트가 status/payment/admin_reply 등을 직접 바꾸지 못하도록 트리거·RLS로 강제
-- (auth.uid() is null 이면 통과 / public.is_admin() 이면 통과 / 그 외 필드 강제)

-- ── community_memberships, freelancer_applications ──

create or replace function public.enforce_join_request_moderation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if public.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.status := 'pending';
  else
    new.status := old.status;
    new.user_id := old.user_id;
    new.group_id := old.group_id;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_join_request_moderation on public.community_memberships;
create trigger enforce_join_request_moderation
  before insert or update on public.community_memberships
  for each row execute function public.enforce_join_request_moderation();

drop trigger if exists enforce_join_request_moderation on public.freelancer_applications;
create trigger enforce_join_request_moderation
  before insert or update on public.freelancer_applications
  for each row execute function public.enforce_join_request_moderation();

-- ── channel_posts, channel_comments: 멤버만 insert ──

create or replace function public.is_channel_member(p_channel_type text, p_channel_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case p_channel_type
    when 'community' then exists (
      select 1 from public.community_memberships m
      where m.user_id = auth.uid()
        and m.group_id = p_channel_id
        and m.status = 'approved'
    )
    when 'freelancer' then exists (
      select 1 from public.freelancer_applications a
      where a.user_id = auth.uid()
        and a.group_id = p_channel_id
        and a.status = 'accepted'
    )
    else false
  end;
$$;

revoke all on function public.is_channel_member(text, uuid) from public;
grant execute on function public.is_channel_member(text, uuid) to authenticated;

drop policy if exists "channel_posts: insert own" on public.channel_posts;
create policy "channel_posts: insert own" on public.channel_posts
for insert with check (
  auth.uid() = author_id
  and public.is_channel_member(channel_type, channel_id)
);

drop policy if exists "channel_comments: insert own" on public.channel_comments;
create policy "channel_comments: insert own" on public.channel_comments
for insert with check (
  auth.uid() = author_id
  and exists (
    select 1 from public.channel_posts p
    where p.id = post_id
      and public.is_channel_member(p.channel_type, p.channel_id)
  )
);

-- ── lecture_enrollments ──
-- TODO: 실제 결제 연동 시 이 mock을 서비스 롤 웹훅 기반으로 교체

create or replace function public.enforce_lecture_enrollments_payment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if public.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.payment_status := 'paid';
  else
    new.payment_status := old.payment_status;
    new.user_id := old.user_id;
    new.lecture_id := old.lecture_id;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_lecture_enrollments_payment on public.lecture_enrollments;
create trigger enforce_lecture_enrollments_payment
  before insert or update on public.lecture_enrollments
  for each row execute function public.enforce_lecture_enrollments_payment();

-- ── user_inquiries ──

create or replace function public.enforce_user_inquiries_admin_reply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if public.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.admin_reply := null;
  else
    new.admin_reply := old.admin_reply;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_user_inquiries_admin_reply on public.user_inquiries;
create trigger enforce_user_inquiries_admin_reply
  before insert or update on public.user_inquiries
  for each row execute function public.enforce_user_inquiries_admin_reply();

-- ── mentor_sessions ──

drop policy if exists "sessions: mentee insert" on public.mentor_sessions;
create policy "sessions: mentee insert" on public.mentor_sessions
for insert with check (
  auth.uid() = mentee_id
  and exists (
    select 1 from public.mentor_profiles mp
    where mp.id = mentor_profile_id
      and mp.approval_status = 'approved'
      and mp.user_id is distinct from auth.uid()
  )
);

create or replace function public.enforce_mentor_sessions_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if public.is_admin() then
    return new;
  end if;
  new.mentor_profile_id := old.mentor_profile_id;
  new.mentee_id := old.mentee_id;
  new.scheduled_at := old.scheduled_at;
  new.duration := old.duration;
  new.type := old.type;
  new.notes := old.notes;
  return new;
end;
$$;

drop trigger if exists enforce_mentor_sessions_update on public.mentor_sessions;
create trigger enforce_mentor_sessions_update
  before update on public.mentor_sessions
  for each row execute function public.enforce_mentor_sessions_update();
