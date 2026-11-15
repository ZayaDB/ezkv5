-- Payments for mentor sessions (PortOne V2).
-- Clients never write payments or session status directly:
--   * create_session_checkout()  — authenticated user, computes the price server-side
--   * payment_mark_paid() / payment_mark_cancelled() — only callable with the server secret

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.app_config (
  key text primary key,
  value text not null
);
revoke all on private.app_config from public, anon, authenticated;

insert into private.app_config (key, value)
values ('payment_hook_secret', encode(extensions.gen_random_bytes(32), 'hex'))
on conflict (key) do nothing;

-- 1) Session status gains 'pending_payment'
alter table public.mentor_sessions drop constraint if exists mentor_sessions_status_check;
alter table public.mentor_sessions
  add constraint mentor_sessions_status_check
  check (status = any (array['pending_payment','upcoming','completed','cancelled']));

-- 2) Payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  payment_id text not null unique,               -- id sent to PortOne
  user_id uuid not null references public.profiles(id) on delete cascade,
  mentor_profile_id uuid not null references public.mentor_profiles(id) on delete cascade,
  session_id uuid references public.mentor_sessions(id) on delete set null,
  order_name text not null,
  amount integer not null check (amount > 0),
  currency text not null default 'KRW',
  status text not null default 'pending'
    check (status in ('pending','paid','failed','cancelled')),
  method text,
  pg_provider text,
  pg_tx_id text,
  paid_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,
  refunded_amount integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists payments_user_idx on public.payments(user_id, created_at desc);
create index if not exists payments_mentor_idx on public.payments(mentor_profile_id, created_at desc);
create index if not exists payments_session_idx on public.payments(session_id);

alter table public.payments enable row level security;

drop policy if exists "payments: buyer read" on public.payments;
create policy "payments: buyer read" on public.payments
  for select using (auth.uid() = user_id);

drop policy if exists "payments: mentor read" on public.payments;
create policy "payments: mentor read" on public.payments
  for select using (exists (
    select 1 from public.mentor_profiles mp
    where mp.id = payments.mentor_profile_id and mp.user_id = auth.uid()
  ));

drop policy if exists "payments: admin read" on public.payments;
create policy "payments: admin read" on public.payments
  for select using (public.is_admin());
-- no insert/update/delete policies: writes only through the functions below

-- 3) Lock down session writes
-- Direct inserts let a mentee create a confirmed session without paying.
drop policy if exists "sessions: mentee insert" on public.mentor_sessions;

create or replace function public.enforce_mentor_sessions_update()
returns trigger
language plpgsql
security invoker
set search_path to 'public'
as $$
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
    -- participants may only cancel, or mark an upcoming session completed;
    -- payment confirmation (pending_payment -> upcoming) happens server-side.
    if not (
      (new.status = 'cancelled' and old.status in ('pending_payment','upcoming'))
      or (new.status = 'completed' and old.status = 'upcoming')
    ) then
      raise exception 'invalid session status change' using errcode = '42501';
    end if;
    -- a paid session is cancelled through the refund flow
    if new.status = 'cancelled' and exists (
      select 1 from public.payments p where p.session_id = old.id and p.status = 'paid'
    ) then
      raise exception 'paid session must be cancelled through refund' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

-- 4) Create a booking (+ payment when the mentor is paid)
create or replace function public.create_session_checkout(
  p_mentor_id uuid,
  p_scheduled_at timestamptz,
  p_duration integer default null,
  p_type text default 'online',
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_uid uuid := auth.uid();
  v_mentor public.mentor_profiles%rowtype;
  v_duration integer;
  v_amount integer;
  v_session_id uuid;
  v_payment_id text;
  v_mentor_name text;
  v_order_name text;
begin
  if v_uid is null then
    raise exception 'login required' using errcode = '28000';
  end if;

  select * into v_mentor from public.mentor_profiles where id = p_mentor_id;
  if not found or v_mentor.approval_status <> 'approved' then
    raise exception 'mentor not found' using errcode = 'P0002';
  end if;
  if v_mentor.user_id = v_uid then
    raise exception 'cannot book yourself' using errcode = '42501';
  end if;
  if p_scheduled_at < now() + interval '1 hour' then
    raise exception 'pick a time at least 1 hour from now' using errcode = '22023';
  end if;
  if p_scheduled_at > now() + interval '90 days' then
    raise exception 'pick a time within 90 days' using errcode = '22023';
  end if;

  v_duration := coalesce(p_duration, v_mentor.session_duration, 60);
  if v_duration not in (30, 60, 90, 120) then
    v_duration := 60;
  end if;

  -- sweep abandoned checkouts (any user, older than 30 minutes)
  perform set_config('lnk.trusted_write', '1', true);
  update public.mentor_sessions s set status = 'cancelled'
   where s.status = 'pending_payment' and s.created_at < now() - interval '30 minutes';
  update public.payments set status = 'failed', updated_at = now()
   where status = 'pending' and created_at < now() - interval '30 minutes';

  -- no double booking of the mentor's time
  if exists (
    select 1 from public.mentor_sessions s
     where s.mentor_profile_id = p_mentor_id
       and s.status in ('pending_payment','upcoming')
       and tstzrange(s.scheduled_at, s.scheduled_at + make_interval(mins => s.duration))
           && tstzrange(p_scheduled_at, p_scheduled_at + make_interval(mins => v_duration))
  ) then
    raise exception 'this time is already booked' using errcode = '23P01';
  end if;

  v_amount := ceil(coalesce(v_mentor.price, 0) * v_duration / 60.0)::integer;

  insert into public.mentor_sessions (mentor_profile_id, mentee_id, scheduled_at, duration, type, status, notes)
  values (
    p_mentor_id, v_uid, p_scheduled_at, v_duration,
    case when p_type = 'offline' then 'offline' else 'online' end,
    case when v_amount > 0 then 'pending_payment' else 'upcoming' end,
    nullif(left(coalesce(p_notes, ''), 1000), '')
  )
  returning id into v_session_id;

  if v_amount <= 0 then
    return jsonb_build_object('session_id', v_session_id, 'free', true, 'amount', 0);
  end if;

  select coalesce(nullif(p.name, ''), 'Mentor') into v_mentor_name from public.profiles p where p.id = v_mentor.user_id;
  v_order_name := left('LNK mentoring · ' || coalesce(v_mentor_name, 'Mentor') || ' · ' || v_duration || 'min', 100);
  v_payment_id := 'lnk-' || replace(gen_random_uuid()::text, '-', '');

  insert into public.payments (payment_id, user_id, mentor_profile_id, session_id, order_name, amount)
  values (v_payment_id, v_uid, p_mentor_id, v_session_id, v_order_name, v_amount);

  return jsonb_build_object(
    'session_id', v_session_id,
    'free', false,
    'payment_id', v_payment_id,
    'amount', v_amount,
    'currency', 'KRW',
    'order_name', v_order_name
  );
end;
$$;
revoke all on function public.create_session_checkout(uuid, timestamptz, integer, text, text) from public, anon;
grant execute on function public.create_session_checkout(uuid, timestamptz, integer, text, text) to authenticated;

-- 5) Server-only: mark paid after verifying with PortOne
create or replace function public.payment_mark_paid(
  p_secret text,
  p_payment_id text,
  p_amount integer,
  p_method text default null,
  p_pg_provider text default null,
  p_pg_tx_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_payment public.payments%rowtype;
  v_session public.mentor_sessions%rowtype;
begin
  if p_secret is null or p_secret <> (select value from private.app_config where key = 'payment_hook_secret') then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select * into v_payment from public.payments where payment_id = p_payment_id for update;
  if not found then
    raise exception 'payment not found' using errcode = 'P0002';
  end if;
  if v_payment.status = 'paid' then
    return jsonb_build_object('status', 'paid', 'session_id', v_payment.session_id, 'already', true);
  end if;
  if v_payment.amount <> p_amount then
    raise exception 'amount mismatch' using errcode = '22023';
  end if;

  perform set_config('lnk.trusted_write', '1', true);
  update public.payments
     set status = 'paid', method = p_method, pg_provider = p_pg_provider, pg_tx_id = p_pg_tx_id,
         paid_at = now(), updated_at = now()
   where id = v_payment.id;

  -- If the checkout was swept as abandoned and someone else took the slot meanwhile,
  -- report a conflict so the server refunds instead of double-booking.
  select * into v_session from public.mentor_sessions where id = v_payment.session_id for update;
  if v_session.status = 'cancelled' and exists (
    select 1 from public.mentor_sessions s
     where s.mentor_profile_id = v_session.mentor_profile_id
       and s.id <> v_session.id
       and s.status in ('pending_payment','upcoming')
       and tstzrange(s.scheduled_at, s.scheduled_at + make_interval(mins => s.duration))
           && tstzrange(v_session.scheduled_at, v_session.scheduled_at + make_interval(mins => v_session.duration))
  ) then
    return jsonb_build_object('status', 'paid', 'session_id', v_payment.session_id, 'conflict', true);
  end if;

  update public.mentor_sessions set status = 'upcoming'
   where id = v_payment.session_id and status in ('pending_payment','cancelled');

  return jsonb_build_object('status', 'paid', 'session_id', v_payment.session_id);
end;
$$;
revoke all on function public.payment_mark_paid(text, text, integer, text, text, text) from public;
grant execute on function public.payment_mark_paid(text, text, integer, text, text, text) to anon, authenticated;

-- 6) Server-only: mark failed / cancelled (refund)
create or replace function public.payment_mark_cancelled(
  p_secret text,
  p_payment_id text,
  p_status text,              -- 'failed' | 'cancelled'
  p_reason text default null,
  p_refunded_amount integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_payment public.payments%rowtype;
begin
  if p_secret is null or p_secret <> (select value from private.app_config where key = 'payment_hook_secret') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_status not in ('failed', 'cancelled') then
    raise exception 'invalid status' using errcode = '22023';
  end if;

  select * into v_payment from public.payments where payment_id = p_payment_id for update;
  if not found then
    raise exception 'payment not found' using errcode = 'P0002';
  end if;
  -- a failed attempt never overrides a completed payment
  if p_status = 'failed' and v_payment.status = 'paid' then
    return jsonb_build_object('status', v_payment.status, 'ignored', true);
  end if;

  perform set_config('lnk.trusted_write', '1', true);
  update public.payments
     set status = p_status,
         cancel_reason = coalesce(p_reason, cancel_reason),
         cancelled_at = case when p_status = 'cancelled' then now() else cancelled_at end,
         refunded_amount = greatest(refunded_amount, coalesce(p_refunded_amount, 0)),
         updated_at = now()
   where id = v_payment.id;
  update public.mentor_sessions set status = 'cancelled'
   where id = v_payment.session_id and status in ('pending_payment', 'upcoming');

  return jsonb_build_object('status', p_status, 'session_id', v_payment.session_id);
end;
$$;
revoke all on function public.payment_mark_cancelled(text, text, text, text, integer) from public;
grant execute on function public.payment_mark_cancelled(text, text, text, text, integer) to anon, authenticated;

-- 7) Busy time ranges for the booking calendar (no personal data)
create or replace function public.get_mentor_busy_slots(p_mentor_id uuid, p_from timestamptz, p_to timestamptz)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql
stable
security definer
set search_path to 'public'
as $$
  select s.scheduled_at, s.scheduled_at + make_interval(mins => s.duration)
    from public.mentor_sessions s
   where s.mentor_profile_id = p_mentor_id
     and s.scheduled_at < least(p_to, now() + interval '120 days')
     and s.scheduled_at + make_interval(mins => s.duration) > p_from
     and (s.status = 'upcoming'
          or (s.status = 'pending_payment' and s.created_at > now() - interval '30 minutes'))
   order by 1;
$$;
revoke all on function public.get_mentor_busy_slots(uuid, timestamptz, timestamptz) from public;
grant execute on function public.get_mentor_busy_slots(uuid, timestamptz, timestamptz) to anon, authenticated;
