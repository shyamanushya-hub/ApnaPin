# ApnaPin — Core Principles

These principles govern every product decision. When two features are in tension, these are the tiebreakers.

---

## The One Rule

> Nothing important appears as fact until it has been verified by the community.

---

## Principle 1: Verified over Viral

Most platforms optimise for content that spreads. ApnaPin optimises for content that is true.

The metric is not shares, likes, or time-on-app. It is confirmation rate — what percentage of reported facts were verified by local residents.

**Implications:**
- The default feed shows verified content first. Unverified content is visible but visually subordinate.
- Features that make it easier to post without scrutiny weaken the product.
- Features that make scrutiny easier strengthen it.
- Engagement metrics (DAU, session length) are lagging indicators, not leading ones.

---

## Principle 2: Place before Person

Every piece of content is anchored to a geography first. The primary identity on ApnaPin is not a user profile — it is a PIN code membership.

You are "a resident of 500032," not "@username." This keeps the focus local and removes the incentive for personal reputation games or follower accumulation.

**Implications:**
- User tiers are per-PIN-code, not global. A person trusted in one area starts fresh in another.
- Profile pages are minimal. The locality page is the hero, not the user page.
- Content without a geographic anchor does not belong on ApnaPin.

---

## Principle 3: Community is the Authority

No machine decides what is true or what matters. Residents do, through structured confirmation.

Algorithms can sort and surface content. They cannot determine truth. Only people who live there can do that.

**Implications:**
- No AI-generated verdicts on whether a complaint is valid.
- No algorithmic feed that prioritises engagement over accuracy.
- Chronological + verification-weighted ordering, not virality ranking.
- Moderators are community members, not employees.

---

## Principle 4: Signal over Noise — by Design

WhatsApp groups are noisy because there is zero cost to posting a rumour. ApnaPin should have lightweight friction on unverified content — enough that people think before posting, not so much that it blocks legitimate reports.

**The mechanism:** Unverified posts display with a prompt — "1 person reported this. Can you confirm?" They become facts only after community confirmation. This is visible friction, not a hidden filter.

**Implications:**
- No anonymous posting (phone OTP links posts to a verified identity).
- Unverified content is always visually distinct from verified content.
- Duplicate reports are merged, not stacked — 5 people reporting the same pothole should create 1 issue with 5 confirmations, not 5 separate issues.

---

## Principle 5: Data Ages — Surface Staleness, Don't Hide It

A "Verified" pothole from 10 months ago with no updates is actively misleading. It is worse than showing nothing.

Verified content must carry a timestamp and auto-downgrade to "Needs re-confirmation" after a configurable period:
- Road, water, power issues: 30 days
- Local business listings: 6 months
- Civic contacts (councillor name, office numbers): 1 year

**Implications:**
- Staleness must be built before launch, not added later.
- The platform must prompt the community to re-verify aging content, not silently hide it.
- "Last confirmed" is as important as "First reported."

---

## Principle 6: Civic Value First, Engagement Second

The wrong success metric for ApnaPin is daily active users or session length. The right metrics are:
- Did someone find accurate information about their area?
- Was a civic issue resolved?
- Did a new resident understand their locality better?

This is not anti-growth. A platform people trust deeply attracts more people than one they are addicted to.

**Implications:**
- Do not add features that increase time-on-app without increasing usefulness.
- Notification defaults should be conservative — opt-in, not opt-out.
- The platform should sometimes tell users "nothing new in your area today" rather than surfacing low-quality content to fill the feed.

---

## Principle 7: Small and Deep beats Large and Shallow

It is better to be the definitive, trusted source for 500 PIN codes than a thin, noisy source for 19,101.

The rollout strategy must reflect this: go deep in a few cities first, get the trust model right, prove that the verified-data flywheel works, then expand.

**Implications:**
- Phase 1 target: 3 PIN codes. Not 19,101.
- Success in the first 3 PIN codes is a prerequisite for expansion, not a nice-to-have.
- Community moderators in the first localities are hand-picked and relationship-managed, not auto-assigned.

---

## What ApnaPin is NOT

- Not a social network (engagement is not the goal)
- Not another complaint portal (structured verification is the differentiator)
- Not a WhatsApp replacement (WhatsApp is for conversations; ApnaPin is for verified local knowledge)
- Not a government portal (government is a participant, not the owner)

**What it is:**

> The most trusted page about every locality in India.
