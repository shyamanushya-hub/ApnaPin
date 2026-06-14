-- ApnaPin — Initial Schema
-- Run via: supabase db push

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. LOCATIONS — 3-level geographic hierarchy
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE locations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id  UUID REFERENCES locations(id) ON DELETE RESTRICT,
  level      TEXT NOT NULL CHECK (level IN ('pin', 'area', 'locality')),
  pin_code   CHAR(6) NOT NULL,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL,           -- URL-safe name: 'bairamalguda', 'shivam-apartments'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pin_code, slug)
);

-- Index for fast PIN code lookups (primary use case)
CREATE INDEX locations_pin_code_idx ON locations (pin_code);
CREATE INDEX locations_parent_id_idx ON locations (parent_id);
CREATE INDEX locations_level_idx ON locations (level);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. LOCATION_DETAILS — editable key-value info per location
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE location_details (
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  key         TEXT NOT NULL,
  value       TEXT NOT NULL,
  updated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (location_id, key)
);

-- Predefined keys (display logic in application, not enforced in DB):
-- Mover fields:    flooding, safety, water_supply, power_reliability, builder_reputation
-- Civic contacts:  councillor_name, councillor_phone, police_station, hospital, post_office
-- Community-added: any other key, displayed as plain text

CREATE INDEX location_details_location_id_idx ON location_details (location_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. POSTS — threaded discussions at any location level
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id  UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  parent_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
  path         TEXT,                  -- materialised path: '1.4.7' for nesting depth
  author_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,                  -- NULL = show as "Resident of [pin_code]"
  body         TEXT NOT NULL CHECK (length(body) > 0 AND length(body) <= 5000),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX posts_location_id_idx ON posts (location_id);
CREATE INDEX posts_parent_id_idx ON posts (parent_id);
CREATE INDEX posts_author_id_idx ON posts (author_id);
CREATE INDEX posts_created_at_idx ON posts (created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE locations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts             ENABLE ROW LEVEL SECURITY;

-- locations: anyone reads; authenticated users can add localities
CREATE POLICY "locations_select_public"
  ON locations FOR SELECT USING (true);

CREATE POLICY "locations_insert_authenticated"
  ON locations FOR INSERT TO authenticated
  WITH CHECK (level = 'locality');   -- only users can add localities, not PIN/area

-- location_details: anyone reads; authenticated users insert and update
CREATE POLICY "location_details_select_public"
  ON location_details FOR SELECT USING (true);

CREATE POLICY "location_details_insert_authenticated"
  ON location_details FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "location_details_update_authenticated"
  ON location_details FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- posts: anyone reads; authenticated users insert; authors delete own posts
CREATE POLICY "posts_select_public"
  ON posts FOR SELECT USING (true);

CREATE POLICY "posts_insert_authenticated"
  ON posts FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "posts_delete_own"
  ON posts FOR DELETE TO authenticated
  USING (author_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. REALTIME — enable for live discussion feed
-- ─────────────────────────────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE posts;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. SEED — index record (no data yet; use scripts/ingest-lgd.ts)
-- ─────────────────────────────────────────────────────────────────────────────

-- PIN codes and areas are seeded via: npx tsx scripts/ingest-lgd.ts
-- Localities are added by users or manually by Arjun
-- Location details are added manually for the first 3 PIN codes
