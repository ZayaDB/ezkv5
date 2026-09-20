-- Public image uploads (lectures, feed attachments)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  true,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "uploads: public select" on storage.objects;
create policy "uploads: public select"
on storage.objects
for select
using (bucket_id = 'uploads');

drop policy if exists "uploads: authenticated insert" on storage.objects;
create policy "uploads: authenticated insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "uploads: authenticated delete" on storage.objects;
create policy "uploads: authenticated delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);
