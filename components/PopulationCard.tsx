import type { PopulationRollup } from '@/lib/population'
import { SectionHeading } from './SectionHeading'

export function PopulationCard({
  rollup,
  unitNoun,
}: {
  rollup: PopulationRollup
  unitNoun: string
}) {
  const { total, contributing, totalUnits } = rollup
  const partial = contributing > 0 && contributing < totalUnits

  return (
    <section>
      <SectionHeading>Population</SectionHeading>
      <div className="rounded-2xl border border-gray-200/70 bg-white px-4 py-4">
        {contributing > 0 ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-gray-900">
                {total.toLocaleString('en-IN')}
              </span>
              {partial ? (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                  partial
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Summed from {contributing} of {totalUnits} {unitNoun} · community-reported
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-400">
            No population yet — it adds up as {unitNoun} report their numbers.
          </p>
        )}
      </div>
    </section>
  )
}
