-- 1:1 채팅 (DM) + 멘토 상담 화상방
-- 대화방은 두 사람당 하나 (user_a < user_b 로 정렬해 저장)

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users(id) on delete cascade,
  user_b uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz,
  last_message_preview text,
  constraint conversations_pair_order check (user_a < user_b),
  constraint conversations_pair_unique unique (user_a, user_b)
);
create index if not exists idx_conversations_user_b on public.conversations (user_b);
create index if not exists idx_conversations_last on public.conversations (last_message_at desc nulls last);

create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists idx_dm_conversation_created on public.direct_messages (conversation_id, created_at desc);
create index if not exists idx_dm_sender on public.direct_messages (sender_id);

alter table public.conversations enable row level security;
alter table public.direct_messages enable row level security;

create or replace function public.is_conversation_member(p_conversation uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.conversations c
    where c.id = p_conversation and (select auth.uid()) in (c.user_a, c.user_b)
  );
$$;
revoke execute on function public.is_conversation_member(uuid) from public, anon;
grant execute on function public.is_conversation_member(uuid) to authenticated;

drop policy if exists "conversations: members read" on public.conversations;
create policy "conversations: members read" on public.conversations
  for select to authenticated using ((select auth.uid()) in (user_a, user_b));
-- 생성·수정은 아래 RPC/트리거로만

drop policy if exists "dm: members read" on public.direct_messages;
create policy "dm: members read" on public.direct_messages
  for select to authenticated using (public.is_conversation_member(conversation_id));

drop policy if exists "dm: members send" on public.direct_messages;
create policy "dm: members send" on public.direct_messages
  for insert to authenticated
  with check (sender_id = (select auth.uid()) and public.is_conversation_member(conversation_id) and read_at is null);
-- update(읽음 처리)는 RPC로만, delete 없음

-- 새 메시지가 오면 대화방 목록 정렬용 필드 갱신
create or replace function public.dm_touch_conversation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.conversations
     set last_message_at = new.created_at,
         last_message_preview = left(new.body, 140)
   where id = new.conversation_id;
  return new;
end $$;
revoke execute on function public.dm_touch_conversation() from public, anon, authenticated;

drop trigger if exists dm_touch_conversation on public.direct_messages;
create trigger dm_touch_conversation after insert on public.direct_messages
  for each row execute function public.dm_touch_conversation();

-- 대화 시작 (이미 있으면 기존 방 반환)
create or replace function public.start_conversation(p_other uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := auth.uid();
  v_a uuid; v_b uuid; v_id uuid;
begin
  if v_me is null then raise exception 'auth required' using errcode = '28000'; end if;
  if p_other is null or p_other = v_me then raise exception 'invalid recipient' using errcode = '22023'; end if;
  if not exists (select 1 from public.profiles where id = p_other) then
    raise exception 'recipient not found' using errcode = 'P0002';
  end if;
  v_a := least(v_me, p_other); v_b := greatest(v_me, p_other);
  insert into public.conversations (user_a, user_b) values (v_a, v_b)
    on conflict (user_a, user_b) do nothing;
  select id into v_id from public.conversations where user_a = v_a and user_b = v_b;
  return v_id;
end $$;
revoke execute on function public.start_conversation(uuid) from public, anon;
grant execute on function public.start_conversation(uuid) to authenticated;

-- 받은 메시지 읽음 처리
create or replace function public.mark_conversation_read(p_conversation uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_conversation_member(p_conversation) then return; end if;
  update public.direct_messages
     set read_at = now()
   where conversation_id = p_conversation and sender_id <> auth.uid() and read_at is null;
end $$;
revoke execute on function public.mark_conversation_read(uuid) from public, anon;
grant execute on function public.mark_conversation_read(uuid) to authenticated;

-- 내 대화방 목록 (상대 이름·사진, 안 읽은 수)
create or replace function public.list_my_conversations()
returns table (
  id uuid, other_id uuid, other_name text, other_avatar text, other_is_mentor boolean,
  last_message_at timestamptz, last_message_preview text, unread integer
) language sql stable security definer set search_path = public as $$
  select c.id,
         o.id,
         o.name,
         o.avatar_url,
         exists (select 1 from public.mentor_profiles mp where mp.user_id = o.id and mp.approval_status = 'approved'),
         c.last_message_at,
         c.last_message_preview,
         (select count(*)::int from public.direct_messages m
           where m.conversation_id = c.id and m.sender_id <> auth.uid() and m.read_at is null)
    from public.conversations c
    join public.profiles o on o.id = case when c.user_a = auth.uid() then c.user_b else c.user_a end
   where auth.uid() in (c.user_a, c.user_b)
   order by coalesce(c.last_message_at, c.created_at) desc
   limit 200;
$$;
revoke execute on function public.list_my_conversations() from public, anon;
grant execute on function public.list_my_conversations() to authenticated;

create or replace function public.my_unread_dm_count()
returns integer language sql stable security definer set search_path = public as $$
  select count(*)::int from public.direct_messages m
    join public.conversations c on c.id = m.conversation_id
   where auth.uid() in (c.user_a, c.user_b) and m.sender_id <> auth.uid() and m.read_at is null;
$$;
revoke execute on function public.my_unread_dm_count() from public, anon;
grant execute on function public.my_unread_dm_count() to authenticated;

-- 실시간 수신
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'direct_messages') then
    alter publication supabase_realtime add table public.direct_messages;
  end if;
end $$;

-- 상담 화상방 (RealtimeKit meeting id 는 비공개 스키마에 보관, 서버만 접근)
create table if not exists private.session_rooms (
  session_id uuid primary key references public.mentor_sessions(id) on delete cascade,
  meeting_id text not null,
  created_at timestamptz not null default now()
);

create or replace function public.session_room_get(p_secret text, p_session_id uuid)
returns text language plpgsql security definer set search_path = public, private as $$
begin
  if p_secret is distinct from (select value from private.app_config where key = 'payment_hook_secret') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return (select meeting_id from private.session_rooms where session_id = p_session_id);
end $$;

create or replace function public.session_room_set(p_secret text, p_session_id uuid, p_meeting_id text)
returns void language plpgsql security definer set search_path = public, private as $$
begin
  if p_secret is distinct from (select value from private.app_config where key = 'payment_hook_secret') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  insert into private.session_rooms (session_id, meeting_id) values (p_session_id, p_meeting_id)
    on conflict (session_id) do nothing;
end $$;
revoke all on private.session_rooms from public, anon, authenticated;
revoke all on function public.session_room_get(text, uuid) from public;
revoke all on function public.session_room_set(text, uuid, text) from public;
grant execute on function public.session_room_get(text, uuid) to anon, authenticated;
grant execute on function public.session_room_set(text, uuid, text) to anon, authenticated;
