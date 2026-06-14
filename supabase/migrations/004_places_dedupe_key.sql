-- ApnaPin — fix places dedupe key for upsert
-- ─────────────────────────────────────────────────────────────────────────────
-- 003 used a *partial* unique index (WHERE source_ref IS NOT NULL). Postgres
-- can't infer a partial index for ON CONFLICT, so upserts from the OSM importer
-- fail. Replace it with a real constraint scoped per location:
--   (location_id, source, source_ref)
-- NULLs are distinct, so community-added rows (source_ref NULL) are unconstrained.
-- Scoping by location_id lets the same OSM node appear under two adjacent PINs
-- (radius imports overlap) while still blocking duplicates on re-run.

drop index if exists places_source_ref_uniq;

alter table places
  add constraint places_dedupe_key unique (location_id, source, source_ref);
