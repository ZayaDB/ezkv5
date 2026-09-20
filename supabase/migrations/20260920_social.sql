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
