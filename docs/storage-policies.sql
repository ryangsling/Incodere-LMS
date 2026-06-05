-- Supabase Storage RLS Policies for ILMS

-- Enable RLS on storage.objects (if not already enabled)
alter table storage.objects enable row level security;

-- 1. Course Thumbnails Bucket
-- Allow public to read course thumbnails
create policy "Public Access to Course Thumbnails"
  on storage.objects for select
  using ( bucket_id = 'course-thumbnails' );

-- Allow super_admin to upload course thumbnails
create policy "Super Admins can upload thumbnails"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'course-thumbnails' and
    exists (select 1 from public.users where id = auth.uid() and role = 'super_admin')
  );

-- Allow super_admin to update/delete thumbnails
create policy "Super Admins can update thumbnails"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'course-thumbnails' and
    exists (select 1 from public.users where id = auth.uid() and role = 'super_admin')
  );

create policy "Super Admins can delete thumbnails"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'course-thumbnails' and
    exists (select 1 from public.users where id = auth.uid() and role = 'super_admin')
  );


-- 2. Certificates Bucket (Private)
-- Allow company_admin and learner to read certificates they have access to
-- For simplicity, we can let authenticated users read them if they have the signed URL,
-- or we can restrict it. Since the backend generates signed URLs for certificates,
-- we actually don't need a SELECT policy for the frontend if the backend uses service_role to sign!
-- BUT if frontend ever needs to download directly, we can add it.

-- Allow backend service_role to manage certificates (Bypasses RLS automatically, no policy needed).
