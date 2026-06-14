'use client'

import dynamic from 'next/dynamic'
import type { Place } from '@/lib/types'

// Leaflet touches `window` at import time, so the actual map is loaded
// browser-only (ssr: false). This wrapper is what server pages render.
const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-gray-100" />,
})

export function LocationMap({
  center,
  places,
}: {
  center: [number, number]
  places: Place[]
}) {
  return (
    <div className="h-72 w-full overflow-hidden rounded-2xl border border-gray-200/70">
      <MapInner center={center} places={places} />
    </div>
  )
}
