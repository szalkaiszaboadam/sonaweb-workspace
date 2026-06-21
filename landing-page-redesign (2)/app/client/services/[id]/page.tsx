'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/portal-shell'
import { QualificationDialog } from '@/components/qualification-dialog'
import { usePortal } from '@/lib/portal-store'
import { getService, routeAccess, type ServiceId } from '@/lib/services'
import { categoryNeedsQualification } from '@/lib/qualification'
import {
  Check,
  Clock,
  Quote,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from 'lucide-react'

export default function ServiceSalesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { hasService, unlockService } = usePortal()
  const [stage, setStage] = useState<'idle' | 'processing' | 'done'>('idle')
  const [qualOpen, setQualOpen] = useState(false)

  const service = getService(id as ServiceId)

  if (!service) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Service not found.</p>
        <Button render={<Link href="/client" />} variant="outline">
          Back to dashboard
        </Button>
      </div>
    )
  }

  const owned = hasService(service.id)
  const needsQualification = categoryNeedsQualification(service.category)
  const unlockedRoute = Object.entries(routeAccess).find(([, ids]) =>
    ids.includes(service.id),
  )?.[0]

  function handleBuy() {
    setStage('processing')
    setTimeout(() => {
      unlockService(service!.id)
      setStage('done')
    }, 1400)
  }

  function startPurchase() {
    if (service && categoryNeedsQualification(service.category)) {
      setQualOpen(true)
    } else {
      handleBuy()
    }
  }

  return (
    <>
      <Link
        href="/client/services"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <PageHeader
        title={service.name}
        description={service.tagline}
        action={
          <Badge className="bg-primary/15 text-primary">
            {service.category}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-foreground">Overview</h3>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
              {service.description}
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-foreground">
              What&apos;s included
            </h3>
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {service.includes.map((i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {i}
                </li>
              ))}
            </ul>
          </Card>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {service.benefits.map((b) => (
              <Card key={b} className="p-5">
                <Sparkles className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm font-medium text-foreground">{b}</p>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <Quote className="h-6 w-6 text-primary/60" />
            <p className="mt-3 text-pretty text-base leading-relaxed text-foreground">
              {service.caseStudy.result}.
            </p>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {service.caseStudy.client}
              </p>
              <Badge className="bg-secondary text-foreground">
                {service.caseStudy.metric}
              </Badge>
            </div>
          </Card>
        </div>

        {/* Purchase panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20 p-6">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-semibold text-foreground">
                ${service.price.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">
                {service.unit === 'monthly' ? '/ month' : 'one-time'}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                Delivery: {service.delivery}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                Cancel anytime
              </div>
            </div>

            <Separator className="my-5" />

            {owned || stage === 'done' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2.5 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Service active
                </div>
                {unlockedRoute && (
                  <Button
                    render={<Link href={unlockedRoute} />}
                    className="w-full"
                  >
                    Open dashboard
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Button
                  onClick={startPurchase}
                  disabled={stage === 'processing'}
                  className="w-full gap-2"
                >
                  {stage === 'processing' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing payment...
                    </>
                  ) : needsQualification ? (
                    'Check my fit & buy'
                  ) : (
                    'Buy Now'
                  )}
                </Button>
                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  {needsQualification
                    ? 'A 60-second qualification confirms fit before checkout.'
                    : 'Secure checkout. Unlocks instantly after payment.'}
                </p>
              </>
            )}
          </Card>
        </div>
      </div>

      {needsQualification && (
        <QualificationDialog
          service={service}
          open={qualOpen}
          onOpenChange={setQualOpen}
          onQualified={handleBuy}
        />
      )}
    </>
  )
}
