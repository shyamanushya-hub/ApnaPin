'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { getPlaceCategory, type Place } from '@/lib/types'

// Per-category marker colours. Falls back to slate.
const CATEGORY_COLOR: Record<string, string> = {
  hospital: '#dc2626',
  pharmacy: '#16a34a',
  police: '#2563eb',
  fire: '#ea580c',
  school: '#ca8a04',
  bank: '#0891b2',
  atm: '#0e7490',
  post_office: '#7c3aed',
  government: '#4f46e5',
  park: '#15803d',
  bus_stop: '#6b7280',
  metro: '#be185d',
  water: '#0284c7',
}

export default function MapInner({
  center,
  places,
}: {
  center: [number, number]
  places: Place[]
}) {
  const points = places.filter((p) => p.lat != null && p.lng != null)

  return (
    <MapContainer center={center} zoom={14} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Location centroid */}
      <CircleMarker
        center={center}
        radius={8}
        pathOptions={{ color: '#fff', weight: 2, fillColor: '#1A5276', fillOpacity: 1 }}
      />

      {/* Facilities */}
      {points.map((p) => {
        const cfg = getPlaceCategory(p.category)
        return (
          <CircleMarker
            key={p.id}
            center={[p.lat as number, p.lng as number]}
            radius={5}
            pathOptions={{
              color: '#fff',
              weight: 1,
              fillColor: CATEGORY_COLOR[p.category] ?? '#64748b',
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <span className="text-sm">
                {cfg.icon} <span className="font-medium">{p.name}</span>
                <br />
                <span className="text-gray-500">{cfg.label}</span>
              </span>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
