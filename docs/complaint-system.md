# ApnaPin — Complaint / Issue Tracker Design

## Overview

The issue tracker is a JIRA-style civic complaint system anchored at the sub-area level. It is one of the most differentiated parts of ApnaPin — structured local issue tracking with public status history, community verification, and accountability timelines.

Most platforms have discussions, comments, and posts. Very few have verified issue tracking with a public resolution record.

---

## The Four States (and only four)

```
Reported → Verified → In Progress → Resolved
```

Do not add more states. Additional information (authority notified, tweet link, complaint number) is attached as evidence comments on state transitions, not as separate states. Complexity in the workflow kills adoption.

| State | Meaning | Who can set it |
|---|---|---|
| **Reported** | 1 person filed the issue | Any member |
| **Verified** | Community confirmed the issue exists | Auto: 2+ trusted confirmations |
| **In Progress** | Evidence of action attached | Any member, with evidence |
| **Resolved** | Community confirmed the fix | Trusted user + photo confirmation |

---

## What ApnaPin Never Does

ApnaPin does **not** resolve issues. The community does.

Status language must always attribute resolution to the community, never to the authority:

❌ "GHMC resolved this issue."  
✅ "3 residents confirmed repair on 12 Jun 2026. Photos attached."

❌ "Status: Fixed by Municipal Corporation."  
✅ "Status: Community Resolved · Last confirmed by 4 residents."

This is not a technicality. It is legal protection and product positioning. If ApnaPin claims an authority resolved something that wasn't actually fixed, the platform becomes liable for misinformation.

---

## Issue Data Model

```sql
issues (
  id              UUID PRIMARY KEY,
  pin_code        CHAR(6) NOT NULL,
  sub_area_id     UUID REFERENCES sub_areas(id),
  author_id       UUID REFERENCES users(id),
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT CHECK (category IN ('road', 'water', 'electricity', 'sanitation', 'safety', 'other')),
  status          TEXT CHECK (status IN ('reported', 'verified', 'in_progress', 'resolved')) DEFAULT 'reported',
  photo_urls      TEXT[],
  location_text   TEXT,         -- "near XYZ School, main road"
  confirmation_score FLOAT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  resolved_at     TIMESTAMPTZ,
  stale_at        TIMESTAMPTZ   -- auto-computed: created_at + 30 days
)

issue_confirmations (
  id          UUID PRIMARY KEY,
  issue_id    UUID REFERENCES issues(id),
  user_id     UUID REFERENCES users(id),
  type        TEXT CHECK (type IN ('confirm', 'affected', 'resolved')),
  note        TEXT,
  photo_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (issue_id, user_id, type)
)

issue_evidence (
  id          UUID PRIMARY KEY,
  issue_id    UUID REFERENCES issues(id),
  user_id     UUID REFERENCES users(id),
  type        TEXT CHECK (type IN ('tweet_link', 'complaint_number', 'email_ref', 'photo', 'official_notice')),
  value       TEXT,             -- URL, complaint number, etc.
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
)
```

---

## Verification Threshold

An issue moves from `Reported` to `Verified` when its `confirmation_score` reaches 2.0.

Confirmation score is weighted by tier:
- New user "Confirm": +0.3
- Trusted user "Confirm": +1.0
- Moderator "Confirm": +2.0 (immediately verified)

This prevents collusion: 3 new accounts confirming something (0.9 total) cannot verify an issue. It takes 2 trusted users or 1 moderator.

---

## Community Actions (not likes)

Three actions replace the upvote button:

| Action | Label | What it means |
|---|---|---|
| **Confirm** | "I can verify this" | I have seen this issue myself |
| **Affected** | "This impacts me" | I am affected by this issue |
| **Resolved** | "I can confirm this is fixed" | I have seen the fix in person |

"Resolved" confirmations from 2+ trusted users + at least 1 photo moves the issue to `Resolved`.

---

## Twitter / X Complaint Generator

ApnaPin does **not** post to Twitter/X on behalf of users. Instead, it generates ready-to-post text that the user can copy and post themselves.

This is the correct approach because:
1. A tweet from a real resident is more credible than a bot post from an app
2. ApnaPin avoids liability for content posted on external platforms
3. Users build a habit of civic engagement, not dependence on the app

**Generated tweet template:**

```
@{authority_handle} Pothole reported near {location}, {area_name} ({pin_code}).
{confirmation_count} residents affected. {photo_count} photos attached.
Issue open since {days_open} days. #ApnaPin #{city}
```

Authorities to pre-configure per city: GHMC, NMMC, BBMP, BMC, MCD, etc.

**Evidence that can be attached to "In Progress":**
- Tweet link (after user posts)
- Complaint number (GHMC complaint portal, etc.)
- Email reference number
- Official notice photo

---

## Area Dashboard

Once sufficient data exists per locality, the area page shows a 12-month civic accountability timeline:

```
Bairamalguda · Last 12 Months
────────────────────────────────────────
Road issues:         23 reported · 19 resolved · avg 14 days
Water issues:        8 reported  · 6 resolved  · avg 22 days
Electricity issues:  12 reported · 11 resolved · avg 4 days
────────────────────────────────────────
Overall resolution:  83%
```

This data does not exist anywhere else. It is ApnaPin's unique civic asset.

---

## Duplicate Detection

Before an issue is created, the app checks for open issues in the same sub-area with a similar category filed in the last 30 days. If found:

- Show the existing issue
- Ask: "Is this the same problem? Add your confirmation instead of creating a new report."

Deduplication keeps the issue tracker clean and makes confirmation counts meaningful.

---

## What is NOT in the Initial Build

- Automatic posting to Twitter/X (user always posts manually)
- Government API integrations (GHMC, etc. do not have reliable public APIs)
- AI-generated issue descriptions
- Escalation workflows with email automation
- Multi-city aggregation dashboards (Phase 8+)

Start with: create issue → upload photo → change status → add evidence comment → generate complaint text. That is enough for the demo and early launch.

---

## Staleness

Issues auto-downgrade to "Needs re-confirmation" after 30 days with no activity. This prevents the tracker from accumulating stale "Verified" issues that were resolved months ago but never marked as such.

Resolved issues are archived after 90 days but remain searchable for the accountability timeline.
