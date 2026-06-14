# Location Data Model & Page Spec

Status: **locked** (schema in `supabase/migrations/003_places_stats_ratings.sql`,
vocab in `lib/types.ts`). This is the reference for what a location page contains,
where each piece comes from, and whether it's legal to use.

---

## 1. The core idea: three orthogonal layers, not more levels

A common mistake is to model "5 hospitals in a PIN" as nesting. It isn't. There
are **two independent axes**:

- **Containment** (navigation / identity) — stays **3 deep**, no more:
  `PIN → Area (ward / village / sector) → Locality (colony / apartment / hamlet)`
- **Attached data** (many things hang off any one location):
  - **places** — typed points of interest (hospitals, police, schools…) — *many per location*
  - **location_details** — singular editable civic facts (councillor, ward no.) — *key/value wiki*
  - **location_stats** — numeric facts with provenance (population…) — *sourced, not wiki*
  - **ratings** — per-dimension community scores (safety, water…) — *one per user/dimension*
  - **posts** — threaded discussion (existing)

District and State are **attributes** (shown in the header), not navigation
levels. Browse-by-district later is a read-model over `location_stats`, not a new
tier.

```
locations (pin/area/locality)  ──┐
  ├─ location_details  (1 row per key)        editable wiki text
  ├─ location_stats    (1 row per key)        sourced numbers + provenance
  ├─ places            (N rows)               facilities / POIs, typed
  ├─ ratings           (N rows)  ──► location_rating_summary (avg + count)
  └─ posts             (N rows)               discussion (existing)
locations.{lat,lng,boundary}                  geo for the map
```

---

## 2. Data catalogue — source & legality

| Layer | Fields | Source | License / legality | Status |
|---|---|---|---|---|
| Post offices, district, division | name, BranchType | api.postalpincode.in (India Post) | Public govt data | ✅ live (500032) |
| **Facilities** | hospitals, police, schools, pharmacy, bank, atm, park, transport, govt | **OpenStreetMap / Overpass** | **ODbL — attribution required** | schema ready |
| **Map tiles** | base map | OpenStreetMap / MapLibre | Free, attribution | planned |
| **Population** | population | **Bottom-up: sum of localities/areas** (community-reported at leaf units) | Our own UGC | ✅ live (500032, sample) |
| Other demographics | households, literacy, sex ratio | Census 2011 via data.gov.in (city/district scope only) | OGDL India; label "Census 2011" + `scope` | deferred |
| Civic contacts | councillor, MLA/MP, ward, local body | LGD + Wikidata (CC0) | Public / CC0 | partial (wiki) |
| **"Living here"** | flooding, water hrs, power cuts, safety, builder | **Community (verified residents)** | Our own UGC | scaffolded |
| **Ratings** | safety/water/power/cleanliness/connectivity/greenery | **Community** | Our own UGC | schema ready |

**Deliberately excluded** (legal/risk — revisit only with a clean source):
scraping Google Maps / Justdial / 99acres, storing Google Maps data, per-locality
crime stats (not reliably public), officials' personal contact numbers.

> Attribution obligation: any page showing OSM-derived data must carry
> "© OpenStreetMap contributors". Track this when the facilities layer ships.

---

## 3. Tables (see migration 003 for full DDL)

- **places** — `category` (free text, vocab in `PLACE_CATEGORIES`), `name`,
  `address`, `phone`, `website`, `lat`/`lng` (+ generated `geo` geography),
  `source` (osm/community/manual), `source_ref` (dedupe key), `added_by`.
- **location_stats** — `(location_id, key)` PK, `value numeric`, `unit`,
  `source`, `as_of` date, `scope` (what the number describes when not PIN-level).
  Read-public. Currently **write only via service_role**.
  ⚠️ **Open item:** `population` is community-reported at leaf units (localities /
  childless areas) and rolls up — see `lib/population.ts`. When the Phase-2 edit
  UI lands it needs an RLS policy allowing authenticated insert/update of
  `key = 'population'` (sourced keys like Census stay service-role-only).
  A PIN/area never stores its own population; it is always the computed sum.
- **ratings** — `(location_id, user_id, dimension)` unique, `score 1–5`. Users
  manage only their own rows; **`location_rating_summary`** view exposes
  avg + count (aggregates only, never individual rows).

RLS: everything is publicly readable. Writes — `places` & `ratings` require auth
(ratings scoped to `user_id = auth.uid()`); `location_stats` has no public write.

---

## 4. Page presentation spec

Principle: **progressive disclosure** — summary cards first, expand for detail;
lead with what portals hide (Living here + Facilities), push generic admin lower.

PIN / Area / Locality pages share this order (sections absent when empty/N-A):

| # | Section | Source | Component (planned) |
|---|---|---|---|
| 0 | Breadcrumb + Header (name, level badge, district·state) + **stat strip** (`2 areas · 12 facilities · pop ~X`) | locations + counts | `LocationHeader` (extend) |
| 1 | **Map** — centroid + facility pins + boundary (collapsible) | locations.geo + places | `LocationMap` (MapLibre) |
| 2 | **Living here** — rating bars (safety/water/power…) + mover notes | ratings summary + location_details | `RatingBars` + `InfoGroup` |
| 3 | **Facilities** — grouped by category, count badge, expand for name/phone/distance | places | `FacilityGroups` |
| 4 | **Civic & administrative** — councillor, ward, post office, district | location_details | `InfoGroup` (exists) |
| 5 | **Demographics** — population, literacy, sex ratio, with "Census 2011" tag | location_stats | `StatGrid` |
| 6 | **Areas / Localities in …** — hierarchy navigation | locations (children) | `ChildLocationList` (exists) |
| 7 | **Discussion** | posts | `DiscussionFeed` (Phase 3) |

Level differences: PIN & Area show children (6); Locality has none. Facilities
attach to the most specific containing location during import (area if
resolvable, else PIN) and bubble up for display.

---

## 5. Build order (after this lock)

1. **Facilities + Map** (OSM/Overpass → `places`, MapLibre map) — highest payoff, fully legal.
2. **Demographics** (Census 2011 → `location_stats`) — needs a fuzzy PIN↔census join.
3. **Ratings** (write UI) — depends on the auth-gated edit flow (Phase 2).

Ingestion scripts to add: `scripts/ingest-osm.ts` (Overpass), `scripts/ingest-census.ts`.
