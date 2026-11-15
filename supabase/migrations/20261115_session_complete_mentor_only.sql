-- 상담 '완료' 처리는 멘토만, 상담 시작 시각 이후에만
create or replace function public.enforce_mentor_sessions_update()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  -- Changes made inside SECURITY DEFINER functions (payments, booking) run as the
  -- function owner; only direct API writes run as anon/authenticated.
  if current_user not in ('authenticated', 'anon') then
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

  if new.status is distinct from old.status then
    if not (
      (new.status = 'cancelled' and old.status in ('pending_payment','upcoming'))
      or (new.status = 'completed' and old.status = 'upcoming')
    ) then
      raise exception 'invalid session status change' using errcode = '42501';
    end if;
    if new.status = 'cancelled' and exists (
      select 1 from public.payments p where p.session_id = old.id and p.status = 'paid'
    ) then
      raise exception 'paid session must be cancelled through refund' using errcode = '42501';
    end if;
    if new.status = 'completed' then
      if not exists (
        select 1 from public.mentor_profiles mp
         where mp.id = old.mentor_profile_id and mp.user_id = (select auth.uid())
      ) then
        raise exception 'only the mentor can complete a session' using errcode = '42501';
      end if;
      if now() < old.scheduled_at then
        raise exception 'session has not started yet' using errcode = '42501';
      end if;
    end if;
  end if;
  return new;
end;
$$;
