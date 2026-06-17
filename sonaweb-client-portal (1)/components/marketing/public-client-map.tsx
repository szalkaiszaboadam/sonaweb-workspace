'use client'

import { useMemo, useState } from 'react'
import { geoNaturalEarth1, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import worldTopo from 'world-atlas/countries-110m.json'
import type { FeatureCollection } from 'geojson'
import { publicClientLocations, marketingCategories } from '@/lib/marketing'

const WIDTH = 980
const HEIGHT = 500

export function PublicClientMap() {
  const [active, setActive] = useState<string | null>(null)

  const { countries, projection } = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const topo = worldTopo as any
    const fc = feature(
      topo,
      topo.objects.countries,
    ) as unknown as FeatureCollection
    const proj = geoNaturalEarth1().fitExtent(
      [
        [10, 10],
        [WIDTH - 10, HEIGHT - 10],
      ],
      { type: 'Sphere' },
    )
    return { countries: fc.features, projection: proj }
  }, [])

  const path = useMemo(() => geoPath(projection), [projection])
  const activeLoc = publicClientLocations.find(
    (l) => `${l.city}-${l.country}` === active,
  )

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full"
          role="img"
          aria-label="Map of SONAWEB client locations worldwide"
        >
          <g>
            {countries.map((c, i) => (
              <path
                key={i}
                d={path(c) ?? undefined}
                className="fill-muted stroke-border"
                strokeWidth={0.5}
              />
            ))}
          </g>
          <g>
            {publicClientLocations.map((loc) => {
              const xy = projection(loc.coordinates)
              if (!xy) return null
              const id = `${loc.city}-${loc.country}`
              const isActive = active === id
              return (
                <g
                  key={id}
                  transform={`translate(${xy[0]}, ${xy[1]})`}
                  onMouseEnter={() => setActive(id)}
                  onMouseLeave={() => setActive(null)}
                  className="cursor-pointer"
                >
                  <circle
                    r={isActive ? 9 : 6}
                    className="fill-primary/20"
                  >
                    <animate
                      attributeName="r"
                      values="6;11;6"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    r={isActive ? 5 : 4}
                    className="fill-primary stroke-background"
                    strokeWidth={1.5}
                  />
                </g>
              )
            })}
          </g>
        </svg>

        {activeLoc && (
          <div className="pointer-events-none absolute left-4 top-4 rounded-xl border border-border bg-popover px-4 py-3 shadow-lg">
            <p className="text-sm font-semibold text-foreground">
              {`${activeLoc.city}, ${activeLoc.country}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {`${activeLoc.industry} · ${activeLoc.serviceCategory}`}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border px-4 py-3">
        <span className="text-xs font-medium text-foreground">
          {`${publicClientLocations.length} active client regions`}
        </span>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {marketingCategories.map((c) => (
            <span
              key={c.id}
              className="text-xs text-muted-foreground"
            >
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
