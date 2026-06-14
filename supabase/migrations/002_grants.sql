-- ApnaPin — API role grants
-- ─────────────────────────────────────────────────────────────────────────────
-- The initial migration created tables + RLS but never granted table-level
-- privileges to the PostgREST roles. Without these, every request fails with
-- "permission denied for table" *before* RLS is even evaluated.
--
-- This is the standard Supabase grant set. Row access is still governed by the
-- RLS policies in 001_initial.sql — these grants only get the roles past the
-- table-privilege check. anon/authenticated writes remain gated by RLS;
-- service_role additionally bypasses RLS (trusted server-side use only).

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public
  TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public
  TO anon, authenticated, service_role;

-- Ensure tables/sequences created by future migrations inherit the same grants.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;
