# ApnaPin — Tech Stack

All decisions are based on product requirements: scalability, developer velocity, ecosystem maturity, and operational simplicity for a solo founder in early stage. No decisions are based on personal language familiarity.

---

## The Guiding Principle

Use managed services aggressively early on. The goal is to ship a working demo and early product, not to build infrastructure. Every hour spent on ops is an hour not spent on product.

---

## Stack Overview

| Layer | Technology | Why |
|---|---|---|
| Frontend + API | Next.js 14 (TypeScript) | SSR for SEO, single language end-to-end |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent UI without design work |
| Database | PostgreSQL + PostGIS | Relational + geospatial, industry standard |
| Auth | Supabase Auth | Phone OTP out of the box, no custom auth code |
| Realtime | Supabase Realtime | Live feed updates, built into Supabase |
| Storage | Cloudflare R2 | Complaint photos, near-zero egress cost |
| Hosting | Vercel (frontend) | Zero config deploy, excellent Next.js integration |
| Managed DB | Supabase | PostgreSQL with zero ops, free tier covers demo |
| CDN | Cloudflare | India-friendly PoPs, R2 is native |
| Search | pg_trgm (Phase 1–7) → Elasticsearch (Phase 8+) | Start simple, scale when needed |

---

## Why Next.js (not a separate frontend + backend)

**The requirement:** PIN code pages at `/pin/500032` must be server-side rendered for Google to index them. Without SSR, a locality page that Google cannot crawl is invisible to someone searching "Bairamalguda news" or "500032 updates." SEO is existential for this product — it is the primary user acquisition channel.

**Next.js App Router** gives SSR with a full TypeScript API layer. In early stages, API routes inside Next.js handle the backend logic. No separate server to deploy, no separate language to context-switch between.

**When to extract the backend:** When you need long-running background jobs (data ingestion pipelines), when Next.js API routes become a bottleneck, or when the team grows and frontend/backend separation becomes important. Phase 4–5 is the realistic point for this.

**Why not a separate Go or Python backend from day one:** The overhead of maintaining two separate services, two deployments, two sets of environment variables, and a CORS configuration adds friction with zero benefit at demo and early stage. Premature separation is technical debt, not technical rigour.

---

## Why Supabase

Supabase is the right choice because it collapses four separate services into one:

1. **PostgreSQL** — the actual database, with full SQL, PostGIS, and pg_trgm
2. **Auth** — phone OTP (critical for India), email OTP, JWT handling
3. **Realtime** — Postgres change streams exposed via WebSocket. New posts appear in the feed without polling.
4. **Storage** — file uploads with access control (though Cloudflare R2 is used for complaint photos because egress is cheaper)

**Free tier limits:** 50,000 MAU, 500MB database, 1GB storage. This covers the demo and the first few thousand users comfortably.

**When to move off Supabase:** When you exceed free tier and the Pro plan cost is justified by revenue. The Pro plan is $25/month — not a concern for a long time.

---

## Why PostgreSQL + PostGIS

PIN code lookup and sub-area queries are geographic. PostGIS enables:
- Storing PIN code boundaries as polygons
- "Find all sub-areas within PIN code 500032" as a spatial query
- Future: "Find all issues within 2km of this location"

PostgreSQL is the standard for structured civic data. It handles full-text search (pg_trgm), JSON columns for flexible metadata, and concurrent reads well into millions of rows without special configuration.

---

## Why Cloudflare R2 for Storage

Complaint photos are the highest-volume storage need. Cloudflare R2 has:
- Zero egress fees (unlike AWS S3, which charges per GB served)
- Cloudflare CDN built in — photos are served from the nearest PoP to the user
- Simple API compatible with AWS S3 SDK

For a civic app where every complaint has 1–3 photos, egress cost compounds quickly. R2 eliminates this entirely.

---

## Why Vercel for Frontend Hosting

- Zero configuration for Next.js — it is built by the same team
- Automatic preview deployments on every pull request
- Edge functions for PIN code pages (fast SSR globally)
- Free tier covers demo and early users

---

## Search Strategy

**Phase 1–7:** PostgreSQL full-text search with `pg_trgm`.

```sql
CREATE INDEX posts_body_trgm_idx ON posts USING GIN (body gin_trgm_ops);
SELECT * FROM posts WHERE body % 'pothole bairamalguda';
```

This handles fuzzy search across posts within a PIN code well enough for tens of thousands of posts. No separate search infrastructure.

**Phase 8+:** Add Elasticsearch or OpenSearch when:
- Search needs to span across PIN codes (city-wide search)
- Relevance ranking needs to be more sophisticated
- Full-text search in Hindi and regional languages requires language-specific analysers

Do not add Elasticsearch early. It is operational overhead with no benefit at small scale.

---

## TypeScript Everywhere

Using TypeScript end-to-end (Next.js frontend + API routes) means:
- One language — no context switching
- Shared types between frontend and API (e.g., `Post`, `Issue`, `SubArea` types used in both)
- Supabase generates TypeScript types from the database schema automatically

This is a significant velocity advantage for a solo founder.

---

## Infrastructure Cost at Demo Stage

| Service | Cost |
|---|---|
| Supabase | Free (≤50K MAU, ≤500MB) |
| Vercel | Free (hobby tier) |
| Cloudflare R2 | Free (10GB storage, 10M reads/month) |
| Cloudflare CDN | Free |
| **Total** | **₹0/month** |

First paid tier kicks in when either Supabase Pro ($25/month) or Vercel Pro ($20/month) is needed. That is ₹3,500–4,000/month combined — reasonable for a product with early paying users.

---

## What This Stack Does NOT Include (yet)

- **Redis** — not needed until session caching or rate limiting at scale becomes a problem. Supabase handles sessions. Phase 6+.
- **Message queues (SQS, RabbitMQ)** — not needed until background job complexity warrants it. Phase 7+.
- **Kubernetes / Docker Swarm** — not needed. Vercel and Supabase are fully managed. Do not containerise the demo.
- **Separate mobile app (React Native)** — PWA (Next.js running in mobile browser) is sufficient for demo and early launch. React Native app is Phase 8+ when there is proven demand.
- **Elasticsearch** — Phase 8+, as above.
