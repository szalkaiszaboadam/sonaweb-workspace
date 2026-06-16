'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  CalendarCheck,
  Clock,
  Check,
  Loader2,
  CalendarDays,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { meetingTypes, availableSlots } from '@/lib/marketing'

export default function BookPage() {
  return (
    <Suspense fallback={null}>
      <BookFlow />
    </Suspense>
  )
}

function formatDay(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function BookFlow() {
  const searchParams = useSearchParams()
  const preService = searchParams.get('service')

  const [typeId, setTypeId] = useState(meetingTypes[0].id)
  const [date, setDate] = useState<string | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState(
    preService ? `I'm interested in your ${preService.replace(/-/g, ' ')} service.` : '',
  )
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const selectedType = meetingTypes.find((m) => m.id === typeId)!
  const dayTimes = availableSlots.find((s) => s.date === date)?.times ?? []
  const canSubmit = date && time && name && email

  function submit() {
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setConfirmed(true)
    }, 1300)
  }

  if (confirmed) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CalendarCheck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground">
          You&apos;re booked!
        </h1>
        <p className="mt-2 text-muted-foreground">
          {`Your ${selectedType.name} is confirmed for ${date ? formatDay(date) : ''} at ${time}. We've sent a confirmation to ${email}.`}
        </p>
        <Button className="mt-8" onClick={() => window.location.assign('/')}>
          Back to home
        </Button>
      </div>
    )
  }

  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-5xl px-4 py-12 lg:px-8 lg:py-16">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            Book a free consultation
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-lg text-muted-foreground">
            Pick a time that works for you. A senior strategist will map out your
            highest-impact next steps — no obligation.
          </p>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-12 lg:grid-cols-3 lg:px-8 lg:py-16">
        <div className="space-y-10 lg:col-span-2">
          {/* Step 1: meeting type */}
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <StepBadge n={1} />
              Choose a meeting type
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {meetingTypes.map((m) => {
                const active = m.id === typeId
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setTypeId(m.id)}
                    className={cn(
                      'rounded-xl border p-4 text-left transition-colors',
                      active
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-muted-foreground/40',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{m.name}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {m.duration}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-snug text-muted-foreground">
                      {m.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 2: date & time */}
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <StepBadge n={2} />
              Pick a date &amp; time
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {availableSlots.map((slot) => {
                const active = slot.date === date
                return (
                  <button
                    key={slot.date}
                    type="button"
                    onClick={() => {
                      setDate(slot.date)
                      setTime(null)
                    }}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <CalendarDays className="h-4 w-4" />
                    {formatDay(slot.date)}
                  </button>
                )
              })}
            </div>

            {date && (
              <div className="mt-4 flex flex-wrap gap-2">
                {dayTimes.map((t) => {
                  const active = t === time
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTime(t)}
                      className={cn(
                        'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Step 3: details */}
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <StepBadge n={3} />
              Your details
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="bk-name">Full name</Label>
                <Input
                  id="bk-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jordan Hayes"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bk-email">Email</Label>
                <Input
                  id="bk-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="bk-notes">What would you like to discuss?</Label>
                <Textarea
                  id="bk-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Tell us a little about your goals…"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">Your booking</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <Row label="Meeting" value={selectedType.name} />
                <Row label="Duration" value={selectedType.duration} />
                <Row label="Date" value={date ? formatDay(date) : 'Not selected'} />
                <Row label="Time" value={time ?? 'Not selected'} />
              </dl>
              <Button
                className="mt-6 w-full"
                disabled={!canSubmit || submitting}
                onClick={submit}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Confirming…
                  </>
                ) : (
                  'Confirm booking'
                )}
              </Button>
              <ul className="mt-4 space-y-1.5">
                {['Free, no obligation', 'Senior strategist', 'Tailored action plan'].map(
                  (item) => (
                    <li
                      key={item}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      <Check className="h-3.5 w-3.5 text-primary" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
      {n}
    </span>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  )
}
