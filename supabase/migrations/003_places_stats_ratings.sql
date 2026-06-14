-- ApnaPin — Facilities, statistics, and community ratings
-- ─────────────────────────────────────────────────────────────────────────────
-- Builds on 001 (locations / location_details / posts) and 002 (grants).
--
-- Three new layers, each ORTHOGONAL to the PIN→area→locality containment tree.
-- A hospital is not a "child locality" — it is a typed point attached to a
-- location. So we do NOT add hierarchy levels; we add:
--   1. geo on locations  — centroid + optional boundary, for the map
--   2. places            — typed points of interest (many per location)
--   3. location_stats     — numeric facts WITH provenance (Census, etc.)
--   4. ratings            — per-dimension community scores (+ summary view)
--
-- Controlled vocabularies (place categories, rating dimensions, stat keys) live
-- in lib/types.ts as app config — same pattern as INFO_FIELDS / location_details
-- keys — so they stay free `text` here and are validated/labelled in the app.

-- PostGIS: spatial types + GiST indexes. Bundled with Supabase; no-op if present.
create extension if not exists postgis;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. GEO on locations — map placement
-- ─────────────────────────────────────────────────────────────────────────────
-- lat/lng are kept as plain doubles so the client gets them directly as JSON;
-- boundary is optional (many Indian postal areas have no clean OSM polygon).
alter table locations
  add column if not exists lat      double precision,
  add column if not exists lng      double precision,
  add column if not exists boundary geography(MultiPolygon, 4326);

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. PLACES — facilities / points of interest
-- ─────────────────────────────────────────────────────────────────────────────
-- category: hospital | police | school | pharmacy | bank | atm | park |
--           bus_stop | metro | government | fire | post_office | water | other
-- source_ref dedupes repeat imports from the same source (e.g. OSM 'node/123').
create table places (
  id          uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  category    text not null,
  name        text not null,
  description text,
  address     text,
  phone       text,
  website     text,
  lat         double precision,
  lng         double precision,
  -- Generated geography point for spatial queries (radius / within-boundary).
  geo         geography(Point, 4326) generated always as (
                case
                  when lat is not null and lng is not null
                  then st_setsrid(st_makepoint(lng, lat), 4326)::geography
                end
              ) stored,
  source      text not null default 'community',  -- osm | community | manual
  source_ref  text,
  added_by    uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index places_location_category_idx on places (location_id, category);
create index places_geo_idx on places using gist (geo);
create unique index places_source_ref_uniq on places (source, source_ref) where source_ref is not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. LOCATION_STATS — numeric facts that need provenance + an "as of" date
-- ─────────────────────────────────────────────────────────────────────────────
-- key: population | households | literacy_rate | sex_ratio | area_sqkm
-- Sourced data, NOT a community wiki — so there is no public write policy below.
-- Only service_role (which bypasses RLS) seeds these via ingestion scripts.
create table location_stats (
  location_id uuid not null references locations(id) on delete cascade,
  key         text not null,
  value       numeric not null,
  unit        text,                  -- people | households | percent | per_1000_males | sq_km
  source      text not null,         -- census_2011 | lgd | wikidata | manual
  as_of       date,                  -- 2011-01-01 → shown as "Census 2011"
  updated_at  timestamptz not null default now(),
  primary key (location_id, key)
);

create index location_stats_location_idx on location_stats (location_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. RATINGS — per-dimension community scores
-- ─────────────────────────────────────────────────────────────────────────────
-- dimension: safety | water_supply | power | cleanliness | connectivity | greenery
-- One row per (location, user, dimension). Aggregates come from the view below,
-- so a single overall number is always derived, never an editable vanity field.
create table ratings (
  id          uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  dimension   text not null,
  score       smallint not null check (score between 1 and 5),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (location_id, user_id, dimension)
);

create index ratings_location_dimension_idx on ratings (location_id, dimension);

-- Public aggregate: average + count per location/dimension. Always consistent
-- (computed, not stored). Exposes only aggregates, never individual rows.
create view location_rating_summary as
  select location_id,
         dimension,
         round(avg(score)::numeric, 2) as avg_score,
         count(*)                      as rating_count
  from ratings
  group by location_id, dimension;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────
alter table places         enable row level security;
alter table location_stats enable row level security;
alter table ratings        enable row level security;

-- places: anyone reads; authenticated add/edit; authors delete their own additions.
create policy places_select_public on places for select using (true);
create policy places_insert_auth   on places for insert to authenticated with check (true);
create policy places_update_auth   on places for update to authenticated using (true) with check (true);
create policy places_delete_own    on places for delete to authenticated using (added_by = auth.uid());

-- location_stats: anyone reads; no public write (service_role seeds, bypasses RLS).
create policy location_stats_select_public on location_stats for select using (true);

-- ratings: anyone reads; each user manages only their own rating rows.
create policy ratings_select_public on ratings for select using (true);
create policy ratings_insert_own    on ratings for insert to authenticated with check (user_id = auth.uid());
create policy ratings_update_own    on ratings for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy ratings_delete_own    on ratings for delete to authenticated using (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. GRANTS (explicit — 001 omitted these and every query failed "permission denied")
-- ─────────────────────────────────────────────────────────────────────────────
grant select, insert, update, delete on places, location_stats, ratings
  to anon, authenticated, service_role;
grant select on location_rating_summary to anon, authenticated, service_role;
