'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePortal } from '@/lib/portal-store'
import { routeAccess, getService } from '@/lib/services'
import { Lock, ArrowRight, Check } from 'lucide-react'

// Wraps a gated page. If the client doesn't own a required service, it shows a
// premium upsell instead of the page content.
export function LockedGate({
  route,
  children,
}: {
  route: string
  children: React.ReactNode
}) {
  const { isRouteUnlocked } = usePortal()

  if (isRouteUnlocked(route)) return <>{children}</>

  const serviceId = routeAccess[route]?.[0]
  const service = serviceId ? getService(serviceId) : undefined

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary glow-red">
          <Lock className="h-7 w-7" />
        </span>
        <h2 className="mt-5 text-xl font-semibold text-foreground">
          {service?.name ?? 'This service'} is locked
        </h2>
        <p className="mt-2 text-pretty text-sm text-muted-foreground">
          {service?.tagline ??
            'Unlock this service to access these tools and reports.'}
        </p>
        {service && (
          <ul className="mx-auto mt-5 space-y-2 text-left">
            {service.benefits.map((b) => (
              <li
                key={b}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <Check className="h-4 w-4 shrink-0 text-primary" />
                {b}
              </li>
            ))}
          </ul>
        )}
        <Button
          render={<Link href={`/client/services/${serviceId}`} />}
          className="mt-6 w-full gap-2"
        >
          View service & unlock
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Card>
    </div>
  )
}
