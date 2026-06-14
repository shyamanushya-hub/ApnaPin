-- ApnaPin — Storage bucket for issue photos
-- ─────────────────────────────────────────────────────────────────────────────
-- Uses Supabase Storage (bundled in the local stack) for MVP. Public bucket so
-- photos render directly via their public URL on the (public) issue cards.
-- Migrate to Cloudflare R2 later for near-zero egress at scale.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'issue-photos',
  'issue-photos',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Public read (public bucket already serves the public endpoint; explicit for clarity).
create policy "issue_photos_read"
  on storage.objects for select
  using (bucket_id = 'issue-photos');

-- Any verified (authenticated) resident may upload.
create policy "issue_photos_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'issue-photos');
