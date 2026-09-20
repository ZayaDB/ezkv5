-- 공개 화면용: name·avatar_url만 노출 (RLS 우회는 security definer + 최소 컬럼)

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
