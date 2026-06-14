# ApnaPin — MVP Scope

## What we are building first

A responsive web app (works on all devices and OS, no app store needed) where:

1. Every PIN code, area, and locality has an **editable information page** maintained by the community
2. Every location has a **discussion space** where verified residents can post — with optional anonymity

That's it. Nothing else in MVP.

---

## The three-level hierarchy

```
/pin/500032                          → PIN code page
/pin/500032/bairamalguda             → Area page
/pin/500032/bairamalguda/shivam-apts → Locality page
```

Every level gets the same structure:
- Info cards (editable by any logged-in user)
- List of children (areas within PIN, localities within area)
- Discussion feed

---

## What each location page looks like

```
┌─────────────────────────────────────────┐
│  ApnaPin              [Search] [Sign in]│
├─────────────────────────────────────────┤
│  India > Telangana > 500032 > Bairamalguda
│                                         │
│  Bairamalguda                           │
│  500032 · GHMC · Hyderabad              │
├──────────────────────────────┬──────────┤
│ 🏛 Ward / Councillor         │ [Edit]  │
│ Ward 102 · Name: [value]     │         │
├──────────────────────────────┼──────────┤
│ 🏥 Nearest Hospital          │ [Edit]  │
│ [value or "Add info"]        │         │
├──────────────────────────────┼──────────┤
│ 🚔 Police Station            │ [Edit]  │
│ [value or "Add info"]        │         │
├──────────────────────────────┼──────────┤
│ 🏫 School / College          │ [Edit]  │
│ [value or "Add info"]        │         │
├─────────────────────────────────────────┤
│ Localities in Bairamalguda       [+ Add]│
│  · Shivam Apartments                   │
│  · Green Valley Colony                 │
│  · Sai Nagar                           │
├─────────────────────────────────────────┤
│ DISCUSSION                    [+ Post] │
│                                         │
│ [post] [post] [post]                   │
└─────────────────────────────────────────┘
```

**Rules:**
- Info section is compact — max 6 cards. Discussion starts without scrolling past a wall of info.
- Every info card has an inline Edit button. Clicking turns the value into an editable field. No separate edit page.
- "Add info" placeholder shows for empty fields — signals the page is community-maintained, not broken.
- Discussions are flat in the feed. Tap a post to see its thread.

---

## Information fields (predefined keys)

These are the standard fields shown on every location page. Empty fields show "Add info" prompts.

| Key | Label | Levels |
|---|---|---|
| `councillor_name` | Ward Councillor | area |
| `councillor_phone` | Councillor Phone | area |
| `police_station` | Police Station | pin, area |
| `police_phone` | Police Phone | pin, area |
| `hospital` | Nearest Hospital | pin, area |
| `phc` | Primary Health Centre | area |
| `post_office` | Post Office | pin |
| `school` | School / College | area, locality |
| `description` | About this area | all levels |
| `rwa_name` | RWA / Association | locality |
| `rwa_contact` | RWA Contact | locality |

Users can also add freeform custom fields. Predefined keys get structured display icons; custom fields display as plain text.

---

## Discussions

### Who can post
- Must be signed in (phone OTP via Supabase Auth)
- No restriction on which PIN code you post in — location-based restriction comes later

### Display name options
Users set a default in their profile, overridable per post:

| Option | Displayed as |
|---|---|
| Named | "Arjun" (their chosen display name) |
| Anonymous | "Resident of 500032" |

Internally, every post has `author_id` (UUID). "Anonymous" is a display setting, not a bypass of authentication. Moderation can still act on anonymous posts.

### Discussion structure
- Posts are flat in the location feed (title + 2-line preview)
- Tap to open full post and see replies
- Replies are threaded (one level of nesting in MVP; deep nesting later)
- No post types in MVP — just free text. Add "Update / Discussion / Issue" types in Phase 6.

### What people can post about
No category restriction in MVP. Real examples of what will appear:
- "Anyone know a good plumber near Bairamalguda?"
- "Power cut scheduled tomorrow 10am–2pm, TSSPDCL confirmed"
- "New park construction started near main road"
- "Water supply disrupted in Shivam Apartments this week"

---

## Auth flow

1. User clicks "Sign in"
2. Enter phone number (Indian mobile, +91 prefix)
3. Supabase sends OTP SMS
4. Enter 6-digit OTP → signed in
5. First time: prompted to set a display name (or skip — defaults to anonymous)

No email, no password, no Google OAuth in MVP. Phone OTP only. It is appropriate for India and requires zero custom auth code.

---

## What is explicitly NOT in MVP

- Complaint / issue tracker (Phase 6)
- Trust tiers (Phase 6)
- Verification of info edits — any logged-in user can edit any field (wiki model)
- Push notifications
- Search
- Moderation tools beyond basic post reporting (Phase 4)
- Business listings
- Official government channels
- Native mobile app

---

## Data seeding plan

Arjun seeds initial data manually:
1. Run LGD ingestion script → creates all PIN codes and LGD-mapped areas in the database
2. Manually add detail fields (councillor, police station, hospital) for the first 3–5 PIN codes
3. Invite a handful of friends/contacts from those areas to try it and add/correct info
4. Seed 3–5 realistic discussion posts per PIN to make pages look alive

**Starting PIN codes (pick your own area + 1–2 others you know well):**
- One urban Hyderabad PIN (e.g. 500032)
- One peri-urban / town PIN
- One rural/semi-rural PIN

Accuracy matters for the first few pages — these are what you will show to people. Don't seed fake data.

---

## Definition of done for MVP

- [ ] Opens on mobile Chrome / Safari without installing anything
- [ ] Works on slow 4G — pages load under 2 seconds, no large JS bundles
- [ ] PIN / area / locality pages render with real data from database (SSR)
- [ ] Info cards are editable inline by logged-in users
- [ ] Phone OTP login works with real SMS
- [ ] Users can post a discussion message and it appears immediately (Supabase Realtime)
- [ ] Users can reply to a post and see the thread
- [ ] Anonymous posting works (shows "Resident of 500032")
- [ ] Pages look clean on a phone — not designed, but not embarrassing
- [ ] RLS policies on all tables — unauthenticated users cannot write anything

---

## Build sequence within MVP

Work in this order. Each step is deployable and demonstrable.

**Step 1:** Next.js scaffold + Supabase project + env vars working locally  
**Step 2:** LGD ingestion script — run once, populates `locations` table  
**Step 3:** `/pin/[code]` page renders from database (SSR, read-only)  
**Step 4:** Area and locality pages (`/pin/[code]/[area]`, `/pin/[code]/[area]/[locality]`)  
**Step 5:** Phone OTP login via Supabase Auth  
**Step 6:** Editable info cards — authenticated users can update fields  
**Step 7:** Post a discussion — text input, submit, appears in feed  
**Step 8:** Replies — threaded under a post  
**Step 9:** Anonymous / named display name option  
**Step 10:** Mobile polish — test on real phone, fix spacing and tap targets  

Each step is a commit. Each step works end-to-end before moving to the next.
