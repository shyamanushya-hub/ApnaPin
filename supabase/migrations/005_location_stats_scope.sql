-- ApnaPin — scope label on location_stats
-- ─────────────────────────────────────────────────────────────────────────────
-- Demographics rarely exist at PIN granularity. The best free, machine-readable
-- figures (Wikidata / Census 2011) are usually city- or district-level. Showing
-- them without saying so would mislead ("this PIN has 6.7M people?"). `scope`
-- records what the number actually describes, e.g. "Hyderabad" or
-- "Serilingampally mandal", so the UI can label it honestly.

alter table location_stats
  add column if not exists scope text;
