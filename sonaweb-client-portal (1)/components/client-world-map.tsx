'use client'

import { useMemo, useState } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import worldTopo from 'world-atlas/countries-110m.json'
import type { FeatureCollection } from 'geojson'
import { useAgency, type AgencyClient } from '@/lib/agency-store'
import { cn } from '@/lib/utils'

const WIDTH = 800
const HEIGHT = 560

const statusColor: Record<AgencyClient['status'], string> = {
  Active: 'fill-primary',
  'At Risk': 'fill-destructive',
  Onboarding: 'fill-chart-4',
}

export function ClientWorldMap() {
  const { clients } = useAgency()
  const [hovered, setHovered] = useState<AgencyClient | null>(null)
  const [selected, setSelected] = useState<AgencyClient | null>(null)

  const { countries, projection } = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const topo = worldTopo as any
    const fc = feature(
      topo,
      topo.objects.countries,
    ) as unknown as FeatureCollection
    // Explicit Europe-centered view — every client sits within this region,
    // so this keeps individual markers readable and inspectable.
    const proj = geoMercator()
      .center([9, 53])
      .scale(720)
      .translate([WIDTH / 2, HEIGHT / 2])
    return { countries: fc.features, projection: proj }
  }, [])

  const pathGen = useMemo(() => geoPath(projection), [projection])

  // Size markers by monthly spend.
  const maxSpend = Math.max(...clients.map((c) => c.monthlySpend))
  const markerRadius = (spend: number) => 6 + (spend / maxSpend) * 10

  const active = hovered ?? selected

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Map of SONAWEB clients across Europe"
      >
        <g>
          {countries.map((c, i) => {
            const d = pathGen(c)
            if (!d) return null
            return (
              <path
                key={i}
                d={d}
                className="fill-secondary stroke-background"
                strokeWidth={0.75}
              />
            )
          })}
        </g>

        <g>
          {clients.map((c) => {
            const point = projection(c.coordinates)
            if (!point) return null
            const [x, y] = point
            const r = markerRadius(c.monthlySpend)
            const isActive = active?.id === c.id
            return (
              <g
                key={c.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer"
                onMouseEnter={() => setHovered(c)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(c)}
              >
                <circle
                  r={r + 5}
                  className={cn(
                    statusColor[c.status],
                    'opacity-20 transition-all',
                    isActive && 'opacity-30',
                  )}
                />
                <circle
                  r={r}
                  className={cn(
                    statusColor[c.status],
                    'stroke-background transition-all',
                  )}
                  strokeWidth={2}
                />
                {isActive && (
                  <circle
                    r={r + 9}
                    className={cn(statusColor[c.status], 'fill-none')}
                    stroke="currentColor"
                    strokeWidth={1}
                    opacity={0.4}
                  />
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Hover tooltip / selected detail */}
      {active && (
        <div className="pointer-events-none absolute left-4 top-4 w-64 rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">
              {active.company}
            </p>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-medium',
                active.status === 'Active' && 'bg-primary/15 text-primary',
                active.status === 'At Risk' &&
                  'bg-destructive/15 text-destructive',
                active.status === 'Onboarding' && 'bg-accent text-accent-foreground',
              )}
            >
              {active.status}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {active.city}, {active.country}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-secondary/50 px-2.5 py-2">
              <p className="text-muted-foreground">Monthly</p>
              <p className="font-semibold text-foreground">
                ${active.monthlySpend.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 px-2.5 py-2">
              <p className="text-muted-foreground">Health</p>
              <p className="font-semibold text-foreground">{active.health}</p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {active.services.map((s) => (
              <span
                key={s}
                className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center gap-4 px-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          Active
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
          At risk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-chart-4" />
          Onboarding
        </span>
        <span className="ml-auto hidden sm:block">
          Marker size reflects monthly spend
        </span>
      </div>
    </div>
  )
}
