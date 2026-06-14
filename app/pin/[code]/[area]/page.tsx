// Area page — e.g. /pin/500032/gachibowli

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getPopulationRollup } from '@/lib/population'
import { getIssuesForLocation } from '@/lib/issues'
import type { Place } from '@/lib/types'
import { LocationView } from '@/components/location/LocationView'

interface Props {
  params: Promise<{ code: string; area: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code, area } = await params
  return { title: `${area} · ${code}` }
}

export default async function AreaPage({ params }: Props) {
  const { code, area: areaSlug } = await params
  const supabase = await getSupabaseServerClient()

  const { data: location } = await supabase
    .from('locations')
    .select('*')
    .eq('level', 'area')
    .eq('pin_code', code)
    .eq('slug', areaSlug)
    .single()

  if (!location) notFound()

  const [{ data: details }, { data: localities }, { data: places }, popRollup, issues, { data: { user } }] =
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
      level="area"
      name={location.name}
      locationId={location.id}
      pinCode={code}
      issues={issues}
      isAuthed={!!user}
      subtitle={subtitle}
      breadcrumb={[
        { label: 'India', href: '/' },
        { label: code, href: `/pin/${code}` },
        { label: location.name },
      ]}
      detailsMap={detailsMap}
      places={(places ?? []) as Place[]}
      popRollup={popRollup}
      geo={location.lat != null && location.lng != null ? { lat: location.lat, lng: location.lng } : null}
      childList={{
        title: `Localities in ${location.name}`,
        unitNoun: 'localities',
        items: localities ?? [],
        basePath: `/pin/${code}/${areaSlug}`,
        emptyLabel: 'No localities added yet.',
      }}
    />
  )
}
