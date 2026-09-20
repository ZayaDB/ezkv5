-- RLS 보완: 클라이언트가 role·승인·통계 필드를 직접 바꾸지 못하도록 트리거로 강제

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
