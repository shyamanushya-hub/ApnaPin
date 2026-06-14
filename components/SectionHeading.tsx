export function SectionHeading({
  children,
  meta,
}: {
  children: React.ReactNode
  meta?: string
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="text-sm font-semibold text-gray-700">{children}</h2>
      {meta ? <span className="text-xs font-medium text-gray-400">{meta}</span> : null}
    </div>
  )
}
