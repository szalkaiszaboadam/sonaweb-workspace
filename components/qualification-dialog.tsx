'use client'

import { useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePortal } from '@/lib/portal-store'
import { client } from '@/lib/data'
import { cn } from '@/lib/utils'
import type { ServiceOffering } from '@/lib/services'
import {
  qualQuestions,
  evaluateQualification,
  consultationByCategory,
  type QualCategory,
  type QualResult,
} from '@/lib/qualification'
import {
  Sparkles,
  CheckCircle2,
  CalendarCheck,
  Clock,
  ArrowRight,
  Gauge,
  Check,
} from 'lucide-react'

type Stage = 'form' | 'result' | 'consultation' | 'booked'

const consultSlots = ['09:30', '11:00', '13:30', '15:00', '16:30']

function consultDays(count: number) {
  const days: Date[] = []
  const d = new Date()
  let added = 0
  while (added < count) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      days.push(new Date(d))
      added++
    }
  }
  return days
}

export function QualificationDialog({
  service,
  open,
  onOpenChange,
  onQualified,
}: {
  service: ServiceOffering
  open: boolean
  onOpenChange: (open: boolean) => void
  onQualified: () => void
}) {
  const { addLead, addMeeting } = usePortal()
  const category = service.category as QualCategory
  const fields = qualQuestions[category]

  const [stage, setStage] = useState<Stage>('form')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<QualResult | null>(null)
  const days = useMemo(() => consultDays(6), [])
  const [cDate, setCDate] = useState<Date>(days[0])
  const [cTime, setCTime] = useState('')

  const consultationType = consultationByCategory[category]

  const complete = fields.every((f) => (answers[f.id] ?? '').trim().length > 0)

  function reset() {
    setStage('form')
    setAnswers({})
    setResult(null)
    setCTime('')
  }

  function handleSubmit() {
    const res = evaluateQualification(service, answers)
    setResult(res)
    addLead({
      name: client.contact,
      company: client.name,
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      answers: fields.map((f) => ({
        label: f.label,
        value: f.options
          ? (f.options.find((o) => o.value === answers[f.id])?.label ??
            answers[f.id])
          : answers[f.id],
      })),
      score: res.score,
      tier: res.tier,
      revenuePotential: res.revenuePotential,
    })
    setStage('result')
  }

  function bookConsult() {
    if (!cTime) return
    addMeeting({
      type: consultationType,
      date: cDate.toISOString().slice(0, 10),
      time: cTime,
      duration: 30,
    })
    setStage('booked')
  }

  function close(next: boolean) {
    onOpenChange(next)
    if (!next) setTimeout(reset, 200)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {stage === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                Quick qualification
              </DialogTitle>
              <DialogDescription>
                Takes under 60 seconds. This helps us confirm {service.name} is
                the right fit before you invest.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {fields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    {field.label}
                  </label>
                  {field.kind === 'text' ? (
                    <Input
                      value={answers[field.id] ?? ''}
                      placeholder={field.placeholder}
                      onChange={(e) =>
                        setAnswers((p) => ({ ...p, [field.id]: e.target.value }))
                      }
                    />
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {field.options!.map((o) => {
                        const active = answers[field.id] === o.value
                        return (
                          <button
                            key={o.value}
                            type="button"
                            onClick={() =>
                              setAnswers((p) => ({ ...p, [field.id]: o.value }))
                            }
                            className={cn(
                              'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                              active
                                ? 'border-primary bg-primary/5 text-foreground'
                                : 'border-border text-muted-foreground hover:border-primary/40',
                            )}
                          >
                            {o.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!complete}
              className="w-full gap-1.5"
            >
              See my result
              <ArrowRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {stage === 'result' && result && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {result.tier === 'low' ? (
                  <Sparkles className="h-5 w-5 text-primary" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-chart-2" />
                )}
                {result.headline}
              </DialogTitle>
              <DialogDescription>{result.message}</DialogDescription>
            </DialogHeader>

            <div className="my-2 rounded-xl border border-border p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your fit score</span>
                <span className="font-semibold text-foreground">
                  {result.score}/100
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    result.tier === 'high'
                      ? 'bg-chart-2'
                      : result.tier === 'medium'
                        ? 'bg-chart-4'
                        : 'bg-primary',
                  )}
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>

            {result.allowPurchase ? (
              <Button
                onClick={() => {
                  close(false)
                  onQualified()
                }}
                className="w-full"
              >
                Continue to checkout
              </Button>
            ) : (
              <Button
                onClick={() => setStage('consultation')}
                className="w-full gap-1.5"
              >
                <CalendarCheck className="h-4 w-4" />
                Book Free Consultation
              </Button>
            )}
          </>
        )}

        {stage === 'consultation' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-primary" />
                {consultationType}
              </DialogTitle>
              <DialogDescription>
                Pick a time that works for you. Your strategist will map out the
                best path forward — no commitment required.
              </DialogDescription>
            </DialogHeader>

            <div className="py-1">
              <p className="text-sm font-medium text-foreground">Select a date</p>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {days.map((d) => {
                  const active = d.toDateString() === cDate.toDateString()
                  return (
                    <button
                      key={d.toISOString()}
                      onClick={() => setCDate(d)}
                      className={cn(
                        'flex min-w-16 flex-col items-center rounded-lg border px-3 py-2 transition-colors',
                        active
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40',
                      )}
                    >
                      <span className="text-[11px] uppercase text-muted-foreground">
                        {d.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-lg font-semibold text-foreground">
                        {d.getDate()}
                      </span>
                    </button>
                  )
                })}
              </div>

              <p className="mt-4 text-sm font-medium text-foreground">
                Select a time
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {consultSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setCTime(slot)}
                    className={cn(
                      'flex items-center justify-center gap-1 rounded-lg border py-2 text-sm transition-colors',
                      cTime === slot
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-foreground hover:border-primary/40',
                    )}
                  >
                    <Clock className="h-3 w-3" />
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={bookConsult} disabled={!cTime} className="w-full">
              Confirm consultation
            </Button>
          </>
        )}

        {stage === 'booked' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-chart-2/15 text-chart-2">
              <Check className="h-7 w-7" />
            </span>
            <h3 className="text-lg font-semibold text-foreground">
              Consultation booked
            </h3>
            <p className="max-w-xs text-sm text-muted-foreground">
              Your {consultationType.toLowerCase()} is confirmed for{' '}
              {cDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}{' '}
              at {cTime}. We&apos;ve sent a calendar invite your way.
            </p>
            <Button variant="outline" onClick={() => close(false)} className="mt-2">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
