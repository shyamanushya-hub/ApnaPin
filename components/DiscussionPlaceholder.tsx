import { SectionHeading } from './SectionHeading'

export function DiscussionPlaceholder() {
  return (
    <section>
      <SectionHeading>Discussion</SectionHeading>
      <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center">
        <p className="text-sm text-gray-500">Community discussions are coming soon.</p>
        <p className="mt-1 text-xs text-gray-400">
          Sign in to be notified when they open in your area.
        </p>
      </div>
    </section>
  )
}
