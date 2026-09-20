-- Run once in Supabase SQL Editor (Dashboard → SQL → New query)

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  role text not null default 'user' check (role in ('user', 'mentor', 'admin')),
  locale text not null default 'kr' check (locale in ('kr', 'en', 'mn')),
  nationality text,
  university text,
  region text,
  visa_type text,
  visa_expire_date date,
  country_status text not null default 'unknown',
  onboarding_status text not null default 'pending',
  avatar_url text,
  bio text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  progress int not null default 0,
  priority text not null default 'medium',
  status text not null default 'active',
  template_key text,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roadmap_steps (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references public.roadmaps(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  completed boolean not null default false,
  active boolean not null default false,
  sort_order int not null default 0,
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  notes text,
  category text not null default 'general',
  status text not null default 'planned',
  roadmap_id uuid references public.roadmaps(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text,
  title text not null,
  message text,
  severity text not null default 'info',
  due_date date,
  dismissed boolean not null default false,
  dismissed_at timestamptz,
  action_url text,
  created_at timestamptz not null default now()
);

-- Existing projects: run these if tables were created before the columns above existed
alter table public.calendar_events add column if not exists notes text;
alter table public.user_alerts add column if not exists kind text;
alter table public.user_alerts add column if not exists due_date date;
alter table public.user_alerts add column if not exists dismissed_at timestamptz;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.roadmaps enable row level security;
alter table public.roadmap_steps enable row level security;
alter table public.calendar_events enable row level security;
alter table public.user_alerts enable row level security;

drop policy if exists "profiles: own" on public.profiles;
create policy "profiles: own" on public.profiles for all using (auth.uid() = id);

drop policy if exists "roadmaps: own" on public.roadmaps;
create policy "roadmaps: own" on public.roadmaps for all using (auth.uid() = user_id);

drop policy if exists "steps: own" on public.roadmap_steps;
create policy "steps: own" on public.roadmap_steps for all using (auth.uid() = user_id);

drop policy if exists "events: own" on public.calendar_events;
create policy "events: own" on public.calendar_events for all using (auth.uid() = user_id);

drop policy if exists "alerts: own" on public.user_alerts;
create policy "alerts: own" on public.user_alerts for all using (auth.uid() = user_id);

-- ── Mentor & Lecture marketplace (Supabase) ──

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create table if not exists public.mentor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  title text not null,
  location text not null,
  bio text not null,
  languages text[] not null default '{}',
  specialties text[] not null default '{}',
  price numeric not null default 0,
  availability text not null default 'available' check (availability in ('available', 'limited', 'unavailable')),
  photo text,
  verified boolean not null default false,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  rating numeric not null default 0,
  review_count int not null default 0,
  years_of_experience int not null default 0,
  education text not null default '',
  career_summary text not null default '',
  session_duration int not null default 60,
  session_format text not null default 'online' check (session_format in ('online', 'offline', 'both')),
  timezone text not null default 'Asia/Seoul',
  response_time text not null default '',
  intro_video_url text not null default '',
  portfolio_links text[] not null default '{}',
  mentoring_style text not null default '',
  recommended_for text not null default '',
  not_recommended_for text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lectures (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  type text not null check (type in ('online', 'offline')),
  category text not null,
  price numeric not null default 0,
  duration text not null,
  description text not null,
  image text not null default '',
  short_description text not null default '',
  target_audience text not null default '',
  prerequisites text not null default '',
  what_you_will_learn text[] not null default '{}',
  curriculum text[] not null default '{}',
  total_lessons int not null default 0,
  total_hours numeric not null default 0,
  difficulty text not null default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced')),
  max_students int not null default 30,
  language text not null default 'ko',
  preview_video_url text not null default '',
  materials_included text[] not null default '{}',
  faq text[] not null default '{}',
  rating numeric not null default 0,
  students int not null default 0,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mentor_profiles_approval_idx on public.mentor_profiles (approval_status);
create index if not exists lectures_approval_idx on public.lectures (approval_status);
create index if not exists lectures_instructor_idx on public.lectures (instructor_id);

alter table public.mentor_profiles enable row level security;
alter table public.lectures enable row level security;

drop policy if exists "profiles: admin" on public.profiles;
create policy "profiles: admin" on public.profiles for update using (public.is_admin());

drop policy if exists "alerts: admin insert" on public.user_alerts;
create policy "alerts: admin insert" on public.user_alerts for insert with check (public.is_admin());

drop policy if exists "mentor_profiles: select approved" on public.mentor_profiles;
create policy "mentor_profiles: select approved" on public.mentor_profiles for select using (approval_status = 'approved');

drop policy if exists "mentor_profiles: select own" on public.mentor_profiles;
create policy "mentor_profiles: select own" on public.mentor_profiles for select using (auth.uid() = user_id);

drop policy if exists "mentor_profiles: insert own" on public.mentor_profiles;
create policy "mentor_profiles: insert own" on public.mentor_profiles for insert with check (auth.uid() = user_id);

drop policy if exists "mentor_profiles: update own" on public.mentor_profiles;
create policy "mentor_profiles: update own" on public.mentor_profiles for update using (auth.uid() = user_id);

drop policy if exists "mentor_profiles: admin" on public.mentor_profiles;
create policy "mentor_profiles: admin" on public.mentor_profiles for all using (public.is_admin());

drop policy if exists "lectures: select approved" on public.lectures;
create policy "lectures: select approved" on public.lectures for select using (approval_status = 'approved');

drop policy if exists "lectures: select own" on public.lectures;
create policy "lectures: select own" on public.lectures for select using (auth.uid() = instructor_id);

drop policy if exists "lectures: insert mentor" on public.lectures;
create policy "lectures: insert mentor" on public.lectures for insert with check (
  auth.uid() = instructor_id
  and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role in ('mentor', 'admin')
  )
);

drop policy if exists "lectures: update own" on public.lectures;
create policy "lectures: update own" on public.lectures for update using (auth.uid() = instructor_id);

drop policy if exists "lectures: admin" on public.lectures;
create policy "lectures: admin" on public.lectures for all using (public.is_admin());

-- ── Enrollments, wishlist, mentor sessions, life budget, inquiries ──

drop policy if exists "profiles: admin select" on public.profiles;
create policy "profiles: admin select" on public.profiles for select using (public.is_admin());

create table if not exists public.lecture_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lecture_id uuid not null references public.lectures(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  payment_status text not null default 'paid',
  enrolled_at timestamptz not null default now(),
  unique (user_id, lecture_id)
);

create table if not exists public.lecture_wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lecture_id uuid not null references public.lectures(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, lecture_id)
);

create table if not exists public.mentor_sessions (
  id uuid primary key default gen_random_uuid(),
  mentor_profile_id uuid not null references public.mentor_profiles(id) on delete cascade,
  mentee_id uuid not null references public.profiles(id) on delete cascade,
  scheduled_at timestamptz not null,
  duration int not null default 60,
  type text not null default 'online' check (type in ('online', 'offline')),
  status text not null default 'upcoming' check (status in ('upcoming', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.life_budget_lines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('expense', 'income')),
  label text not null,
  amount numeric not null default 0,
  line_date date not null,
  recurrence jsonb not null default '{"type":"none"}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  body text not null,
  admin_reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lecture_enrollments_user_idx on public.lecture_enrollments (user_id);
create index if not exists lecture_wishlist_user_idx on public.lecture_wishlist (user_id);
create index if not exists mentor_sessions_mentee_idx on public.mentor_sessions (mentee_id);
create index if not exists mentor_sessions_mentor_idx on public.mentor_sessions (mentor_profile_id);

alter table public.lecture_enrollments enable row level security;
alter table public.lecture_wishlist enable row level security;
alter table public.mentor_sessions enable row level security;
alter table public.life_budget_lines enable row level security;
alter table public.user_inquiries enable row level security;

drop policy if exists "enrollments: own" on public.lecture_enrollments;
create policy "enrollments: own" on public.lecture_enrollments for all using (auth.uid() = user_id);

drop policy if exists "wishlist: own" on public.lecture_wishlist;
create policy "wishlist: own" on public.lecture_wishlist for all using (auth.uid() = user_id);

drop policy if exists "sessions: mentee" on public.mentor_sessions;
create policy "sessions: mentee" on public.mentor_sessions for select using (auth.uid() = mentee_id);

drop policy if exists "sessions: mentor" on public.mentor_sessions;
create policy "sessions: mentor" on public.mentor_sessions for select using (
  exists (
    select 1 from public.mentor_profiles mp
    where mp.id = mentor_profile_id and mp.user_id = auth.uid()
  )
);

drop policy if exists "sessions: mentee insert" on public.mentor_sessions;
create policy "sessions: mentee insert" on public.mentor_sessions for insert with check (
  auth.uid() = mentee_id
  and exists (
    select 1 from public.mentor_profiles mp
    where mp.id = mentor_profile_id
      and mp.approval_status = 'approved'
      and mp.user_id is distinct from auth.uid()
  )
);

drop policy if exists "sessions: participant update" on public.mentor_sessions;
create policy "sessions: participant update" on public.mentor_sessions for update using (
  auth.uid() = mentee_id
  or exists (
    select 1 from public.mentor_profiles mp
    where mp.id = mentor_profile_id and mp.user_id = auth.uid()
  )
);

drop policy if exists "life_budget: own" on public.life_budget_lines;
create policy "life_budget: own" on public.life_budget_lines for all using (auth.uid() = user_id);

drop policy if exists "inquiries: own" on public.user_inquiries;
create policy "inquiries: own" on public.user_inquiries for all using (auth.uid() = user_id);

drop policy if exists "inquiries: admin" on public.user_inquiries;
create policy "inquiries: admin" on public.user_inquiries for all using (public.is_admin());

drop policy if exists "enrollments: admin" on public.lecture_enrollments;
create policy "enrollments: admin" on public.lecture_enrollments for select using (public.is_admin());

drop policy if exists "sessions: admin" on public.mentor_sessions;
create policy "sessions: admin" on public.mentor_sessions for select using (public.is_admin());

-- ── Security: role·승인·통계 필드 클라이언트 조작 방지 ──

create or replace function public.enforce_profiles_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if new.role is distinct from old.role then
    if not public.is_admin() then
      raise exception 'profiles.role cannot be changed directly';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_profiles_role_change on public.profiles;
create trigger enforce_profiles_role_change
  before update on public.profiles
  for each row execute function public.enforce_profiles_role_change();

create or replace function public.enforce_mentor_profiles_moderation()
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
    new.approval_status := 'pending';
    new.verified := false;
    new.rating := 0;
    new.review_count := 0;
  else
    new.approval_status := old.approval_status;
    new.verified := old.verified;
    new.rating := old.rating;
    new.review_count := old.review_count;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_mentor_profiles_moderation on public.mentor_profiles;
create trigger enforce_mentor_profiles_moderation
  before insert or update on public.mentor_profiles
  for each row execute function public.enforce_mentor_profiles_moderation();

create or replace function public.enforce_lectures_moderation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('app.lecture_counter', true) = 'on' then
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
  else
    new.approval_status := old.approval_status;
    new.rating := old.rating;
    new.students := old.students;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_lectures_moderation on public.lectures;
create trigger enforce_lectures_moderation
  before insert or update on public.lectures
  for each row execute function public.enforce_lectures_moderation();
-- Community, freelancer, feeds, study info (Mongo replacement)

create table if not exists public.community_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  members int not null default 0,
  category text not null,
  image text not null default '',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  group_id uuid not null references public.community_groups(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, group_id)
);

create table if not exists public.freelancer_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  members int not null default 0,
  category text not null,
  image text not null default '',
  jobs_posted int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.freelancer_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  group_id uuid not null references public.freelancer_groups(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, group_id)
);

create table if not exists public.public_feed_posts (
  id uuid primary key default gen_random_uuid(),
  feed_type text not null check (feed_type in ('community', 'freelancer')),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  attachment_urls text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.public_feed_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.public_feed_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.public_feed_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.public_feed_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table if not exists public.channel_posts (
  id uuid primary key default gen_random_uuid(),
  channel_type text not null check (channel_type in ('community', 'freelancer')),
  channel_id uuid not null,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.channel_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.channel_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.study_infos (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('visa', 'housing', 'hospital', 'lifeTips')),
  title text not null,
  content text not null,
  image text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists community_groups_category_idx on public.community_groups (category);
create index if not exists public_feed_posts_feed_created_idx on public.public_feed_posts (feed_type, created_at desc);
create index if not exists channel_posts_channel_idx on public.channel_posts (channel_type, channel_id, created_at desc);
create index if not exists community_memberships_status_idx on public.community_memberships (status);
create index if not exists freelancer_applications_status_idx on public.freelancer_applications (status);

alter table public.community_groups enable row level security;
alter table public.community_memberships enable row level security;
alter table public.freelancer_groups enable row level security;
alter table public.freelancer_applications enable row level security;
alter table public.public_feed_posts enable row level security;
alter table public.public_feed_comments enable row level security;
alter table public.public_feed_likes enable row level security;
alter table public.channel_posts enable row level security;
alter table public.channel_comments enable row level security;
alter table public.study_infos enable row level security;

drop policy if exists "community_groups: public read" on public.community_groups;
create policy "community_groups: public read" on public.community_groups for select using (true);

drop policy if exists "freelancer_groups: public read" on public.freelancer_groups;
create policy "freelancer_groups: public read" on public.freelancer_groups for select using (true);

drop policy if exists "study_infos: public read" on public.study_infos;
create policy "study_infos: public read" on public.study_infos for select using (true);

drop policy if exists "community_memberships: own" on public.community_memberships;
create policy "community_memberships: own" on public.community_memberships for all using (auth.uid() = user_id);

drop policy if exists "community_memberships: admin" on public.community_memberships;
create policy "community_memberships: admin" on public.community_memberships for all using (public.is_admin());

drop policy if exists "freelancer_applications: own" on public.freelancer_applications;
create policy "freelancer_applications: own" on public.freelancer_applications for all using (auth.uid() = user_id);

drop policy if exists "freelancer_applications: admin" on public.freelancer_applications;
create policy "freelancer_applications: admin" on public.freelancer_applications for all using (public.is_admin());

drop policy if exists "public_feed_posts: read" on public.public_feed_posts;
create policy "public_feed_posts: read" on public.public_feed_posts for select using (true);

drop policy if exists "public_feed_posts: insert own" on public.public_feed_posts;
create policy "public_feed_posts: insert own" on public.public_feed_posts for insert with check (auth.uid() = author_id);

drop policy if exists "public_feed_comments: read" on public.public_feed_comments;
create policy "public_feed_comments: read" on public.public_feed_comments for select using (true);

drop policy if exists "public_feed_comments: insert own" on public.public_feed_comments;
create policy "public_feed_comments: insert own" on public.public_feed_comments for insert with check (auth.uid() = author_id);

drop policy if exists "public_feed_likes: read" on public.public_feed_likes;
create policy "public_feed_likes: read" on public.public_feed_likes for select using (true);

drop policy if exists "public_feed_likes: own write" on public.public_feed_likes;
create policy "public_feed_likes: own write" on public.public_feed_likes for all using (auth.uid() = user_id);

drop policy if exists "channel_posts: read" on public.channel_posts;
create policy "channel_posts: read" on public.channel_posts for select using (true);

drop policy if exists "channel_posts: insert own" on public.channel_posts;
create policy "channel_posts: insert own" on public.channel_posts for insert with check (auth.uid() = author_id);

drop policy if exists "channel_posts: admin" on public.channel_posts;
create policy "channel_posts: admin" on public.channel_posts for all using (public.is_admin());

drop policy if exists "channel_comments: read" on public.channel_comments;
create policy "channel_comments: read" on public.channel_comments for select using (true);

drop policy if exists "channel_comments: insert own" on public.channel_comments;
create policy "channel_comments: insert own" on public.channel_comments for insert with check (auth.uid() = author_id);

drop policy if exists "community_groups: admin write" on public.community_groups;
create policy "community_groups: admin write" on public.community_groups for all using (public.is_admin());

drop policy if exists "freelancer_groups: admin write" on public.freelancer_groups;
create policy "freelancer_groups: admin write" on public.freelancer_groups for all using (public.is_admin());

drop policy if exists "study_infos: admin write" on public.study_infos;
create policy "study_infos: admin write" on public.study_infos for all using (public.is_admin());

create or replace function public.get_public_profiles(ids uuid[])
returns table(id uuid, name text, avatar_url text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.name, p.avatar_url
  from public.profiles p
  where p.id = any(ids)
  limit 200;
$$;

revoke all on function public.get_public_profiles(uuid[]) from public;
grant execute on function public.get_public_profiles(uuid[]) to anon, authenticated;

-- ── Sensitive field locks (status / payment / admin_reply) ──
-- (auth.uid() is null 이면 통과 / public.is_admin() 이면 통과 / 그 외 필드 강제)

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

create or replace function public.sync_lecture_students()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lecture_id uuid;
  v_delta int := 0;
begin
  perform set_config('app.lecture_counter', 'on', true);

  if tg_op = 'INSERT' then
    if new.status <> 'cancelled' then
      v_delta := 1;
    end if;
    v_lecture_id := new.lecture_id;
  elsif tg_op = 'UPDATE' then
    if old.status = 'cancelled' and new.status <> 'cancelled' then
      v_delta := 1;
    elsif old.status <> 'cancelled' and new.status = 'cancelled' then
      v_delta := -1;
    end if;
    v_lecture_id := new.lecture_id;
  elsif tg_op = 'DELETE' then
    if old.status <> 'cancelled' then
      v_delta := -1;
    end if;
    v_lecture_id := old.lecture_id;
  end if;

  if v_delta <> 0 then
    begin
      update public.lectures
      set students = greatest(students + v_delta, 0)
      where id = v_lecture_id;
    exception
      when triggered_data_change_violation then
        null;
    end;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_lecture_students on public.lecture_enrollments;
create trigger sync_lecture_students
  after insert or update or delete on public.lecture_enrollments
  for each row execute function public.sync_lecture_students();

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

-- Public image uploads (lectures, feed attachments)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  true,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "uploads: public select" on storage.objects;
create policy "uploads: public select"
on storage.objects
for select
using (bucket_id = 'uploads');

drop policy if exists "uploads: authenticated insert" on storage.objects;
create policy "uploads: authenticated insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "uploads: authenticated delete" on storage.objects;
create policy "uploads: authenticated delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- AI 채팅 일일 한도: 로그인 사용자당 하루 30회 (KST 기준, 원자적 차감)

create table if not exists public.chat_usage (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  count int not null default 0,
  primary key (user_id, day)
);

alter table public.chat_usage enable row level security;

drop policy if exists "chat_usage: own select" on public.chat_usage;
create policy "chat_usage: own select" on public.chat_usage
  for select using (auth.uid() = user_id);

create or replace function public.consume_chat_quota(p_limit int default 30)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_day date := (now() at time zone 'Asia/Seoul')::date;
  v_count int;
begin
  if v_uid is null then
    return false;
  end if;

  insert into public.chat_usage (user_id, day, count)
  values (v_uid, v_day, 1)
  on conflict (user_id, day)
  do update set count = chat_usage.count + 1
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.consume_chat_quota(int) from public;
grant execute on function public.consume_chat_quota(int) to authenticated;


