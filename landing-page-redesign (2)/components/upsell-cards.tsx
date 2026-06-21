'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { usePortal } from '@/lib/portal-store'
import { serviceCatalog } from '@/lib/services'
import { recommendedUpsells } from '@/lib/qualification'
import { ArrowRight, Sparkles } from 'lucide-react'

export function UpsellCards({
  title = 'Recommended to accelerate your growth',
  subtitle = 'Smart picks based on the services you already use with SONAWEB.',
  limit = 3,
  className,
}: {
  title?: string
  subtitle?: string
  limit?: number
  className?: string
}) {
  const { ownedServices } = usePortal()

  const recommended = useMemo(() => {
    const ids = recommendedUpsells(ownedServices)
    const list = ids
      .map((id) => serviceCatalog.find((s) => s.id === id))
      .filter((s): s is (typeof serviceCatalog)[number] => Boolean(s))
    // Fallback: if no rule-based matches, surface any unowned services.
    if (list.length === 0) {
      return serviceCatalog
        .filter((s) => !ownedServices.includes(s.id))
        .slice(0, limit)
    }
    return list.slice(0, limit)
  }, [ownedServices, limit])

  if (recommended.length === 0) return null

  return (
    <Card className={className ? `p-5 ${className}` : 'p-5'}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {recommended.map((s) => (
          <Link
            key={s.id}
            href={`/client/services/${s.id}`}
            className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-secondary/30 p-4 transition-colors hover:border-primary/50"
          >
            <span className="text-[11px] uppercase tracking-wide text-primary">
              {s.category}
            </span>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {s.name}
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {s.tagline}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                ${s.price.toLocaleString()}
                <span className="text-xs font-normal text-muted-foreground">
                  {s.unit === 'monthly' ? '/mo' : ''}
                </span>
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-primary">
                Learn more
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  )
}
