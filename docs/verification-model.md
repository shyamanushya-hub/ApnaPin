# ApnaPin — Verification Model

## Why Verification is the Core Mechanic

ApnaPin's value proposition is trusted local information. Without a credible verification model, it becomes another noisy feed — no different from a WhatsApp group.

Verification is not a feature. It is the foundation.

---

## Three Visual States (not a numeric score)

Every piece of content on ApnaPin exists in one of three states:

| State | Icon | Meaning |
|---|---|---|
| **Reported** | 🔴 | 1 person reported this. Unconfirmed. |
| **Community Verified** | 🟡 | 2+ trusted locals confirmed this. |
| **Officially Confirmed** | 🟢 | Evidence attached: photo, official notice, or complaint reference. |

Do not use a numeric confidence score (e.g., "92% confidence"). Users do not understand what it means, and it creates disputes ("why 88% and not 95%?"). Traffic-light states are universally understood.

---

## User Tiers (per PIN code)

Tiers are **per PIN code**, not global. A user who is Trusted in Bairamalguda starts as New in Jubilee Hills.

| Tier | Description | Verification weight |
|---|---|---|
| **New** | Recently joined this PIN code. Limited history. | 0.3× |
| **Trusted** | Established member. Consistent, accurate contributions. | 1.0× |
| **Moderator** | Appointed by existing moderators or activity threshold. | Instant verification |

### How New → Trusted promotion works (Phase 5)

A user becomes Trusted in a PIN code when all of the following are true:
- Minimum 30 days since joining that PIN code
- Minimum 10 posts/confirmations in that PIN code
- No moderation actions (false report, rejected issue) in last 90 days

This is activity-based, not manually granted. The first moderators in each PIN code are hand-picked by Arjun during launch.

---

## Verification Threshold

Content moves from Reported to Community Verified when its verification score reaches **2.0**.

```
verification_score = SUM(confirmation_weight for each confirmation)

New user confirmation:       +0.3
Trusted user confirmation:   +1.0
Moderator confirmation:      +2.0  (immediately verified)
```

**Why this prevents collusion:**
- 3 friends all create new accounts and confirm a false complaint → score: 0.9 (not verified)
- 2 Trusted users confirm → score: 2.0 (verified)
- 1 Moderator confirms → score: 2.0 (verified immediately)

Collusion requires corrupting Trusted users, which takes 30+ days of consistent honest activity per account. This is a high enough bar to deter most bad actors.

---

## Community Actions

Replace the upvote button with three specific, meaningful actions:

| Action | Label shown to user | What it signals |
|---|---|---|
| **Confirm** | "I can verify this" | I have personally witnessed this |
| **Affected** | "This impacts me" | This issue affects my daily life |
| **Resolved** | "I can confirm this is fixed" | I have personally seen the fix |

**Why not likes:** "Like" means nothing civic. "Confirm" means "I, a local resident, have seen this with my own eyes." The distinction matters enormously for data quality.

**Resolved confirmations:** 2+ Trusted user "Resolved" actions + at least 1 photo moves an issue to Resolved status.

---

## Staleness — Data Ages

Verified content that has not been re-confirmed within a period automatically downgrades to "Needs re-confirmation" status. It does not disappear — it is marked stale and the community is prompted to re-verify.

| Content type | Staleness threshold |
|---|---|
| Road / pothole issues | 30 days |
| Water / electricity issues | 30 days |
| Local business listings | 6 months |
| Civic contacts (councillor name, office number) | 1 year |
| General discussions / updates | No auto-staleness (discussions don't expire) |

**Why staleness is critical:** A "Verified" pothole from 8 months ago that was silently fixed is actively misleading. A user checking the app before they drive that route will avoid the road unnecessarily. Stale verified data erodes trust faster than no data.

---

## Moderator Role

Moderators can:
- Instantly verify content (their confirmation = 2.0 score)
- Merge duplicate issues
- Reject false reports (removes from feed, notifies author)
- Resolve disputes between conflicting confirmations
- Promote Trusted users (override the automatic threshold in exceptional cases)

Moderators cannot:
- Delete content permanently (only archive)
- Access private user data
- Post on behalf of other users

### Moderator appointment

**Phase 5 approach:** First moderators per PIN code are hand-picked by Arjun during launch in that area. Subsequent moderators are nominated by existing moderators and require approval from 2 existing moderators.

Do not use automated moderator election (too complex for early stage). Do not use application forms (no one fills them). Use relationship-based appointment: find active, trusted contributors and ask them directly.

---

## Contradiction Handling

What happens when 4 people confirm an issue is real and 2 people say it is already resolved?

Rules:
1. The most recent signal wins for status display.
2. Both sets of confirmations remain visible in the issue timeline.
3. If 2+ Trusted users confirm "Resolved" with photos, the issue moves to Resolved regardless of prior Confirm count.
4. If there is a genuine dispute (active community members disagree), a Moderator must adjudicate.

The issue timeline is always public and immutable — it shows the full history of confirmations, not just the current state.

---

## What Verification Does NOT Cover

- **Location accuracy** — ApnaPin cannot verify that a user actually lives at the PIN code they claim. Phone OTP confirms phone ownership only. GPS check-in (Phase 5+) can add a voluntary location signal.
- **Business legitimacy** — Verified business listings confirm the business operates in the area (community-confirmed), not that it is legally registered or licensed.
- **Government identity** — Official Channel badges are granted through a manual ops process, not automated government API integration (those don't reliably exist in India).

---

## Anti-Abuse Measures

| Risk | Mitigation |
|---|---|
| Fake accounts confirming false complaints | New user weight 0.3× — 3 new accounts ≠ verified |
| Businesses creating fake issues about competitors | Category-based rate limits: 1 issue per sub-area per user per 7 days |
| Political groups coordinating false reports | Moderator can reject + flag pattern; escalate to Arjun's team |
| Neighbour disputes weaponising the issue tracker | Issue must be about infrastructure/civic issues — personal disputes are out of scope |

Community health is not a Phase 5 problem. Build the basics (rate limits, tier weighting) from Phase 3.
