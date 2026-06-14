import Link from 'next/link'

export interface Crumb {
  label: string
  href?: string
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-sm text-gray-400">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-gray-700">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-gray-600">{item.label}</span>
          )}
          {i < items.length - 1 && <span className="text-gray-300">/</span>}
        </span>
      ))}
    </nav>
  )
}
