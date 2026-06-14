// Indian number formatting helpers.

export function formatIndian(n: number): string {
  return Math.round(n).toLocaleString('en-IN')
}

// Compact Indian units for stat tiles: 1.2 Cr, 1.27 L, 4.5K.
export function compactIndian(n: number): string {
  if (n >= 1e7) return trim(n / 1e7) + ' Cr'
  if (n >= 1e5) return trim(n / 1e5) + ' L'
  if (n >= 1e3) return trim(n / 1e3) + 'K'
  return String(Math.round(n))
}

function trim(x: number): string {
  return x.toFixed(2).replace(/\.?0+$/, '')
}
