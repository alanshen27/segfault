-- Run in Supabase Dashboard > SQL Editor to enable object storage buckets.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('community-icons', 'community-icons', true, 2097152, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('community-banners', 'community-banners', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('post-images', 'post-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Avatars: authenticated users upload to their own folder
create policy "Avatar uploads by owner"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Avatar updates by owner"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Avatar public read"
on storage.objects for select to public
using (bucket_id = 'avatars');

-- Community icons: authenticated users can upload
create policy "Community icon uploads"
on storage.objects for insert to authenticated
with check (bucket_id = 'community-icons');

create policy "Community icon updates"
on storage.objects for update to authenticated
using (bucket_id = 'community-icons');

create policy "Community icon public read"
on storage.objects for select to public
using (bucket_id = 'community-icons');

-- Community banners: authenticated users can upload
create policy "Community banner uploads"
on storage.objects for insert to authenticated
with check (bucket_id = 'community-banners');

create policy "Community banner updates"
on storage.objects for update to authenticated
using (bucket_id = 'community-banners');

create policy "Community banner public read"
on storage.objects for select to public
using (bucket_id = 'community-banners');

-- Post images: authenticated users can upload
create policy "Post image uploads"
on storage.objects for insert to authenticated
with check (bucket_id = 'post-images');

create policy "Post image updates"
on storage.objects for update to authenticated
using (bucket_id = 'post-images');

create policy "Post image public read"
on storage.objects for select to public
using (bucket_id = 'post-images');
