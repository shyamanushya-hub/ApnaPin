import type { InfoFieldConfig } from '@/lib/types'

// Compact, read-only facts list for the Overview tab (no edit affordances).
export function FactList({
  fields,
  details,
}: {
  fields: InfoFieldConfig[]
  details: Record<string, string>
}) {
  return (
    <dl className="divide-y divide-line/70">
      {fields.map((f) => {
        const value = details[f.key]
        return (
          <div key={f.key} className="flex items-center gap-3 py-2.5">
            <span className="text-base">{f.icon}</span>
            <dt className="flex-1 text-sm text-ink/55">{f.label}</dt>
            <dd
              className={
                value ? 'text-right text-sm font-medium text-ink' : 'text-sm text-ink/25'
              }
            >
              {value ?? '—'}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
