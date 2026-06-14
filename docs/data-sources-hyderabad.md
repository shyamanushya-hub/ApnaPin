# Hyderabad Civic Data — Availability Audit

> First-pass scan (2026-06-13) of what civic/locality data is actually obtainable to
> **seed the locality wiki** (the "useful-when-empty" layer). Purpose: decide whether the
> wiki is buildable in Hyderabad, and identify the real integration work. This is a
> desk audit from web search — every source below must be opened and verified before we
> build ingestion against it.

---

## Verdict

**The static wiki layer is buildable — the seed data exists.** Hyderabad is unusually
data-rich: a state open-data portal with APIs, a strong civic-data aggregator
(OpenCity), and most authorities publishing *something* online. The idea survives
contact with reality.

**But the data is fragmented across four different boundary systems, and none of them is
the PIN code.** That crosswalk — not "getting the data" — is the first real engineering
problem. See below.

---

## Source inventory (verify each before building)

| Source | What it gives us | Format | Cadence | Keyed by |
|---|---|---|---|---|
| **Telangana Open Data Portal** (data.telangana.gov.in) | ~658 datasets: TGSPDCL consumption, transit (MMTS GTFS), agriculture, vehicles, etc. APIs for select sets | API / CSV | Many monthly | Varies (dept-specific) |
| **OpenCity Urban Data Portal** (data.opencity.in) | Aggregates 600+ TG datasets; **GHMC ward/zone boundaries (KML)**, solid-waste, drains, lakes/tanks maps, ward amenities | KML / GeoJSON / CSV | Static-ish | Ward / zone |
| **GHMC** (ghmc.gov.in + ArcGIS Hub + Kaggle) | 150 wards across 5 zones / 18 circles; ward name + population; **corporator names + phone numbers** | PDF / Scribd / ArcGIS / CSV | Per election term | **Ward** |
| **TGSPDCL / TSSPDCL** (tssouthernpower.com) | **Scheduled power-outage notices** — affected areas + timings | Web notices (HTML) | Ad-hoc / daily | **Substation / area name** |
| **HMWSSB** (hyderabadwater.gov.in) | **Water-supply timings** by division ("DivisionMap" page); disruption notices | Web page / press notices | Ad-hoc | **Water division** |
| **MyNeta** (myneta.info) | MLA / MP profiles, affidavits, assets/cases | Web | Per election | Constituency |
| **ECI** | Elected representatives | Web / data | Per election | Constituency |

**Format reality:** a mix of clean (portal APIs, ArcGIS GeoJSON) → semi-structured
(CSV/Kaggle) → unstructured (PDFs on Scribd, HTML notices). Ingestion is therefore
API + scrape + one-time-manual, not one clean pipeline. Matches the CLAUDE.md warning
that the data is messy and needs a normalisation layer.

---

## The core problem: four boundary systems, none of them PIN

Our product is organised by **PIN code → sub-area**. But the civic data is keyed by:

- **GHMC ward** (corporator, population, sanitation, amenities)
- **Electricity substation / feeder area** (TGSPDCL outages)
- **Water division** (HMWSSB supply timings)
- **Assembly/parliamentary constituency** (MLA/MP)

None of these aligns cleanly with PIN codes — one PIN spans multiple wards and vice
versa; substation and water-division footprints are yet another shape. So the first real
engineering task is **building the crosswalk**: PIN ↔ ward ↔ substation ↔ water-division
↔ constituency ↔ sub-area. PostGIS (already in the stack) is the right tool — overlay the
boundary polygons and compute the mappings — but the boundary data quality and the
many-to-many joins make this the hard part of Phase 1, not the LGD ingestion we assumed.

> **Reframe:** "data ingestion" is less *get the data* (it's there) and more *reconcile
> four boundary systems onto our PIN + sub-area model.*

---

## Strategic implication: civic data is ward-native; PIN is for discovery

The most important structural signal from this audit: **the civic substance (your
corporator, sanitation, ward works) and the accountability destination (the issue
tracker) are inherently WARD-based, because the corporator owns a ward.** PIN code is how
a *resident finds* their area (familiar, address-shaped, good for SEO) — but the civic
layer is ward-native.

This pressures the two-tier `PIN → sub-area` model in `positioning.md` / CLAUDE.md. A
likely refinement: **PIN for entry/discovery, ward as the civic unit, sub-area as the
human-named locality.** Decide this before schema is written — it's a `CLAUDE.md`
"core architecture" change, painful to retrofit. (See brainstorming.md open Q on
geography being too rigid.)

---

## Dynamic vs static

- **Static (buildable now):** ward, population, corporator + contact, reps, amenities,
  boundaries, lakes/drains. Useful on day one. Refreshes per election / rarely.
- **Dynamic (the freshness layer #3, harder):** power outages and water cuts are
  published as **human-readable notices**, not structured feeds — scraping is fragile and
  area names are inconsistent. The freshness mechanism is real but messier than the
  static seed, and is where most of the integration risk sits.

---

## Recommended next steps

1. **Open and verify** the top sources hands-on: data.telangana.gov.in (API access +
   licence), OpenCity GHMC ward KML, TGSPDCL outage page structure, HMWSSB DivisionMap.
2. **Get the boundary polygons** (GHMC wards, and PIN-code boundaries if obtainable) and
   prototype the PIN↔ward crosswalk in PostGIS for 3 PINs.
3. **Decide the geography model** (PIN vs ward as civic unit) — blocks schema.
4. Only then design the wiki page template around data we've confirmed we can get.
