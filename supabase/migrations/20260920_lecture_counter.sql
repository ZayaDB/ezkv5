-- lectures.students 를 lecture_enrollments 트리거로 정확히 유지
-- enforce_lectures_moderation 은 auth.uid() 가 있으면 students 를 old 로 되돌리므로,
-- 카운터 함수가 트랜잭션 로컬 플래그 app.lecture_counter 를 켜고 가드가 이를 허용한다.

create or replace function public.enforce_lectures_moderation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('app.lecture_counter', true) = 'on' then
    return new;
  end if;
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

create or replace function public.sync_lecture_students()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lecture_id uuid;
  v_delta int := 0;
begin
  perform set_config('app.lecture_counter', 'on', true);

  if tg_op = 'INSERT' then
    if new.status <> 'cancelled' then
      v_delta := 1;
    end if;
    v_lecture_id := new.lecture_id;
  elsif tg_op = 'UPDATE' then
    if old.status = 'cancelled' and new.status <> 'cancelled' then
      v_delta := 1;
    elsif old.status <> 'cancelled' and new.status = 'cancelled' then
      v_delta := -1;
    end if;
    v_lecture_id := new.lecture_id;
  elsif tg_op = 'DELETE' then
    if old.status <> 'cancelled' then
      v_delta := -1;
    end if;
    v_lecture_id := old.lecture_id;
  end if;

  if v_delta <> 0 then
    begin
      update public.lectures
      set students = greatest(students + v_delta, 0)
      where id = v_lecture_id;
    exception
      -- 강의 삭제 CASCADE 로 enrollment 가 지워질 때 parent 를 다시 update 하면 실패함
      when triggered_data_change_violation then
        null;
    end;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_lecture_students on public.lecture_enrollments;
create trigger sync_lecture_students
  after insert or update or delete on public.lecture_enrollments
  for each row execute function public.sync_lecture_students();

-- 기존 데이터 1회 보정 (SQL Editor 기준 auth.uid() null → 가드 통과)
update public.lectures l
set students = (
  select count(*)::int
  from public.lecture_enrollments e
  where e.lecture_id = l.id
    and e.status <> 'cancelled'
);
