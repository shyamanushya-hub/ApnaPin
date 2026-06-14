# ApnaPin Demo Scope

## What the demo must show

A person picks up your phone, types their PIN code, and sees:

1. **PIN code page** — population, ward councillor / Sarpanch name, key contacts (nearest police station, hospital, panchayat office)
2. **Sub-area selector** — choose their specific village or locality within the PIN
3. **Discussion feed** — recent posts from that sub-area. At least 3–4 seeded posts to look alive.
4. **Post something** — type a message, hit post, it appears in the feed
5. **Reply to a post** — tap a post, see thread, add a reply
6. **Login** — phone OTP (real SMS via Supabase Auth)

That's it. That's the demo.

## What is explicitly NOT in the demo

- Complaints / issue tracker
- Push notifications
- Official channels / verified badges
- Trust tiers (everyone is "New", no visible tier UI)
- Search
- Multiple PIN codes in the UI (seed data for 2–3 PIN codes max)
- Android app (PWA in mobile browser is enough)
- Business listings

## Seed data needed

Pick 2–3 real PIN codes to seed:
- Your own area (you know it, you can verify the data is accurate)
- One rural PIN code (shows village coverage)
- One urban PIN code (shows city neighbourhood coverage)

Seed 4–5 discussion posts per PIN code manually. Make them realistic:
- "Anyone know a good plumber in our area?"
- "Power cut scheduled tomorrow 10am–2pm"
- "New park being built near the main road — thoughts?"

## Definition of done for demo

- Opens on mobile browser without installing anything
- Works on slow 4G (no large JS bundles, images compressed)
- PIN code lookup responds in under 2 seconds
- Posting works without page reload (Supabase Realtime)
- Looks clean — not designed, but not embarrassing
