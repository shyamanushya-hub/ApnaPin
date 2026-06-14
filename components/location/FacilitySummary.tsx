import type { Place } from '@/lib/types'
import { PLACE_CATEGORIES } from '@/lib/types'

// Category chips with counts — the Overview snapshot of facilities.
export function FacilitySummary({ places }: { places: Place[] }) {
  const counts = new Map<string, number>()
  for (const p of places) counts.set(p.category, (counts.get(p.category) ?? 0) + 1)

  const groups = PLACE_CATEGORIES.map((c) => ({ c, n: counts.get(c.key) ?? 0 })).filter((g) => g.n > 0)
  if (groups.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {groups.map(({ c, n }) => (
        <span
          key={c.key}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-sm"
        >
          <span>{c.icon}</span>
          <span className="text-ink/65">{c.plural}</span>
          <span className="font-semibold text-ink">{n}</span>
        </span>
      ))}
    </div>
  )
}
