'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check,
  CreditCard,
  Apple,
  Bitcoin,
  Loader2,
  ShieldCheck,
  ArrowLeft,
  PartyPopper,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { MarketingService, ServicePackage } from '@/lib/marketing'

type Step = 'package' | 'payment' | 'account' | 'done'

const paymentMethods = [
  { id: 'apple', label: 'Apple Pay', icon: Apple },
  { id: 'google', label: 'Google Pay', icon: CreditCard },
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'crypto', label: 'Crypto', icon: Bitcoin },
] as const

export function BuyNowDialog({
  service,
  open,
  onOpenChange,
  initialPackage,
}: {
  service: MarketingService
  open: boolean
  onOpenChange: (open: boolean) => void
  initialPackage?: string
}) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('package')
  const [selected, setSelected] = useState<ServicePackage>(
    service.packages.find((p) => p.name === initialPackage) ??
      service.packages.find((p) => p.popular) ??
      service.packages[0],
  )
  const [method, setMethod] = useState<(typeof paymentMethods)[number]['id']>('apple')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [processing, setProcessing] = useState(false)

  function reset() {
    setStep('package')
    setProcessing(false)
  }

  function handleClose(next: boolean) {
    if (!next) setTimeout(reset, 200)
    onOpenChange(next)
  }

  function pay() {
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setStep('account')
    }, 1400)
  }

  function createAccount() {
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setStep('done')
    }, 1200)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {step === 'package' && (
          <>
            <DialogHeader>
              <DialogTitle>{service.name}</DialogTitle>
              <DialogDescription>{service.tagline}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {service.packages.map((pkg) => {
                const active = pkg.name === selected.name
                return (
                  <button
                    key={pkg.name}
                    type="button"
                    onClick={() => setSelected(pkg)}
                    className={cn(
                      'w-full rounded-xl border p-4 text-left transition-colors',
                      active
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-muted-foreground/40',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {pkg.name}
                        </span>
                        {pkg.popular && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-foreground">
                          {`$${pkg.price.toLocaleString()}`}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {pkg.unit === 'monthly' ? 'per month' : 'one-time'}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{pkg.note}</p>
                    <ul className="mt-3 space-y-1.5">
                      {pkg.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                )
              })}
            </div>
            <Button className="w-full" onClick={() => setStep('payment')}>
              {`Continue · $${selected.price.toLocaleString()}${selected.unit === 'monthly' ? '/mo' : ''}`}
            </Button>
          </>
        )}

        {step === 'payment' && (
          <>
            <DialogHeader>
              <button
                type="button"
                onClick={() => setStep('package')}
                className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              <DialogTitle>Instant checkout</DialogTitle>
              <DialogDescription>
                No cart, no queue. Pay and get started in seconds.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {`${service.name} — ${selected.name}`}
                </span>
                <span className="font-semibold text-foreground">
                  {`$${selected.price.toLocaleString()}${selected.unit === 'monthly' ? '/mo' : ''}`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((m) => {
                const Icon = m.icon
                const active = method === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors',
                      active
                        ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                        : 'border-border text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {m.label}
                  </button>
                )
              })}
            </div>

            <Button className="w-full" onClick={pay} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                `Pay $${selected.price.toLocaleString()}${selected.unit === 'monthly' ? '/mo' : ''}`
              )}
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secured & encrypted payment
            </p>
          </>
        )}

        {step === 'account' && (
          <>
            <DialogHeader>
              <DialogTitle>Create your client account</DialogTitle>
              <DialogDescription>
                Your payment is confirmed. Set up your account to access your
                project dashboard and onboarding.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="bn-name">Full name</Label>
                <Input
                  id="bn-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jordan Hayes"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bn-email">Email</Label>
                <Input
                  id="bn-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bn-password">Password</Label>
                <Input
                  id="bn-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                />
              </div>
            </div>

            <Button
              className="w-full"
              onClick={createAccount}
              disabled={processing || !name || !email || !password}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                'Create account & start onboarding'
              )}
            </Button>
          </>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <PartyPopper className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Welcome to SONAWEB!
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {`Your ${service.name} (${selected.name}) is active. We've created your account and your onboarding is ready in the client dashboard.`}
            </p>
            <Button
              className="mt-6 w-full"
              onClick={() => {
                router.push('/client')
                onOpenChange(false)
                setTimeout(reset, 200)
              }}
            >
              Go to onboarding
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
