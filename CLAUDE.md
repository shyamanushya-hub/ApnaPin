# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# ApnaPin — Claude Code Context

## Current Repository State (read this first)

Step 0 (dev environment) is **done**. The repo is now a working Next.js + local Supabase project that builds and serves pages — but it has **no seeded data yet**.

What physically exists on disk right now:
- `CLAUDE.md` (this file) and `docs/*.md` — design and architecture specs
- `*.docx` — product plan drafts (v3–v5; v5 is current) and the one-pager
- `package.json` + `node_modules/` — Next.js 14.2.3, React 18, `@supabase/supabase-js`, `@supabase/ssr`
- `next.config.mjs` (note: `.mjs`, not `.ts` — Next 14 rejects a TS config)
- `app/` — home page + scaffolded routes `/pin/[code]`, `/pin/[code]/[area]`, `/pin/[code]/[area]/[locality]`
- `lib/supabase/{client,server}.ts` — browser + server Supabase clients
- `supabase/config.toml` + `supabase/migrations/001_initial.sql` — the schema (3 tables, RLS, realtime)
- `.env.local` (gitignored) — points at the **local** stack `http://127.0.0.1:54321`
- A git repo (`git init` done; **no commits yet** — working tree is unstaged)

Local stack (via Docker Desktop + `npx supabase start`):
- API/gateway → `http://127.0.0.1:54321`  ·  Studio → `http://127.0.0.1:54323`  ·  DB → `127.0.0.1:54322`  ·  Mailpit (catches OTP emails) → `http://127.0.0.1:54324`
- Migrations applied: `001_initial.sql` (`locations`, `location_details`, `posts` + RLS + realtime) and `002_grants.sql` (API-role table grants — **001 omitted these, so every query failed "permission denied" until 002**; do not drop it).
- **Seeded data: PIN 500032 (Gachibowli, Hyderabad)** via `scripts/seed-pincode.ts` from public India Post API (`api.postalpincode.in`, no key). Areas: Gachibowli, Manuu. Other PINs/tables still empty.

Verified working: `npm run build` exits 0; `npm run dev` serves `localhost:3000` (HTTP 200). `/pin/500032` correctly 404s because no location rows exist yet.

**Known issue to clear before step 1:** `next@14.2.3` has open CVEs (1 critical among 10). Bump to the latest `14.2.x` patch before ingesting real data.

The immediate next step is `docs/step-1-lgd-data.md` → download/inspect LGD data and write the ingestion script (`scripts/ingest-lgd.ts`).

## Commands

⚠️ None of these work yet — there is no `package.json`. They apply **after** the Next.js project is scaffolded per `docs/step-0-setup.md`.

Scaffold (one-time):
```
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
npm install @supabase/supabase-js @supabase/ssr
npm install -D supabase
```

Day-to-day (once scaffolded):
```
npm run dev      # Next.js dev server → localhost:3000
npm run build    # production build
npm run lint     # ESLint (next lint)
```

Supabase / data:
```
supabase link --project-ref <ref>     # link local to Mumbai (ap-south-1) project
supabase db push                      # apply migrations in supabase/migrations/
npx tsx scripts/ingest-lgd.ts         # LGD → PostgreSQL ingestion
```

Required env vars in `.env.local` (never committed):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

---

## What is ApnaPin?

ApnaPin is a hyperlocal civic information and community platform for India, organised by PIN code. Every locality gets an editable information page and a community discussion space — all anchored to a verified geographic identity.

**Mission:** The most trusted page about every locality in India.

**Domains:** apnapin.com, apnapin.in (registered)
**Stage:** Pre-prototype. Planning complete. Building starts now.
**License intent:** AGPL-3.0 (open source after first working demo)

---

## Who is building this

**Arjun** — founder. Strong systems programming background. Building with Claude Code assistance, phase by phase.

**How to work with Arjun:**
- He reasons about architecture well — use real explanations, not oversimplified ones
- He prefers building correctly over quickly — do not suggest shortcuts that create architectural debt
- Always explain *why* before *what*
- Tech stack decisions are based on product merit only — do not bias toward any language based on his background

---

## Core Principles

See `docs/core-principles.md` for the full list. The short version:

1. **Verified over Viral** — accuracy rate matters more than engagement rate
2. **Place before Person** — identity is a PIN code membership, not a user profile
3. **Community is the Authority** — residents determine truth, not algorithms
4. **Signal over Noise** — verified content is default; unverified is clearly subordinate
5. **Data Ages** — stale verified data is worse than no data; surface staleness explicitly
6. **Civic Value First** — success metric is usefulness, not time-on-app
7. **Small and Deep** — go deep in fewer places before expanding

**The single rule that governs all product decisions:**
> Nothing important appears as fact until it has been verified by the community.

---

## Tech Stack

See `docs/tech-stack.md` for full rationale.

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14+ (App Router, TypeScript) | SSR for SEO on location pages |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent, no custom CSS |
| Database | PostgreSQL + PostGIS via Supabase | Relational + geospatial, managed |
| Auth | Supabase Auth (phone OTP) | India-appropriate, zero custom auth code |
| Realtime | Supabase Realtime | Live discussion updates |
| Storage | Cloudflare R2 | Photos, near-zero egress cost |
| Hosting | Vercel | Zero-config Next.js deployment |
| CDN | Cloudflare | Free, India PoPs |
| Search | pg_trgm initially → Elasticsearch at scale | Start simple |

**Total cost at MVP stage: ₹0/month** (all free tiers)

**Web app first.** Responsive design works on all devices and OS from day one. No native app needed for MVP. Android users can "Add to Home Screen" for an app-like experience.

---

## Core Architecture Decisions (DO NOT change without discussion)

### 1. Three-level geographic hierarchy

```
PIN Code         (e.g. 500032 — postal area)
  └── Area       (e.g. Bairamalguda — ward, locality, or village)
       └── Locality  (e.g. Shivam Apartments, Green Valley Colony)
```

- "Area" is a flexible concept — could be a ward in a city, a locality in a town, a village in a rural PIN
- "Locality" is the most granular level — an apartment complex, colony, or named street cluster
- All three levels get their own URL, info page, and discussion feed
- Pre-seeded from LGD data where available; Arjun adds initial data manually; users can add more

**URLs:**
```
/pin/500032
/pin/500032/bairamalguda
/pin/500032/bairamalguda/shivam-apartments
```

### 2. Location hierarchy data model

```sql
locations (
  id          UUID PRIMARY KEY,
  parent_id   UUID REFERENCES locations(id),
  level       TEXT CHECK (level IN ('pin', 'area', 'locality')),
  pin_code    CHAR(6) NOT NULL,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (pin_code, slug)
)

location_details (
  location_id  UUID REFERENCES locations(id),
  key          TEXT NOT NULL,   -- 'councillor_name', 'police_station', 'hospital', etc.
  value        TEXT NOT NULL,
  updated_by   UUID REFERENCES auth.users(id),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (location_id, key)
)
```

### 3. Threaded discussions — adjacency list with materialised path

```sql
posts (
  id           UUID PRIMARY KEY,
  location_id  UUID REFERENCES locations(id),
  parent_id    UUID REFERENCES posts(id),
  path         TEXT,            -- materialised path e.g. '1.4.7' for thread nesting
  author_id    UUID REFERENCES auth.users(id),
  display_name TEXT,            -- "Arjun" or NULL (shows as "Resident of 500032")
  body         TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
)
```

Do NOT build flat posts and add threading later — it is a painful migration.

### 4. Anonymous-but-verified posting model

Every post is linked to a verified phone number internally. Publicly, users choose:
- **Named:** shows their chosen display name ("Arjun")
- **Anonymous:** shows as "Resident of 500032" (or the relevant PIN code)

This gives accountability for moderation while allowing users to post sensitive civic topics without their name attached. There is no fully unverified posting — phone OTP is the minimum bar.

### 5. Information pages are community-maintained wikis

Each location's info fields (councillor name, police station, hospital, key contacts) are editable by any authenticated user. No approval workflow in MVP — trust the community, watch for abuse, add moderation when needed.

The `location_details` table stores key-value pairs per location. Predefined keys have structured display; unknown keys fall back to plain text.

### 6. Page must be useful before first user

LGD + India Post data seeds PIN codes and area names at launch. Arjun manually adds initial detail (councillor names, key contacts) for the first few PIN codes. A page with zero community posts still shows useful civic info.

### 7. Containment vs. attached data are separate axes (migration 003)

The PIN→area→locality tree stays **3 levels** — do not add more. Facilities,
stats, and ratings are NOT levels; they attach to a location:

- `places` — typed POIs (hospital/police/school…), many per location, from OSM (ODbL)
- `location_stats` — numeric facts with provenance (Census 2011), service_role-write only
- `ratings` — per-dimension community scores; `location_rating_summary` view gives avg+count
- `locations.{lat,lng,boundary}` — geo for the map (PostGIS enabled)

**Population is bottom-up, never top-down.** A PIN is a postal construct with no
census population. So population is community-reported at **leaf** units (a
locality, or a childless area) and summed upward (`lib/population.ts`); the PIN/
area value is always the computed sum, shown with completeness ("N of M"). Never
store a PIN's own population or divide a city figure down to a PIN.

Controlled vocab (categories/dimensions/stat keys) lives in `lib/types.ts`, not
the DB. Full spec + data-source legality: **`docs/location-data-model.md`**.

---

## MVP Build Phases

See `docs/mvp-scope.md` for full definition of done.

### Phase 1 — Location Pages (information layer)
- LGD data ingestion script → seeds PIN codes and areas into `locations` table
- `/pin/[code]` page: shows area list + editable info cards
- `/pin/[code]/[area]` page: shows locality list + editable info cards
- `/pin/[code]/[area]/[locality]` page: info cards
- All pages SSR (Next.js App Router)
- Read-only at this stage

### Phase 2 — Auth + Editable Info
- Supabase phone OTP login
- "Edit" button on each info card — authenticated users can update any field
- Change history visible (who updated, when)
- Basic Supabase RLS policies: anyone reads, authenticated users write

### Phase 3 — Discussions ★ Day 1 feature
- Post + threaded reply at any location level
- Anonymous or named (user chooses per post or sets default)
- Flat feed on location page; tap a post to see thread
- Supabase Realtime — new posts appear without page reload
- No moderation tools yet — watch the first real users

### Phase 4 — Moderation Basics
- Report a post (sends to Arjun's admin view)
- Admin can delete posts
- Rate limiting: max 5 posts per user per hour per location

### Phase 5 — Open Source Launch
- Clean up code, write README with mission + setup instructions
- Push to GitHub under AGPL-3.0
- Post on Hacker News (Show HN) + civic tech communities

### Phase 6 — Verification Layer (future)
- Community confirmation on info edits
- Verified vs unverified content distinction
- Issue / complaint tracker (see `docs/complaint-system.md`)
- Trust tiers per PIN code

---

## Data Sources (free, no legal issues)

| Source | What it provides | URL |
|---|---|---|
| LGD (MeitY) | PIN → village/ward mapping | lgdirectory.gov.in |
| India Post | PIN code master list | indiapost.gov.in |
| OpenStreetMap | Boundaries, locality names | openstreetmap.org (ODbL license) |
| Data.gov.in | Government open data | data.gov.in |
| Wikidata | Civic data (CC0 license) | wikidata.org |
| Census 2011 | Population (display with label) | censusindia.gov.in |

---

## Repository Structure

```
apnapin/
├── app/
│   ├── pin/
│   │   └── [code]/
│   │       ├── page.tsx              # PIN code page
│   │       └── [area]/
│   │           ├── page.tsx          # Area page
│   │           └── [locality]/
│   │               └── page.tsx      # Locality page
│   └── api/
│       ├── posts/route.ts
│       └── locations/route.ts
├── components/
│   ├── LocationInfoCard.tsx
│   ├── DiscussionFeed.tsx
│   └── PostComposer.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── types.ts
├── scripts/
│   └── ingest-lgd.ts
├── supabase/
│   └── migrations/
├── data/
│   ├── lgd/
│   └── census/
├── docs/
│   ├── mvp-scope.md           ← start here
│   ├── core-principles.md
│   ├── complaint-system.md    ← future phase
│   ├── verification-model.md  ← future phase
│   ├── monetization.md
│   ├── tech-stack.md
│   └── step-0-setup.md
└── CLAUDE.md
```

---

## Key Warnings

1. **LGD data is messy** — same village has 3 spellings across LGD, Census, and India Post. Normalise before displaying.
2. **Supabase free tier limits** — 50,000 MAU, 500MB DB, 1GB storage. Fine well into early growth.
3. **Content moderation** — no automated tool works for Hindi + regional Indian languages. Watch manually at first; add reporting tools in Phase 4.
4. **Census 2011 data** — 15 years old. Always display with "Census 2011" label.
5. **RLS policies are security** — enable Row Level Security on every table from day one. Supabase makes this easy; skipping it is not an option.
6. **Anonymous ≠ unaccountable** — every post has a user_id internally. "Anonymous" is a display choice, not a bypass of auth.

---

## Current Status

- [x] Product plan complete (ApnaPin_Product_Plan_v5.docx)
- [x] One-pager complete (ApnaPin_OnePager.docx)
- [x] Domains registered (apnapin.com, apnapin.in)
- [x] Architecture decisions locked
- [x] Core principles defined
- [x] MVP scope defined (docs/mvp-scope.md)
- [x] Complaint system designed (docs/complaint-system.md — Phase 6)
- [x] Verification model designed (docs/verification-model.md — Phase 6)
- [x] Monetization strategy defined (docs/monetization.md)
- [x] Dev environment setup → docs/step-0-setup.md (done 2026-06-13)
- [x] Supabase running **locally** via Docker (`npx supabase start`) — no cloud project yet
- [x] Next.js project scaffolded — builds clean, serves localhost:3000
- [x] Schema applied locally (`001_initial.sql`: locations, location_details, posts + RLS)
- [x] Phase 2 auth (partial): phone-OTP **sign-in + sign-up** working locally
      - `app/sign-in`, `app/sign-up`, `app/auth/sign-out`, `middleware.ts`, `lib/supabase/*`
      - Local OTP via `[auth.sms.test_otp]`: `9876543210`/`8888888888` → code `123456`
      - First/last name stored in auth `user_metadata` (no profiles table yet)
      - **Requires `@supabase/ssr` >= 0.4** (getAll/setAll API). 0.3.x silently drops the
        session cookie — do not downgrade.
- [x] First location page working with **real public data** (PIN 500032 via India Post)
      - `scripts/seed-pincode.ts [PIN]` — idempotent, service-role, no API key
- [x] **Facilities + Map** for 500032 — 114 real POIs from OpenStreetMap
      - `scripts/ingest-osm.ts [PIN] [radius]` — Nominatim geocode + Overpass → `places`
      - Map: Leaflet/react-leaflet (v4, React-18 pinned) + OSM tiles, client-only (`ssr:false`)
      - **OSM attribution** ("© OpenStreetMap contributors") is shown on the page — keep it
- [x] **Tabbed location pages + design system** ("civic editorial")
      - All 3 levels share `components/location/LocationView.tsx` → hero + `LocationTabs`
        (Overview / Facilities / Issues / Local info / Discussion). Pages just fetch + delegate.
      - Tabs: all panels SSR'd, hidden (not unmounted) → crawlable + instant switching.
      - Fonts: **Fraunces** (display) + **IBM Plex Sans** (body) via `next/font`.
        Palette in `tailwind.config.ts`: `paper` bg, `ink` text, `line` borders,
        `brand.blue` primary, `saffron` accent. Don't reintroduce Inter/white.
- [x] **Civic issue tracker — first slice** (`docs/complaint-system.md`)
      - Migration 006: `issues` + `issue_confirmations` + `issue_evidence` + `issue_action_summary` view
      - Issues tab: 4-state list (Reported→Verified→In Progress→**Community Resolved**) + authed
        report composer. **First write path through the app** (`ReportIssue.tsx`, RLS author=auth.uid()).
      - Deferred: weighted confirm-scoring/auto-transitions, photo upload (needs R2/storage),
        evidence UI, X/tweet generator, accountability dashboard. Sample issues seeded for 500032.
- [ ] Bump `next` off 14.2.3 (CVE) before step 1
- [ ] LGD data downloaded and inspected → docs/step-1-lgd-data.md
- [ ] Wire `/search?pin=` route (home search box currently 404s)
