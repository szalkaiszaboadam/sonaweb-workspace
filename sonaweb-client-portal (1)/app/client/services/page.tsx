'use client'

import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/portal-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ServicePurchaseDialog } from '@/components/service-purchase-dialog'
import { usePortal } from '@/lib/portal-store'
import {
  serviceCatalog,
  type ServiceOffering,
} from '@/lib/services'
import { cn } from '@/lib/utils'
import {
  Globe,
  Music2,
  ImageIcon,
  Megaphone,
  Mail,
  Check,
  Clock,
  CheckCircle2,
  Zap,
} from 'lucide-react'

const categoryOrder: ServiceOffering['category'][] = [
  'Website',
  'TikTok',
  'Content',
  'Advertising',
  'Email',
]

const categoryMeta: Record<
  ServiceOffering['category'],
  { icon: typeof Globe; blurb: string }
> = {
  Website: {
    icon: Globe,
    blurb: 'Conversion-focused sites and ongoing care.',
  },
  TikTok: {
    icon: Music2,
    blurb: 'Short-form growth and managed production.',
  },
  Content: {
    icon: ImageIcon,
    blurb: 'On-brand social content, fully managed.',
  },
  Advertising: {
    icon: Megaphone,
    blurb: 'Profitable paid campaigns across channels.',
  },
  Email: {
    icon: Mail,
    blurb: 'Email and newsletters that drive repeat revenue.',
  },
}

export default function ServicesCatalogPage() {
  const { hasService } = usePortal()
  const [active, setActive] = useState<ServiceOffering | null>(null)
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | ServiceOffering['category']>(
    'all',
  )

  const grouped = useMemo(() => {
    return categoryOrder
      .filter((c) => filter === 'all' || c === filter)
      .map((category) => ({
        category,
        items: serviceCatalog.filter((s) => s.category === category),
      }))
  }, [filter])

  const ownedCount = serviceCatalog.filter((s) => hasService(s.id)).length

  function openService(service: ServiceOffering) {
    setActive(service)
    setOpen(true)
  }

  return (
    <>
      <PageHeader
        title="Services"
        description="Browse everything SONAWEB offers and activate instantly — no cart, no waiting."
        action={
          <Badge className="gap-1.5 bg-primary/15 text-primary">
            <Zap className="h-3.5 w-3.5" />
            {ownedCount} active
          </Badge>
        }
      />

      {/* Category filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip
          label="All"
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        {categoryOrder.map((c) => (
          <FilterChip
            key={c}
            label={c}
            active={filter === c}
            onClick={() => setFilter(c)}
          />
        ))}
      </div>

      <div className="space-y-10">
        {grouped.map(({ category, items }) => {
          const Meta = categoryMeta[category]
          return (
            <section key={category}>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Meta.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {category}
                  </h2>
                  <p className="text-xs text-muted-foreground">{Meta.blurb}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((service) => {
                  const owned = hasService(service.id)
                  return (
                    <Card
                      key={service.id}
                      className="flex flex-col p-5 transition-colors hover:border-primary/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-pretty text-base font-semibold text-foreground">
                          {service.name}
                        </h3>
                        {owned && (
                          <Badge className="shrink-0 gap-1 bg-primary/15 text-primary">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                        {service.tagline}
                      </p>

                      <ul className="mt-4 space-y-1.5">
                        {service.includes.slice(0, 3).map((i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-xs text-muted-foreground"
                          >
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                            {i}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {service.delivery}
                      </div>

                      <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-semibold text-foreground">
                            ${service.price.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {service.unit === 'monthly' ? '/mo' : 'once'}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant={owned ? 'outline' : 'default'}
                          onClick={() => openService(service)}
                        >
                          {owned ? 'Manage' : 'Get started'}
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      <ServicePurchaseDialog
        service={active}
        open={open}
        onOpenChange={setOpen}
      />
    </>
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
        'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}
