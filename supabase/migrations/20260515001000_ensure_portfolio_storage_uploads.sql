insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio',
  'portfolio',
  true,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Portfolio is publicly viewable" on storage.objects;
create policy "Portfolio is publicly viewable"
  on storage.objects
  for select
  using (bucket_id = 'portfolio');

drop policy if exists "Users can upload portfolio" on storage.objects;
create policy "Users can upload portfolio"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'portfolio'
    and (auth.uid())::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update own portfolio files" on storage.objects;
create policy "Users can update own portfolio files"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'portfolio'
    and (auth.uid())::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'portfolio'
    and (auth.uid())::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete own portfolio files" on storage.objects;
create policy "Users can delete own portfolio files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'portfolio'
    and (auth.uid())::text = (storage.foldername(name))[1]
  );
