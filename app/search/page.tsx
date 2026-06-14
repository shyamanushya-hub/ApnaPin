// Search handler — the home form submits GET /search?pin=NNNNNN here.
// Validates the PIN and redirects to its location page (or 404s via /pin/[code]
// if it isn't seeded yet). Empty/invalid input goes back home.

import { redirect } from 'next/navigation'

interface Props {
  searchParams: Promise<{ pin?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { pin } = await searchParams
  const trimmed = (pin ?? '').trim()

  if (/^\d{6}$/.test(trimmed)) {
    redirect(`/pin/${trimmed}`)
  }
  redirect('/')
}
