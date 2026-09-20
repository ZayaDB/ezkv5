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
