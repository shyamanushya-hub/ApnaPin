import { getGroupedFieldsForLevel, type Issue, type LocationLevel, type Place } from '@/lib/types'
import type { PopulationRollup } from '@/lib/population'
import { compactIndian } from '@/lib/format'
import type { Crumb } from '@/components/Breadcrumb'
import { InfoGroup } from '@/components/InfoGroup'
import { FacilityGroups } from '@/components/FacilityGroups'
import { LocationMap } from '@/components/LocationMap'
import { PopulationCard } from '@/components/PopulationCard'
import { DiscussionPlaceholder } from '@/components/DiscussionPlaceholder'
import { IssuesPanel } from '@/components/issues/IssuesPanel'
import { LocationHero, type HeroStat } from './LocationHero'
import { LocationTabs, type TabDef } from './LocationTabs'
import { OverviewPanel, type ChildListData } from './OverviewPanel'

export interface LocationViewProps {
  level: LocationLevel
  name: string
  locationId: string
  pinCode: string
  breadcrumb: Crumb[]
  subtitle: string | null
  detailsMap: Record<string, string>
  places: Place[]
  popRollup: PopulationRollup
  geo: { lat: number; lng: number } | null
  childList: ChildListData | null
  issues: Issue[]
  isAuthed: boolean
}

// Shared tabbed location page used by PIN / area / locality routes.
export function LocationView(p: LocationViewProps) {
  const groups = getGroupedFieldsForLevel(p.level)

  const stats: HeroStat[] = []
  if (p.popRollup.total > 0) stats.push({ label: 'People', value: `~${compactIndian(p.popRollup.total)}` })
  if (p.places.length > 0) stats.push({ label: 'Facilities', value: String(p.places.length) })
  if (p.childList && p.childList.items.length > 0)
    stats.push({ label: p.childList.unitNoun, value: String(p.childList.items.length) })

  const tabs: TabDef[] = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <OverviewPanel
          level={p.level}
          detailsMap={p.detailsMap}
          places={p.places}
          popRollup={p.popRollup}
          geo={p.geo}
          childList={p.childList}
        />
      ),
    },
  ]

  if (p.geo || p.places.length > 0) {
    tabs.push({
      id: 'facilities',
      label: p.places.length > 0 ? `Facilities · ${p.places.length}` : 'Map',
      content: (
        <div className="space-y-6">
          {p.geo ? <LocationMap center={[p.geo.lat, p.geo.lng]} places={p.places} /> : null}
          <FacilityGroups places={p.places} />
        </div>
      ),
    })
  }

  tabs.push({
    id: 'issues',
    label: p.issues.length > 0 ? `Issues · ${p.issues.length}` : 'Issues',
    content: (
      <IssuesPanel
        issues={p.issues}
        locationId={p.locationId}
        pinCode={p.pinCode}
        isAuthed={p.isAuthed}
      />
    ),
  })

  tabs.push({
    id: 'info',
    label: 'Local info',
    content: (
      <div className="space-y-6">
        {groups.map((g) => (
          <InfoGroup key={g.category} title={g.title} fields={g.fields} details={p.detailsMap} />
        ))}
        <PopulationCard rollup={p.popRollup} unitNoun={p.childList?.unitNoun ?? 'units'} />
      </div>
    ),
  })

  tabs.push({ id: 'discussion', label: 'Discussion', content: <DiscussionPlaceholder /> })

  return (
    <div>
      <LocationHero
        level={p.level}
        name={p.name}
        pinCode={p.pinCode}
        subtitle={p.subtitle}
        breadcrumb={p.breadcrumb}
        stats={stats}
      />
      <LocationTabs tabs={tabs} />
    </div>
  )
}
