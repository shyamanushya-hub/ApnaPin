import type { InfoFieldConfig } from '@/lib/types'
import { SectionHeading } from './SectionHeading'

export function InfoGroup({
  title,
  fields,
  details,
}: {
  title: string
  fields: InfoFieldConfig[]
  details: Record<string, string>
}) {
  if (fields.length === 0) return null
  const filled = fields.filter((f) => details[f.key]).length

  return (
    <section>
      <SectionHeading meta={`${filled}/${fields.length} added`}>{title}</SectionHeading>
      <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white">
        <div className="divide-y divide-gray-100">
          {fields.map((field) => {
            const value = details[field.key]
            return (
              <div key={field.key} className="flex items-center gap-3.5 px-4 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-lg">
                  {field.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-400">{field.label}</div>
                  {value ? (
                    <div className="mt-0.5 truncate text-sm font-medium text-gray-900">{value}</div>
                  ) : (
                    <div className="mt-0.5 text-sm text-gray-300">Not added yet</div>
                  )}
                </div>
                <button
                  type="button"
                  aria-label={`${value ? 'Edit' : 'Add'} ${field.label}`}
                  className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-50 hover:text-brand-blue"
                >
                  {value ? 'Edit' : 'Add'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
