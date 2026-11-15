-- Course (lecture) enrollment payments through the same PortOne flow as mentor sessions.
-- Enrollment rows are created only by create_lecture_checkout (free) or payment_mark_paid (paid).

-- 1) payments can belong to a lecture instead of a mentor session
alter table public.payments alter column mentor_profile_id drop not null;
alter table public.payments add column if not exists lecture_id uuid references public.lectures(id) on delete cascade;
create index if not exists payments_lecture_idx on public.payments(lecture_id, created_at desc);
alter table public.payments drop constraint if exists payments_target_check;
alter table public.payments add constraint payments_target_check
  check ((mentor_profile_id is not null) <> (lecture_id is not null));

drop policy if exists "payments: instructor read" on public.payments;
create policy "payments: instructor read" on public.payments
  for select using (lecture_id is not null and exists (
    select 1 from public.lectures l where l.id = payments.lecture_id and l.instructor_id = auth.uid()
  ));

-- 2) no more free self-enrollment
drop policy if exists "enrollments: insert" on public.lecture_enrollments;

create or replace function public.enforce_lecture_enrollments_payment()
returns trigger
language plpgsql
security invoker
set search_path to 'public'
as $$
begin
  if tg_op = 'UPDATE' then
    if new.status = 'completed' and old.status is distinct from 'completed' then
      new.completed_at := now();
    elsif new.status is distinct from 'completed' then
      new.completed_at := null;
    end if;
  end if;

  -- trusted paths: payment/checkout functions (run as owner) and admins
  if current_user not in ('authenticated', 'anon') or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    raise exception 'enroll through checkout' using errcode = '42501';
  end if;

  new.payment_status := old.payment_status;
  new.paid_amount := old.paid_amount;
  new.user_id := old.user_id;
  new.lecture_id := old.lecture_id;
  new.enrolled_at := old.enrolled_at;
  -- a cancelled (or refunded) enrollment can only come back through a new checkout
  if old.status = 'cancelled' and new.status <> 'cancelled' then
    new.status := old.status;
    new.completed_at := null;
  end if;
  return new;
end;
$$;

-- 3) checkout for a lecture
create or replace function public.create_lecture_checkout(p_lecture_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_uid uuid := auth.uid();
  v_lecture public.lectures%rowtype;
  v_amount integer;
  v_payment_id text;
  v_order_name text;
begin
  if v_uid is null then
    raise exception 'login required' using errcode = '28000';
  end if;
  select * into v_lecture from public.lectures where id = p_lecture_id;
  if not found or v_lecture.approval_status <> 'approved' then
    raise exception 'lecture not found' using errcode = 'P0002';
  end if;
  if v_lecture.instructor_id = v_uid then
    raise exception 'cannot enroll in your own lecture' using errcode = '42501';
  end if;
  if exists (
    select 1 from public.lecture_enrollments
     where user_id = v_uid and lecture_id = p_lecture_id and status in ('active', 'completed')
  ) then
    raise exception 'already enrolled' using errcode = '23505';
  end if;

  v_amount := ceil(coalesce(v_lecture.price, 0))::integer;

  if v_amount <= 0 then
    insert into public.lecture_enrollments (user_id, lecture_id, status, payment_status, paid_amount)
    values (v_uid, p_lecture_id, 'active', 'paid', 0)
    on conflict (user_id, lecture_id) do update
      set status = 'active', payment_status = 'paid', paid_amount = 0, enrolled_at = now(), completed_at = null;
    return jsonb_build_object('free', true, 'lecture_id', p_lecture_id, 'amount', 0);
  end if;

  -- reuse an open checkout for the same lecture (avoids piles of pending rows)
  select payment_id into v_payment_id from public.payments
   where user_id = v_uid and lecture_id = p_lecture_id and status = 'pending'
     and amount = v_amount and created_at > now() - interval '30 minutes'
   order by created_at desc limit 1;

  v_order_name := left('LNK course · ' || v_lecture.title, 100);
  if v_payment_id is null then
    v_payment_id := 'lnk-' || replace(gen_random_uuid()::text, '-', '');
    insert into public.payments (payment_id, user_id, lecture_id, order_name, amount)
    values (v_payment_id, v_uid, p_lecture_id, v_order_name, v_amount);
  end if;

  return jsonb_build_object(
    'free', false,
    'lecture_id', p_lecture_id,
    'payment_id', v_payment_id,
    'amount', v_amount,
    'currency', 'KRW',
    'order_name', v_order_name
  );
end;
$$;
revoke all on function public.create_lecture_checkout(uuid) from public, anon;
grant execute on function public.create_lecture_checkout(uuid) to authenticated;

-- 4) mark paid: sessions (as before) or lectures (create/reactivate enrollment)
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
    return jsonb_build_object('status', 'paid', 'session_id', v_payment.session_id, 'lecture_id', v_payment.lecture_id, 'already', true);
  end if;
  if v_payment.amount <> p_amount then
    raise exception 'amount mismatch' using errcode = '22023';
  end if;

  update public.payments
     set status = 'paid', method = p_method, pg_provider = p_pg_provider, pg_tx_id = p_pg_tx_id,
         paid_at = now(), updated_at = now()
   where id = v_payment.id;

  if v_payment.lecture_id is not null then
    insert into public.lecture_enrollments (user_id, lecture_id, status, payment_status, paid_amount)
    values (v_payment.user_id, v_payment.lecture_id, 'active', 'paid', v_payment.amount)
    on conflict (user_id, lecture_id) do update
      set status = 'active', payment_status = 'paid', paid_amount = excluded.paid_amount,
          enrolled_at = now(), completed_at = null;
    return jsonb_build_object('status', 'paid', 'lecture_id', v_payment.lecture_id);
  end if;

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

-- 5) cancel / refund: sessions (as before) or lectures (enrollment → cancelled / refunded)
create or replace function public.payment_mark_cancelled(
  p_secret text,
  p_payment_id text,
  p_status text,
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
  if p_status = 'failed' and v_payment.status = 'paid' then
    return jsonb_build_object('status', v_payment.status, 'ignored', true);
  end if;

  update public.payments
     set status = p_status,
         cancel_reason = coalesce(p_reason, cancel_reason),
         cancelled_at = case when p_status = 'cancelled' then now() else cancelled_at end,
         refunded_amount = greatest(refunded_amount, coalesce(p_refunded_amount, 0)),
         updated_at = now()
   where id = v_payment.id;

  if v_payment.lecture_id is not null then
    if v_payment.status = 'paid' and p_status = 'cancelled' then
      update public.lecture_enrollments
         set status = 'cancelled', payment_status = 'refunded'
       where user_id = v_payment.user_id and lecture_id = v_payment.lecture_id;
    end if;
    return jsonb_build_object('status', p_status, 'lecture_id', v_payment.lecture_id);
  end if;

  update public.mentor_sessions set status = 'cancelled'
   where id = v_payment.session_id and status in ('pending_payment', 'upcoming');

  return jsonb_build_object('status', p_status, 'session_id', v_payment.session_id);
end;
$$;
revoke all on function public.payment_mark_cancelled(text, text, text, text, integer) from public;
grant execute on function public.payment_mark_cancelled(text, text, text, text, integer) to anon, authenticated;
