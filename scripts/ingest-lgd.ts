/**
 * LGD Data Ingestion Script
 *
 * Downloads and ingests the Local Government Directory (LGD) data
 * from MeitY into the locations table.
 *
 * Usage:
 *   npx tsx scripts/ingest-lgd.ts
 *
 * Prerequisites:
 *   1. Download LGD data from https://lgdirectory.gov.in
 *      → Village → Download as CSV
 *   2. Place file at: data/lgd/lgd_villages.csv
 *   3. Ensure .env.local is configured with Supabase credentials
 *
 * What it does:
 *   - Reads PIN code → village/ward mappings from LGD CSV
 *   - Creates 'pin' level locations for each unique PIN code
 *   - Creates 'area' level locations for each village/ward under the PIN
 *   - Skips duplicates (safe to re-run)
 *
 * LGD CSV columns (inspect your download, column names vary):
 *   StateName, DistrictName, SubDistrictName, VillageName, Pincode
 *
 * TODO: Implement this in Phase 1, Step 2
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load env manually (tsx doesn't auto-load .env.local)
import { config } from 'process'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  console.error('Set these in .env.local and run with: npx tsx --env-file=.env.local scripts/ingest-lgd.ts')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // remove non-alphanumeric except spaces and hyphens
    .replace(/\s+/g, '-')            // spaces to hyphens
    .replace(/-+/g, '-')             // collapse multiple hyphens
    .slice(0, 80)                    // max length
}

async function ingest() {
  const csvPath = join(process.cwd(), 'data', 'lgd', 'lgd_villages.csv')

  console.log(`Reading LGD data from ${csvPath}...`)

  // TODO: Parse the CSV
  // The LGD CSV format varies by download. Inspect the file first.
  // Key fields needed: VillageName (or WardName), Pincode
  //
  // Example parsing approach:
  //   const raw = readFileSync(csvPath, 'utf-8')
  //   const rows = raw.split('\n').slice(1).map(r => r.split(','))
  //   ...
  //
  // When implementing:
  // 1. Group rows by PIN code
  // 2. For each PIN code, create one 'pin' location
  // 3. For each village/ward in that PIN, create one 'area' location
  // 4. Use supabase.from('locations').upsert() with onConflict: 'pin_code,slug'

  console.log('⚠️  Ingestion not yet implemented.')
  console.log('   See comments in this file for instructions.')
  console.log('   Implement in Phase 1, Step 2.')
}

ingest().catch(console.error)
