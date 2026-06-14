// PIN code page — e.g. /pin/500032
// Tabbed location view (Overview / Facilities / Local info / Discussion).
// SSR: data fetched on the server for SEO; all tab content is rendered server-side.

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getPopulationRollup } from '@/lib/population'
import { getIssuesForLocation } from '@/lib/issues'
import type { Place } from '@/lib/types'
import { LocationView } from '@/components/location/LocationView'

interface Props {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  return {
    title: `PIN ${code}`,
    description: `Community information for PIN code ${code} — areas, facilities, and local discussion.`,
  }
}

export default async function PinPage({ params }: Props) {
  const { code } = await params
  const supabase = await getSupabaseServerClient()

  const { data: location } = await supabase
    .from('locations')
    .select('*')
    .eq('level', 'pin')
    .eq('pin_code', code)
    .single()

  if (!location) notFound()

  const [{ data: details }, { data: areas }, { data: places }, popRollup, issues, { data: { user } }] =
    await Promise.all([
      supabase.from('location_details').select('*').eq('location_id', location.id),
      supabase.from('locations').select('id, name, slug').eq('parent_id', location.id).order('name'),
      supabase.from('places').select('*').eq('location_id', location.id).order('category'),
      getPopulationRollup(supabase, location),
      getIssuesForLocation(supabase, location.id),
      supabase.auth.getUser(),
    ])

  const detailsMap = Object.fromEntries((details ?? []).map((d) => [d.key, d.value]))
  const subtitle = [detailsMap.district, detailsMap.state].filter(Boolean).join(', ') || null

  return (
    <LocationView
      level="pin"
      name={location.name}
      locationId={location.id}
      pinCode={code}
      issues={issues}
      isAuthed={!!user}
      subtitle={subtitle}
      breadcrumb={[{ label: 'India', href: '/' }, { label: code }]}
      detailsMap={detailsMap}
      places={(places ?? []) as Place[]}
      popRollup={popRollup}
      geo={location.lat != null && location.lng != null ? { lat: location.lat, lng: location.lng } : null}
      childList={{
        title: `Areas in ${code}`,
        unitNoun: 'areas',
        items: areas ?? [],
        basePath: `/pin/${code}`,
        emptyLabel: 'No areas added yet.',
      }}
    />
  )
}
