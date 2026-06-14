# ApnaPin — Infrastructure & Backend

## Architecture in one line

```
Browser → Vercel (Next.js) → Supabase (PostgreSQL + Auth + Realtime)
```

No separate backend server. No Docker. No Redis. No message queues. Not in MVP.

---

## What each layer does

### Vercel — Next.js host

- Serves server-side rendered (SSR) location pages — critical for Google indexing
- Hosts API routes (`app/api/`) for mutations (post, edit, auth callbacks)
- Auto-deploys on every `git push main` in ~2 minutes
- Preview URL for every pull request
- Free hobby tier covers everything until significant traffic

### Supabase — everything data

Four services in one, zero ops:

| Service | Used for |
|---|---|
| **PostgreSQL** | All application data — locations, details, posts |
| **Auth** | Phone OTP login — no custom auth code |
| **Realtime** | Live discussion feed — new posts appear without page reload |
| **Storage** | Not used in MVP (R2 when complaint photos are added) |

Region: **ap-south-1 (Mumbai)** — lowest latency for Indian users.

### Cloudflare — DNS + CDN

- DNS for apnapin.com and apnapin.in
- CDN caches static assets, protects against DDoS
- Free tier, no configuration needed beyond nameserver change

---

## Two Supabase clients — understand the difference

Next.js runs in two environments. Each needs its own Supabase client:

```
app/layout.tsx, page.tsx (server components)  → lib/supabase/server.ts
app/api/*/route.ts (API routes)               → lib/supabase/server.ts
components with 'use client' directive        → lib/supabase/client.ts
```

**Server client** (`lib/supabase/server.ts`): reads cookies from the request to get the user session. Used for SSR data fetching and API routes.

**Browser client** (`lib/supabase/client.ts`): singleton in the browser. Used for Realtime subscriptions and client-side mutations.

Never use the browser client in server components — it cannot access cookies and will not have the user's session.

---

## Database schema

Three tables for the full MVP.

```sql
-- 3-level geographic hierarchy
-- level: 'pin' → 'area' → 'locality'
locations

-- Editable key-value info per location
-- key: 'flooding', 'safety', 'water_supply', 'power', 'councillor_name', ...
location_details

-- Threaded discussions at any location level
-- display_name NULL = shown as "Resident of [pin_code]"
posts
```

Full migration: `supabase/migrations/001_initial.sql`

### Predefined info field keys

These keys have structured display (icon + label). Any other key falls back to plain text.

**Mover fields** (what portals hide, what we lead with):

| Key | Label | Icon |
|---|---|---|
| `flooding` | Monsoon Flooding | 🌧 |
| `safety` | Safety After Dark | 🔦 |
| `water_supply` | Water Supply | 💧 |
| `power_reliability` | Power Reliability | ⚡ |
| `builder_reputation` | Builder / Society | 🏗 |

**Civic contacts** (seeded from LGD data):

| Key | Label | Icon |
|---|---|---|
| `councillor_name` | Ward Councillor | 🏛 |
| `councillor_phone` | Councillor Phone | 📞 |
| `police_station` | Police Station | 🚔 |
| `hospital` | Nearest Hospital | 🏥 |
| `post_office` | Post Office | 📮 |

**Community-added** (freeform, any key):

Displays as plain `key: value` with an edit button.

---

## Security — Row Level Security (RLS)

All security enforces at the database layer, not the application layer. Even if an API route has a bug, the database will not allow unauthorized writes.

Rules:
- **Anyone** can read locations, details, and posts (public information)
- **Authenticated users** (phone OTP verified) can insert and update location details
- **Authenticated users** can insert posts, delete only their own posts
- **No one** can delete locations (only Arjun via Supabase dashboard in early phase)

Full RLS policies are in `supabase/migrations/001_initial.sql`.

---

## Deployment pipeline

### One-time setup

1. Create Supabase project at supabase.com (ap-south-1)
2. Run `supabase link --project-ref YOUR_REF`
3. Run `supabase db push` to apply migrations
4. Create Vercel project, connect GitHub repo
5. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. Point apnapin.com DNS to Cloudflare → Vercel

### Day-to-day

```
write code → git push origin main → Vercel deploys → live in 2 minutes
```

### Database changes

```
# Create a new migration file
supabase migration new description_of_change

# Edit the file in supabase/migrations/

# Apply to remote database
supabase db push
```

---

## Cost curve

| Stage | Monthly cost | Trigger |
|---|---|---|
| Development | ₹0 | — |
| MVP live, < 50K MAU, < 500MB DB | ₹0 | — |
| Growing past free tier | ~₹3,700 | Supabase Pro $25 + Vercel Pro $20 |
| 500K+ MAU | ~₹15,000–25,000 | Add Redis, tune DB |
| Millions MAU | Revenue should cover it | Elasticsearch, infra team |

---

## What changes in later phases

The core (PostgreSQL, Next.js, Vercel, Cloudflare) never changes. What gets added:

| Phase | Addition | Why |
|---|---|---|
| Phase 4 | Upstash Redis | Rate limiting, hot feed cache |
| Phase 5 | Supabase Pro | Past free tier limits |
| Phase 7 | Cloudflare R2 + FCM | Complaint photos + push notifications |
| Phase 8 | Elasticsearch | Full-text search at scale, Hindi support |
| Phase 8+ | Separate backend service | Only if Next.js API routes become a bottleneck |

Nothing is ripped out and replaced. Services are added as the product earns the complexity.
