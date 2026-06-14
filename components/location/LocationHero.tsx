import type { LocationLevel } from '@/lib/types'
import { Breadcrumb, type Crumb } from '@/components/Breadcrumb'

const LEVEL_LABEL: Record<LocationLevel, string> = {
  pin: 'PIN Code',
  area: 'Area',
  locality: 'Locality',
}

export interface HeroStat {
  label: string
  value: string
}

export function LocationHero({
  level,
  name,
  pinCode,
  subtitle,
  breadcrumb,
  stats,
}: {
  level: LocationLevel
  name: string
  pinCode?: string
  subtitle?: string | null
  breadcrumb: Crumb[]
  stats: HeroStat[]
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-white via-white to-paper px-6 py-8 sm:px-9 sm:py-10">
      {/* Oversized PIN watermark — editorial atmosphere */}
      {pinCode ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-3 -top-8 select-none font-display text-[7rem] font-semibold leading-none text-ink/[0.035] sm:text-[11rem]"
        >
          {pinCode}
        </span>
      ) : null}

      <div className="relative animate-fade-up">
        <Breadcrumb items={breadcrumb} />
      </div>

      <div className="relative mt-5 flex items-center gap-2.5 animate-fade-up" style={{ animationDelay: '60ms' }}>
        <span className="inline-flex items-center rounded-full bg-brand-blue/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-blue">
          {LEVEL_LABEL[level]}
        </span>
        {pinCode ? (
          <span className="text-xs font-medium uppercase tracking-wider text-ink/40">PIN {pinCode}</span>
        ) : null}
      </div>

      <h1
        className="relative mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl animate-fade-up"
        style={{ animationDelay: '100ms' }}
      >
        {name}
      </h1>

      {subtitle ? (
        <p className="relative mt-2.5 text-[15px] text-ink/55 animate-fade-up" style={{ animationDelay: '140ms' }}>
          {subtitle}
        </p>
      ) : null}

      {stats.length > 0 ? (
        <div className="relative mt-7 flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: '200ms' }}>
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-line bg-white/60 px-4 py-2.5 backdrop-blur-sm"
            >
              <div className="font-display text-xl font-semibold leading-tight text-ink">{s.value}</div>
              <div className="mt-0.5 text-[11px] uppercase tracking-wider text-ink/45">{s.label}</div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
