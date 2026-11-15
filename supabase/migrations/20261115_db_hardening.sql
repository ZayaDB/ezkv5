-- QA 점검 결과 반영: 보안/성능 어드바이저 경고 정리
-- 1) 트리거 함수는 RPC로 직접 호출될 이유가 없음 → EXECUTE 회수 (트리거 실행에는 영향 없음)
revoke execute on function public.enforce_join_request_moderation() from public, anon, authenticated;
revoke execute on function public.enforce_lectures_moderation() from public, anon, authenticated;
revoke execute on function public.enforce_mentor_profiles_moderation() from public, anon, authenticated;
revoke execute on function public.enforce_profiles_role_change() from public, anon, authenticated;
revoke execute on function public.enforce_user_inquiries_admin_reply() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.stamp_platform_expense_owner() from public, anon, authenticated;
revoke execute on function public.sync_lecture_students() from public, anon, authenticated;

-- 2) 로그인 전용 RPC는 anon 실행 회수 (함수 내부에서도 auth.uid() 검사함)
revoke execute on function public.admin_commerce_stats(timestamptz) from public, anon;
revoke execute on function public.resubmit_lecture_application(uuid) from public, anon;
revoke execute on function public.resubmit_mentor_application(uuid) from public, anon;
revoke execute on function public.upsert_lecture_review(uuid, integer) from public, anon;
revoke execute on function public.consume_chat_quota(integer) from public, anon;
grant execute on function public.admin_commerce_stats(timestamptz) to authenticated;
grant execute on function public.resubmit_lecture_application(uuid) to authenticated;
grant execute on function public.resubmit_mentor_application(uuid) to authenticated;
grant execute on function public.upsert_lecture_review(uuid, integer) to authenticated;
grant execute on function public.consume_chat_quota(integer) to authenticated;

-- 3) search_path 고정
alter function public.handle_new_user() set search_path = public;

-- 4) 외래키 인덱스
create index if not exists idx_roadmap_steps_user_id on public.roadmap_steps (user_id);
create index if not exists idx_calendar_events_roadmap_id on public.calendar_events (roadmap_id);
create index if not exists idx_lecture_enrollments_lecture_id on public.lecture_enrollments (lecture_id);
create index if not exists idx_lecture_wishlist_lecture_id on public.lecture_wishlist (lecture_id);
create index if not exists idx_life_budget_lines_user_id on public.life_budget_lines (user_id);
create index if not exists idx_user_inquiries_user_id on public.user_inquiries (user_id);
create index if not exists idx_community_memberships_group_id on public.community_memberships (group_id);
create index if not exists idx_freelancer_applications_group_id on public.freelancer_applications (group_id);
create index if not exists idx_public_feed_posts_author_id on public.public_feed_posts (author_id);
create index if not exists idx_public_feed_comments_post_id on public.public_feed_comments (post_id);
create index if not exists idx_public_feed_comments_author_id on public.public_feed_comments (author_id);
create index if not exists idx_public_feed_likes_user_id on public.public_feed_likes (user_id);
create index if not exists idx_channel_posts_author_id on public.channel_posts (author_id);
create index if not exists idx_channel_comments_post_id on public.channel_comments (post_id);
create index if not exists idx_channel_comments_author_id on public.channel_comments (author_id);
create index if not exists idx_community_groups_created_by on public.community_groups (created_by);
create index if not exists idx_community_messages_author_id on public.community_messages (author_id);
create index if not exists idx_lecture_page_views_viewer_id on public.lecture_page_views (viewer_id);
create index if not exists idx_lecture_reviews_user_id on public.lecture_reviews (user_id);
create index if not exists idx_platform_expenses_created_by on public.platform_expenses (created_by);
create index if not exists idx_lesson_progress_lesson_id on public.lesson_progress (lesson_id);

-- 5) RLS 정책의 auth.uid() 를 (select auth.uid()) 로 감싸 행마다 재평가되지 않게 함
do $$
declare r record; q text; w text; sql text;
begin
  for r in select * from pg_policies where schemaname = 'public'
           and (qual ~ 'auth\.uid\(\)' or with_check ~ 'auth\.uid\(\)') loop
    q := replace(r.qual, 'auth.uid()', '(select auth.uid())');
    w := replace(r.with_check, 'auth.uid()', '(select auth.uid())');
    sql := format('alter policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
    if q is not null then sql := sql || format(' using (%s)', q); end if;
    if w is not null then sql := sql || format(' with check (%s)', w); end if;
    execute sql;
  end loop;
end $$;
