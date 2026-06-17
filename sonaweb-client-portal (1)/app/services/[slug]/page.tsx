'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  CalendarCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getMarketingService } from '@/lib/marketing'
import { BuyNowDialog } from '@/components/marketing/buy-now-dialog'

export default function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const service = getMarketingService(slug)
  const [buyOpen, setBuyOpen] = useState(false)
  const [pkg, setPkg] = useState<string | undefined>(undefined)

  if (!service) notFound()

  const Icon = service.icon

  function buy(packageName?: string) {
    setPkg(packageName)
    setBuyOpen(true)
  }

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-5xl px-4 py-12 lg:px-8 lg:py-16">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            All services
          </Link>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <Icon className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-medium uppercase tracking-wide text-primary">
                {service.category}
              </span>
              <h1 className="mt-1 text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
                {service.name}
              </h1>
              <p className="mt-3 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
                {service.description}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button onClick={() => buy()} className="gap-1.5">
                  Buy now
                </Button>
                <Button
                  variant="outline"
                  render={<Link href={`/book?service=${service.slug}`} />}
                  className="gap-1.5"
                >
                  <CalendarCheck className="h-4 w-4" />
                  Book consultation
                </Button>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {service.delivery}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-5xl gap-12 px-4 py-12 lg:grid-cols-3 lg:px-8 lg:py-16">
        {/* Main content */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-foreground">
            What&apos;s included
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {service.includes.map((inc) => (
              <li
                key={inc}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {inc}
              </li>
            ))}
          </ul>

          <h2 className="mt-10 text-xl font-semibold text-foreground">
            Who it&apos;s for
          </h2>
          <ul className="mt-4 space-y-2">
            {service.forWho.map((w) => (
              <li
                key={w}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {w}
              </li>
            ))}
          </ul>

          <h2 className="mt-10 text-xl font-semibold text-foreground">
            Frequently asked
          </h2>
          <div className="mt-4 space-y-4">
            {service.faq.map((f) => (
              <div
                key={f.q}
                className="rounded-xl border border-border bg-card p-4"
              >
                <p className="font-medium text-foreground">{f.q}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Packages sidebar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <h2 className="text-xl font-semibold text-foreground">Packages</h2>
            <div className="mt-4 space-y-3">
              {service.packages.map((p) => (
                <div
                  key={p.name}
                  className={cn(
                    'rounded-xl border p-4',
                    p.popular
                      ? 'border-primary ring-1 ring-primary'
                      : 'border-border',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      {p.name}
                    </span>
                    {p.popular && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">
                      {`$${p.price.toLocaleString()}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {p.unit === 'monthly' ? '/mo' : 'one-time'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{p.note}</p>
                  <ul className="mt-3 space-y-1.5">
                    {p.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => buy(p.name)}
                    variant={p.popular ? 'default' : 'outline'}
                    className="mt-4 w-full"
                  >
                    Buy {p.name}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BuyNowDialog
        service={service}
        open={buyOpen}
        onOpenChange={setBuyOpen}
        initialPackage={pkg}
      />
    </div>
  )
}
