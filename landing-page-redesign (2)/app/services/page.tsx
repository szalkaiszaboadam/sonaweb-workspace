'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  marketingServices,
  marketingCategories,
  type MarketingCategory,
  type MarketingService,
} from '@/lib/marketing'
import { BuyNowDialog } from '@/components/marketing/buy-now-dialog'

export default function ServicesPage() {
  return (
    <Suspense fallback={null}>
      <ServicesCatalog />
    </Suspense>
  )
}

function ServicesCatalog() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') as MarketingCategory | null
  const [filter, setFilter] = useState<MarketingCategory | 'All'>(
    initialCategory ?? 'All',
  )
  const [buyService, setBuyService] = useState<MarketingService | null>(null)

  const filtered =
    filter === 'All'
      ? marketingServices
      : marketingServices.filter((s) => s.category === filter)

  return (
    <div>
      {/* Header */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            Services built to move the metrics that matter
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-lg text-muted-foreground">
            Buy a service instantly and start onboarding in minutes, or book a
            consultation to map the right plan first.
          </p>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-16 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-4 py-3 lg:px-8">
          <FilterChip
            label="All"
            active={filter === 'All'}
            onClick={() => setFilter('All')}
          />
          {marketingCategories.map((cat) => (
            <FilterChip
              key={cat.id}
              label={cat.label}
              active={filter === cat.id}
              onClick={() => setFilter(cat.id)}
            />
          ))}
        </div>
      </div>

      {/* Grid */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service) => {
            const Icon = service.icon
            const from = Math.min(...service.packages.map((p) => p.price))
            const isMonthly = service.packages.some((p) => p.unit === 'monthly')
            return (
              <div
                key={service.slug}
                className="flex flex-col rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                    {service.category}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {service.name}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {service.tagline}
                </p>

                <ul className="mt-4 flex-1 space-y-1.5">
                  {service.includes.slice(0, 3).map((inc) => (
                    <li
                      key={inc}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {inc}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">
                    {`$${from.toLocaleString()}`}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {isMonthly ? '/mo' : ' one-time'}
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <Button onClick={() => setBuyService(service)} className="w-full">
                    Buy now
                  </Button>
                  <Button
                    variant="outline"
                    render={<Link href={`/services/${service.slug}`} />}
                    className="w-full gap-1.5"
                  >
                    Details & consultation
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {buyService && (
        <BuyNowDialog
          service={buyService}
          open={!!buyService}
          onOpenChange={(o) => !o && setBuyService(null)}
        />
      )}
    </div>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'border border-border text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}
