/**
 * Seed one PIN code from public India Post data.
 *
 *   npx tsx scripts/seed-pincode.ts [PIN]   (defaults to 500032)
 *
 * Source: https://api.postalpincode.in (community mirror of India Post data,
 * no key required). Idempotent — safe to re-run; rows are upserted.
 *
 * Inserts:
 *   - one `pin` location
 *   - one `area` location per post office in that PIN
 *   - `location_details` on the PIN (post_office, district, state, division)
 */
import { createClient } from '@supabase/supabase-js'

// Load local env (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).
process.loadEnvFile('.env.local')

const PIN = process.argv[2] ?? '500032'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
}

// Service-role client bypasses RLS — this is a trusted server-side script.
const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

interface PostOffice {
  Name: string
  BranchType: string
  DeliveryStatus: string
  District: string
  Division: string
  State: string
  Pincode: string
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function main() {
  if (!/^\d{6}$/.test(PIN)) throw new Error(`Invalid PIN: ${PIN}`)

  console.log(`Fetching India Post data for ${PIN}…`)
  const res = await fetch(`https://api.postalpincode.in/pincode/${PIN}`)
  const json = (await res.json()) as Array<{ Status: string; PostOffice: PostOffice[] | null }>
  const result = json[0]
  if (result?.Status !== 'Success' || !result.PostOffice?.length) {
    throw new Error(`No data for PIN ${PIN} (status: ${result?.Status})`)
  }

  const offices = result.PostOffice
  // Headline name = the first listed office (the recognizable locality).
  const pinName = offices[0].Name
  // Admin details come from a delivery office where available (more canonical).
  const primary = offices.find((o) => o.DeliveryStatus === 'Delivery') ?? offices[0]

  // 1. Upsert the PIN-level location. slug = pin code (URL uses level+pin_code).
  const { data: pin, error: pinErr } = await db
    .from('locations')
    .upsert(
      { level: 'pin', pin_code: PIN, name: pinName, slug: PIN, parent_id: null },
      { onConflict: 'pin_code,slug' },
    )
    .select('id')
    .single()
  if (pinErr) throw pinErr
  console.log(`  PIN location: ${pinName} (${pin.id})`)

  // 2. Upsert one area per post office.
  const seenSlugs = new Set<string>()
  const areaRows = offices.map((o) => {
    let slug = slugify(o.Name)
    while (seenSlugs.has(slug)) slug += '-x'
    seenSlugs.add(slug)
    return { level: 'area' as const, pin_code: PIN, name: o.Name, slug, parent_id: pin.id }
  })
  const { error: areaErr } = await db
    .from('locations')
    .upsert(areaRows, { onConflict: 'pin_code,slug' })
  if (areaErr) throw areaErr
  console.log(`  Areas: ${areaRows.map((a) => a.name).join(', ')}`)

  // 3. Upsert PIN-level details from the public data.
  const officeLabel = offices.map((o) => `${o.Name} (${o.BranchType})`).join(', ')
  const detailRows = [
    { key: 'post_office', value: officeLabel },
    { key: 'district', value: primary.District },
    { key: 'state', value: primary.State },
    { key: 'postal_division', value: primary.Division },
  ].map((d) => ({ location_id: pin.id, ...d }))
  const { error: detErr } = await db
    .from('location_details')
    .upsert(detailRows, { onConflict: 'location_id,key' })
  if (detErr) throw detErr
  console.log(`  Details: ${detailRows.map((d) => d.key).join(', ')}`)

  console.log(`✓ Seeded ${PIN} → /pin/${PIN}`)
}

main().catch((e) => {
  console.error('Seed failed:', e.message ?? e)
  process.exit(1)
})
