// Locality page — e.g. /pin/500032/gachibowli/shivam-apartments (most granular level)

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getPopulationRollup } from '@/lib/population'
import { getIssuesForLocation } from '@/lib/issues'
import type { Place } from '@/lib/types'
import { LocationView } from '@/components/location/LocationView'

interface Props {
  params: Promise<{ code: string; area: string; locality: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code, area, locality } = await params
  return { title: `${locality} · ${area} · ${code}` }
}

export default async function LocalityPage({ params }: Props) {
  const { code, area: areaSlug, locality: localitySlug } = await params
  const supabase = await getSupabaseServerClient()

  const { data: location } = await supabase
    .from('locations')
    .select('*')
    .eq('level', 'locality')
    .eq('pin_code', code)
    .eq('slug', localitySlug)
    .single()

  if (!location) notFound()

  const [{ data: parentArea }, { data: details }, { data: places }, popRollup, issues, { data: { user } }] =
    await Promise.all([
      supabase.from('locations').select('name, slug').eq('id', location.parent_id).single(),
      supabase.from('location_details').select('*').eq('location_id', location.id),
      supabase.from('places').select('*').eq('location_id', location.id).order('category'),
      getPopulationRollup(supabase, location),
      getIssuesForLocation(supabase, location.id),
      supabase.auth.getUser(),
    ])

  const detailsMap = Object.fromEntries((details ?? []).map((d) => [d.key, d.value]))

  return (
    <LocationView
      level="locality"
      name={location.name}
      locationId={location.id}
      pinCode={code}
      issues={issues}
      isAuthed={!!user}
      subtitle={parentArea?.name ?? null}
      breadcrumb={[
        { label: 'India', href: '/' },
        { label: code, href: `/pin/${code}` },
        { label: parentArea?.name ?? areaSlug, href: `/pin/${code}/${areaSlug}` },
        { label: location.name },
      ]}
      detailsMap={detailsMap}
      places={(places ?? []) as Place[]}
      popRollup={popRollup}
      geo={location.lat != null && location.lng != null ? { lat: location.lat, lng: location.lng } : null}
      childList={null}
    />
  )
}
