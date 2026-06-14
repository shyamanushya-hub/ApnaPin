/**
 * Ingest facilities for one PIN from OpenStreetMap.
 *
 *   npx tsx scripts/ingest-osm.ts [PIN] [RADIUS_METRES]
 *   (defaults: 500032, 2500)
 *
 * Pipeline:
 *   1. Geocode the PIN → centroid via Nominatim (and store lat/lng on the PIN).
 *   2. Query Overpass for amenities within RADIUS of the centroid.
 *   3. Categorise by OSM tag, dedupe, upsert into `places` (source = 'osm').
 *
 * Data © OpenStreetMap contributors (ODbL). Any UI showing this must attribute.
 * Run the PIN seed first (scripts/seed-pincode.ts) so the PIN location exists.
 */
import { createClient } from '@supabase/supabase-js'

process.loadEnvFile('.env.local')

const PIN = process.argv[2] ?? '500032'
const RADIUS = Number(process.argv[3] ?? 2500)
const UA = 'ApnaPin/0.1 (hyperlocal civic info; dev)'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Missing Supabase env in .env.local')
const db = createClient(url, key, { auth: { persistSession: false } })

interface OsmTags { [k: string]: string }
interface OsmElement {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: OsmTags
}

// OSM tag → our place category (see PLACE_CATEGORIES in lib/types.ts).
function categorize(t: OsmTags): string | null {
  const { amenity: a, leisure: l, highway: h, railway: r, office: o } = t
  if (a === 'hospital' || a === 'clinic') return 'hospital'
  if (a === 'pharmacy') return 'pharmacy'
  if (a === 'police') return 'police'
  if (a === 'fire_station') return 'fire'
  if (a === 'school' || a === 'college') return 'school'
  if (a === 'bank') return 'bank'
  if (a === 'atm') return 'atm'
  if (a === 'post_office') return 'post_office'
  if (a === 'townhall' || o === 'government') return 'government'
  if (l === 'park') return 'park'
  if (h === 'bus_stop') return 'bus_stop'
  if (r === 'station') return 'metro'
  if (a === 'drinking_water') return 'water'
  return null
}

function composeAddress(t: OsmTags): string | null {
  const parts = [t['addr:housenumber'], t['addr:street'], t['addr:suburb']].filter(Boolean)
  return parts.length ? parts.join(', ') : null
}

async function geocode(pin: string): Promise<{ lat: number; lng: number }> {
  const tries = [
    `https://nominatim.openstreetmap.org/search?postalcode=${pin}&country=India&format=json&limit=1`,
    `https://nominatim.openstreetmap.org/search?q=${pin},India&format=json&limit=1`,
  ]
  for (const u of tries) {
    const r = await fetch(u, { headers: { 'User-Agent': UA } })
    const j = (await r.json()) as Array<{ lat: string; lon: string }>
    if (j.length) return { lat: parseFloat(j[0].lat), lng: parseFloat(j[0].lon) }
  }
  throw new Error(`Could not geocode PIN ${pin}`)
}

async function main() {
  // PIN location must already exist (from seed-pincode.ts).
  const { data: pin, error: pinErr } = await db
    .from('locations')
    .select('id')
    .eq('level', 'pin')
    .eq('pin_code', PIN)
    .single()
  if (pinErr || !pin) throw new Error(`PIN ${PIN} not seeded — run seed-pincode.ts first`)

  console.log(`Geocoding ${PIN}…`)
  const { lat, lng } = await geocode(PIN)
  console.log(`  centroid: ${lat}, ${lng}`)
  await db.from('locations').update({ lat, lng }).eq('id', pin.id)

  const query = `
    [out:json][timeout:60];
    (
      nwr(around:${RADIUS},${lat},${lng})[amenity~"^(hospital|clinic|pharmacy|police|fire_station|school|college|bank|atm|post_office|townhall|drinking_water)$"];
      nwr(around:${RADIUS},${lat},${lng})[leisure=park];
      nwr(around:${RADIUS},${lat},${lng})[highway=bus_stop];
      nwr(around:${RADIUS},${lat},${lng})[railway=station];
      nwr(around:${RADIUS},${lat},${lng})[office=government];
    );
    out center tags;`

  console.log(`Querying Overpass (radius ${RADIUS}m)…`)
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
    body: 'data=' + encodeURIComponent(query),
  })
  if (!res.ok) throw new Error(`Overpass ${res.status}: ${await res.text()}`)
  const { elements } = (await res.json()) as { elements: OsmElement[] }

  const seen = new Set<string>()
  const rows = []
  for (const el of elements) {
    const tags = el.tags ?? {}
    if (!tags.name) continue // skip unnamed nodes (ATMs/stops without a name) — keeps lists clean
    const category = categorize(tags)
    if (!category) continue
    const ref = `${el.type}/${el.id}`
    if (seen.has(ref)) continue
    seen.add(ref)
    rows.push({
      location_id: pin.id,
      category,
      name: tags.name,
      address: composeAddress(tags),
      phone: tags.phone ?? tags['contact:phone'] ?? null,
      website: tags.website ?? tags['contact:website'] ?? null,
      lat: el.lat ?? el.center?.lat ?? null,
      lng: el.lon ?? el.center?.lon ?? null,
      source: 'osm',
      source_ref: ref,
    })
  }

  if (!rows.length) {
    console.log('No named facilities found in range.')
    return
  }

  const { error } = await db
    .from('places')
    .upsert(rows, { onConflict: 'location_id,source,source_ref' })
  if (error) throw error

  const counts: Record<string, number> = {}
  for (const r of rows) counts[r.category] = (counts[r.category] ?? 0) + 1
  console.log(`✓ Upserted ${rows.length} facilities for ${PIN}:`)
  for (const [cat, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${cat.padEnd(12)} ${n}`)
  }
}

main().catch((e) => {
  console.error('OSM ingest failed:', e.message ?? e)
  process.exit(1)
})
