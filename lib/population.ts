import type { getSupabaseServerClient } from '@/lib/supabase/server'

type ServerClient = Awaited<ReturnType<typeof getSupabaseServerClient>>

export interface PopulationRollup {
  total: number
  contributing: number // leaf units that have a population value
  totalUnits: number // leaf units in total
}

/**
 * Population is a bottom-up aggregate: a PIN's population is the sum of the
 * populations of the units under it. To avoid double-counting, the number is
 * stored only on LEAF units (a locality, or an area with no localities) and
 * summed upward. This returns the total plus how complete it is.
 */
export async function getPopulationRollup(
  supabase: ServerClient,
  location: { id: string; level: string; pin_code: string },
): Promise<PopulationRollup> {
  let leafIds: string[]

  if (location.level === 'locality') {
    leafIds = [location.id]
  } else if (location.level === 'area') {
    const { data: kids } = await supabase
      .from('locations')
      .select('id')
      .eq('parent_id', location.id)
    leafIds = kids && kids.length ? kids.map((k) => k.id) : [location.id]
  } else {
    // PIN: leaves are all localities, plus areas that have no localities.
    const { data: descendants } = await supabase
      .from('locations')
      .select('id, level, parent_id')
      .eq('pin_code', location.pin_code)
      .neq('id', location.id)
    const all = descendants ?? []
    const localities = all.filter((l) => l.level === 'locality')
    const areasWithLocality = new Set(localities.map((l) => l.parent_id))
    const leafAreas = all.filter((l) => l.level === 'area' && !areasWithLocality.has(l.id))
    leafIds = [...localities.map((l) => l.id), ...leafAreas.map((a) => a.id)]
  }

  if (leafIds.length === 0) return { total: 0, contributing: 0, totalUnits: 0 }

  const { data: stats } = await supabase
    .from('location_stats')
    .select('location_id, value')
    .eq('key', 'population')
    .in('location_id', leafIds)

  const total = (stats ?? []).reduce((sum, r) => sum + Number(r.value), 0)
  return { total, contributing: stats?.length ?? 0, totalUnits: leafIds.length }
}
