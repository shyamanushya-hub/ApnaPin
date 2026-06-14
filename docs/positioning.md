# ApnaPin — Positioning

## One line

ApnaPin is the **living profile of every locality in India** — what a place *is*, and
more importantly, what is *happening* there right now.

Static data answers **"What is this place?"** Community data answers **"What is
happening in this place?"** The second question is harder to answer and is where the
value lives.

---

## Brand broad, product narrow

The brand must be broad enough to grow into; the product can start narrow.

`ApnaPin` is the right name precisely because it carries no category baggage. A
descriptive name (`VillageInfo`, `AreaInfo`, `CityInfo`) would cage the product:

- Sounds like a government information site
- Excludes cities, neighbourhoods, apartment communities
- Excludes the future: issues, updates, discussions, community intelligence

Choosing a narrow brand and later trying to expand is harder than choosing a broad
brand and starting narrow.

---

## What ApnaPin is NOT

| Not this | Why |
|---|---|
| **VillageInfo / a directory site** | Static-data aggregators. The data is a commodity — replicable, hard to monetize, users rarely return. Useful once, not valuable repeatedly. |
| **MagicBricks / a real estate portal** | Real estate is a transaction-moment product. People visit to buy/rent/sell, then leave. A 20-year resident of Bairamalguda may use ApnaPin and never touch MagicBricks. |
| **A government information portal** | Government is a *participant*, not the owner. (See `core-principles.md` → "What ApnaPin is NOT".) |

---

## The unique combination

If successful, ApnaPin sits between products that already exist individually but never
together:

| Reference product | What ApnaPin borrows |
|---|---|
| **Google Maps** | Place information |
| **Wikipedia** | Community-maintained knowledge |
| **GitHub / JIRA** | Issue tracking |
| **Reddit** | Discussions |
| **MagicBricks** | Locality insights |

No single competitor spans this combination. That is the wedge.

---

## The core thesis: static is bootstrap, community is the moat

Sites like VillageInfo, PIN-code directories, census portals, and real-estate locality
pages already aggregate the static facts. **This is a good sign, not a bad one** — it
proves the static layer is a commodity and tells us *not* to spend two years building
the best static database.

**Static data (commodity — "What is this place?")**
Population, PIN code, district, ward, municipality, schools, hospitals, landmarks.
→ Use as **bootstrap content** so a page is never empty before its first user.

**Living data (the moat — "What is happening in this place?")**
Open issues, reliability, planned outages, road work, community notes, local
recommendations.
→ Compounds with every contribution. Cannot be scraped. Appreciates over time.

```
VillageInfo provides:  static facts  ("what is this place")
ApnaPin adds:          current reality ("what is happening here")
```

---

## Effort allocation

| Effort | Area |
|---|---|
| ~10% | Static data ingestion (LGD, Census, India Post) |
| ~90% | Updates · Issues · Verification · Search · Community Insights |

Static information gets people to the page. Community intelligence is what gives them a
reason to trust and return.

> **Caveat:** "10% effort" is a statement of *strategic priority*, not of difficulty.
> LGD/Census/India Post normalisation is genuinely messy (same village, 3 spellings —
> see `CLAUDE.md` → Key Warnings). Budget for data-cleaning *quality*; just don't
> over-invest in static *breadth* at the expense of the community layer.

---

## Page anatomy (the five sections of a locality page)

A PIN code / locality page is composed of five layers, not one feed:

1. **Area Profile** — static bootstrap data (population, ward, schools, contacts),
   community-verifiable and subject to staleness.
2. **Local Updates** — time-bound facts ("power cut tomorrow 10am–2pm").
3. **Civic Issues** — the structured 4-state tracker (`complaint-system.md`).
4. **Community Insights** — persistent local knowledge + reliability signals
   ("area floods in heavy rain", "ACT Fiber performs best here", power/water
   reliability). **← new layer; see open questions below.**
5. **Local Services** — local business directory (the monetization layer,
   `monetization.md` Stream 1).

The three content types in `CLAUDE.md` (Updates / Discussions / Issues) remain distinct.
Community Insights is a *fourth* primitive and Area Profile a fifth — they are not the
same as a `post` and must not be merged into the posts table.

---

## Investor framing

> ❌ "We're building VillageInfo." — data aggregation, easy to replicate, hard to
> monetize. *Not investable.*
>
> ✅ "We're building the living profile of every locality in India." — value grows over
> time through community contributions; the verified ground-truth layer is a moat no
> one else is building. *Investable.*

---

## Rollout: Hyderabad first

Per Principle 7 (small and deep), the first city is **Hyderabad**:

- GHMC is already the pre-configured authority in `complaint-system.md`.
- Seed a handful of real PIN codes deep, not the whole city shallow.
- Prove the static-bootstrap → community-intelligence flywheel in one city before
  expanding.

---

## Open questions raised by this positioning

These are flagged here and not yet decided. Resolve before the relevant schema is built.

1. **Reliability scores vs. the "no numeric score" rule.** A "Power Reliability 7.5/10"
   score reintroduces exactly what `verification-model.md` bans for verification
   ("don't use a numeric confidence score — creates disputes"). Decide: is reliability a
   traffic-light/qualitative signal, a derived metric (from outage-issue frequency), a
   periodic resident survey, or self-reported ratings? Each is a different data model and
   abuse surface.
2. **Community Insights data model.** Persistent local knowledge ("floods in heavy rain",
   "ACT Fiber best") is neither a time-bound Update, a workflow Issue, nor a threaded
   Discussion. It needs its own schema, its own verification path, and its own staleness
   rules. Design before building, per the "do not merge content types" rule.
