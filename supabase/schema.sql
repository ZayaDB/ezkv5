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
