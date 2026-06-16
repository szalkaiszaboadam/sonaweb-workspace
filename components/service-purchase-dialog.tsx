'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { usePortal } from '@/lib/portal-store'
import { type ServiceOffering } from '@/lib/services'
import { cn } from '@/lib/utils'
import {
  Check,
  Clock,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Apple,
  CreditCard,
  Bitcoin,
  Sparkles,
} from 'lucide-react'

type Pkg = {
  id: string
  name: string
  price: number
  period: string
  note: string
  popular?: boolean
}

type Step = 'details' | 'payment' | 'processing' | 'done'

function buildPackages(service: ServiceOffering): Pkg[] {
  if (service.unit === 'monthly') {
    return [
      {
        id: 'monthly',
        name: 'Monthly',
        price: service.price,
        period: '/mo',
        note: 'Billed monthly, cancel anytime',
      },
      {
        id: 'quarterly',
        name: 'Quarterly',
        price: Math.round(service.price * 3 * 0.9),
        period: '/qtr',
        note: 'Save 10% — billed every 3 months',
        popular: true,
      },
      {
        id: 'annual',
        name: 'Annual',
        price: Math.round(service.price * 12 * 0.8),
        period: '/yr',
        note: 'Save 20% — best value',
      },
    ]
  }
  return [
    {
      id: 'standard',
      name: 'Standard',
      price: service.price,
      period: 'one-time',
      note: 'Full scope as described',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: Math.round(service.price * 1.5),
      period: 'one-time',
      note: 'Priority delivery + extended support',
      popular: true,
    },
  ]
}

const paymentMethods = [
  { id: 'apple', label: 'Apple Pay', icon: Apple },
  { id: 'google', label: 'Google Pay', icon: CreditCard },
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'crypto', label: 'Crypto', icon: Bitcoin },
] as const

export function ServicePurchaseDialog({
  service,
  open,
  onOpenChange,
}: {
  service: ServiceOffering | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { hasService, unlockService } = usePortal()
  const [step, setStep] = useState<Step>('details')
  const [pkgId, setPkgId] = useState<string>('')
  const [method, setMethod] = useState<string>('')

  const packages = useMemo(
    () => (service ? buildPackages(service) : []),
    [service],
  )

  // Reset state whenever a new service is opened.
  useEffect(() => {
    if (open && service) {
      setStep(hasService(service.id) ? 'done' : 'details')
      setPkgId(packages.find((p) => p.popular)?.id ?? packages[0]?.id ?? '')
      setMethod('')
    }
  }, [open, service, packages, hasService])

  if (!service) return null

  const selectedPkg = packages.find((p) => p.id === pkgId)
  const owned = hasService(service.id)

  function pay() {
    setStep('processing')
    setTimeout(() => {
      unlockService(service!.id)
      setStep('done')
    }, 1600)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        {/* DETAILS STEP */}
        {step === 'details' && (
          <>
            <DialogHeader>
              <Badge className="mb-1 w-fit bg-primary/15 text-primary">
                {service.category}
              </Badge>
              <DialogTitle className="text-xl">{service.name}</DialogTitle>
              <DialogDescription>{service.tagline}</DialogDescription>
            </DialogHeader>

            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              {service.description}
            </p>

            <div className="flex flex-wrap gap-4 rounded-lg bg-secondary/40 px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-foreground">
                <Clock className="h-4 w-4 text-primary" />
                Delivery: {service.delivery}
              </span>
              <span className="flex items-center gap-2 text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                {service.unit === 'monthly' ? 'Cancel anytime' : 'Fixed scope'}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground">
                What&apos;s included
              </h4>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {service.includes.map((i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Choose a package
              </h4>
              <div className="mt-3 space-y-2">
                {packages.map((p) => {
                  const active = p.id === pkgId
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPkgId(p.id)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors',
                        active
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/40',
                      )}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {p.name}
                          </span>
                          {p.popular && (
                            <Badge className="bg-primary text-[10px] text-primary-foreground">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {p.note}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-semibold text-foreground">
                          ${p.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {p.period}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <Button
              size="lg"
              className="w-full gap-2"
              onClick={() => setStep('payment')}
            >
              Continue
            </Button>
          </>
        )}

        {/* PAYMENT STEP */}
        {step === 'payment' && selectedPkg && (
          <>
            <DialogHeader>
              <button
                type="button"
                onClick={() => setStep('details')}
                className="mb-1 flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              <DialogTitle className="text-xl">Complete payment</DialogTitle>
              <DialogDescription>
                {service.name} — {selectedPkg.name} plan
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-4 py-3">
              <span className="text-sm text-muted-foreground">Total due today</span>
              <span className="text-xl font-semibold text-foreground">
                ${selectedPkg.price.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground">
                  {selectedPkg.period}
                </span>
              </span>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Payment method
              </h4>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {paymentMethods.map((m) => {
                  const active = m.id === method
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl border p-3.5 text-sm font-medium transition-colors',
                        active
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                      )}
                    >
                      <m.icon className="h-4 w-4" />
                      {m.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <Button
              size="lg"
              className="w-full gap-2"
              disabled={!method}
              onClick={pay}
            >
              {method === 'apple' && <Apple className="h-4 w-4" />}
              {method === 'crypto' && <Bitcoin className="h-4 w-4" />}
              {(method === 'card' || method === 'google') && (
                <CreditCard className="h-4 w-4" />
              )}
              Pay ${selectedPkg.price.toLocaleString()}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              Encrypted, instant activation. No cart, no checkout queue.
            </p>
          </>
        )}

        {/* PROCESSING STEP */}
        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">
              Processing your payment...
            </p>
            <p className="text-xs text-muted-foreground">
              Activating {service.name}
            </p>
          </div>
        )}

        {/* DONE STEP */}
        {step === 'done' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                {owned ? 'Service active' : "You're all set"}
              </DialogTitle>
              <DialogDescription>
                {service.name} is now active in your portal.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground">
                  Your SONAWEB team has been notified
                </p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                We&apos;ll reach out shortly to kick off {service.name}. Track
                progress any time from your dashboard.
              </p>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Keep browsing
              </Button>
              <Button className="flex-1" render={<Link href="/client" />}>
                Go to dashboard
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
