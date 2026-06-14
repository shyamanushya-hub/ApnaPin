import Link from 'next/link'
import { getGroupedFieldsForLevel, type LocationLevel, type Place } from '@/lib/types'
import type { PopulationRollup } from '@/lib/population'
import { formatIndian } from '@/lib/format'
import { LocationMap } from '@/components/LocationMap'
import { FactList } from './FactList'
import { FacilitySummary } from './FacilitySummary'

export interface ChildListData {
  title: string
  unitNoun: string
  items: { id: string; name: string; slug: string }[]
  basePath: string
  emptyLabel: string
}

export interface OverviewPanelProps {
  level: LocationLevel
  detailsMap: Record<string, string>
  places: Place[]
  popRollup: PopulationRollup
  geo: { lat: number; lng: number } | null
  childList: ChildListData | null
}

function Card({
  title,
  children,
  className = '',
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-2xl border border-line bg-white p-5 ${className}`}>
      <h3 className="mb-3.5 font-display text-base font-medium text-ink">{title}</h3>
      {children}
    </div>
  )
}

export function OverviewPanel({
  level,
  detailsMap,
  places,
  popRollup,
  geo,
  childList,
}: OverviewPanelProps) {
  const groups = getGroupedFieldsForLevel(level)
  const mover = groups.find((g) => g.category === 'mover')?.fields ?? []
  const civic = [
    ...(groups.find((g) => g.category === 'civic')?.fields ?? []),
    ...(groups.find((g) => g.category === 'community')?.fields ?? []),
  ]
  const unit = childList?.unitNoun ?? 'units'

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {geo ? (
        <div className="col-span-full overflow-hidden rounded-2xl border border-line bg-white">
          <LocationMap center={[geo.lat, geo.lng]} places={places} />
        </div>
      ) : null}

      <Card title="Population">
        {popRollup.contributing > 0 ? (
          <>
            <div className="font-display text-3xl font-semibold leading-none text-ink">
              {formatIndian(popRollup.total)}
            </div>
            <p className="mt-2 text-xs text-ink/45">
              Σ {popRollup.contributing} of {popRollup.totalUnits} {unit} · community-reported
            </p>
          </>
        ) : (
          <p className="text-sm text-ink/40">Builds up as {unit} report their numbers.</p>
        )}
      </Card>

      {mover.length > 0 ? (
        <Card title="Living here">
          <FactList fields={mover} details={detailsMap} />
        </Card>
      ) : null}

      {civic.length > 0 ? (
        <Card title="Civic & admin">
          <FactList fields={civic} details={detailsMap} />
        </Card>
      ) : null}

      {places.length > 0 ? (
        <Card title="Facilities nearby" className="sm:col-span-2 lg:col-span-3">
          <FacilitySummary places={places} />
        </Card>
      ) : null}

      {childList ? (
        <Card title={childList.title} className="sm:col-span-2 lg:col-span-3">
          {childList.items.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {childList.items.map((it) => (
                <Link
                  key={it.id}
                  href={`${childList.basePath}/${it.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:border-brand-blue/40 hover:text-brand-blue"
                >
                  {it.name}
                  <span className="text-ink/30">→</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink/40">{childList.emptyLabel}</p>
          )}
        </Card>
      ) : null}
    </div>
  )
}
