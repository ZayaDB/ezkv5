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
