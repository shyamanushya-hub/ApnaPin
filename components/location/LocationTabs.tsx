'use client'

import { useState } from 'react'

export interface TabDef {
  id: string
  label: string
  content: React.ReactNode
}

// All panels stay in the DOM (hidden, not unmounted) so SSR content is
// crawlable and tab switches are instant. The bar sticks below the app header.
export function LocationTabs({ tabs }: { tabs: TabDef[] }) {
  const [active, setActive] = useState(tabs[0]?.id)

  return (
    <div className="mt-2">
      <div className="sticky top-16 z-20 -mx-4 mb-7 border-b border-line bg-paper/85 px-4 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const on = t.id === active
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(t.id)}
                aria-selected={on}
                className={`relative whitespace-nowrap px-4 py-3.5 text-sm font-medium transition-colors ${
                  on ? 'text-ink' : 'text-ink/45 hover:text-ink/70'
                }`}
              >
                {t.label}
                <span
                  className={`absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand-blue transition-opacity duration-200 ${
                    on ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </button>
            )
          })}
        </div>
      </div>

      {tabs.map((t) => (
        <div key={t.id} hidden={t.id !== active}>
          {t.content}
        </div>
      ))}
    </div>
  )
}
