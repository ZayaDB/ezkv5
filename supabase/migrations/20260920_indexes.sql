-- Dashboard / my-area query performance

create index if not exists roadmaps_user_status_updated_idx
  on public.roadmaps (user_id, status, updated_at desc);

create index if not exists roadmap_steps_roadmap_sort_idx
  on public.roadmap_steps (roadmap_id, sort_order);

create index if not exists calendar_events_user_starts_idx
  on public.calendar_events (user_id, starts_at);

create index if not exists user_alerts_user_dismissed_idx
  on public.user_alerts (user_id, dismissed);
