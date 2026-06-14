import type { Place } from '@/lib/types'
import { PLACE_CATEGORIES } from '@/lib/types'
import { SectionHeading } from './SectionHeading'

export function FacilityGroups({ places }: { places: Place[] }) {
  if (places.length === 0) return null

  // Group by category, preserving PLACE_CATEGORIES display order.
  const byCategory = new Map<string, Place[]>()
  for (const p of places) {
    const arr = byCategory.get(p.category) ?? []
    arr.push(p)
    byCategory.set(p.category, arr)
  }
  const groups = PLACE_CATEGORIES.map((cfg) => ({ cfg, items: byCategory.get(cfg.key) ?? [] })).filter(
    (g) => g.items.length > 0,
  )

  return (
    <section>
      <SectionHeading meta={String(places.length)}>Facilities nearby</SectionHeading>
      <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200/70 bg-white">
        {groups.map(({ cfg, items }) => (
          <details key={cfg.key} className="group">
            <summary className="flex cursor-pointer list-none items-center gap-3.5 px-4 py-3.5 hover:bg-gray-50">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-lg">
                {cfg.icon}
              </span>
              <span className="flex-1 text-sm font-medium text-gray-900">{cfg.plural}</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                {items.length}
              </span>
              <span className="text-gray-300 transition-transform group-open:rotate-90">›</span>
            </summary>
            <ul className="space-y-1.5 px-4 pb-3.5 pl-[4.25rem]">
              {items.map((p) => (
                <li key={p.id} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-gray-700">{p.name}</span>
                  {p.phone ? (
                    <a href={`tel:${p.phone}`} className="shrink-0 text-xs font-medium text-brand-blue">
                      {p.phone}
                    </a>
                  ) : p.address ? (
                    <span className="max-w-[45%] shrink-0 truncate text-xs text-gray-400">{p.address}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-400">Facility data © OpenStreetMap contributors</p>
    </section>
  )
}
