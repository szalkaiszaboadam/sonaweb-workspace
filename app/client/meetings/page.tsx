'use client'

import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/portal-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePortal } from '@/lib/portal-store'
import { cn } from '@/lib/utils'
import {
  Video,
  Phone,
  PenTool,
  TrendingUp,
  Clock,
  Calendar,
  Check,
  CalendarCheck,
} from 'lucide-react'

const meetingTypes = [
  {
    id: 'strategy',
    name: 'Strategy Session',
    desc: 'Deep dive into your growth roadmap and priorities.',
    icon: TrendingUp,
    durations: [30, 60],
    mode: 'Google Meet',
  },
  {
    id: 'consultation',
    name: 'Marketing Consultation',
    desc: 'Review campaigns, content and ad performance together.',
    icon: Video,
    durations: [30, 45],
    mode: 'Google Meet',
  },
  {
    id: 'design',
    name: 'Design Review',
    desc: 'Walk through your website or creative work in progress.',
    icon: PenTool,
    durations: [30, 60],
    mode: 'Google Meet',
  },
  {
    id: 'quick',
    name: 'Quick Call',
    desc: 'A focused 15-minute check-in on a specific question.',
    icon: Phone,
    durations: [15],
    mode: 'Phone',
  },
]

const timeSlots = [
  '09:00',
  '09:30',
  '10:00',
  '11:00',
  '13:00',
  '14:00',
  '15:30',
  '16:00',
  '17:00',
]

function nextDays(count: number) {
  const days = []
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

export default function MeetingsPage() {
  const { meetings, addMeeting } = usePortal()
  const days = useMemo(() => nextDays(8), [])

  const [typeId, setTypeId] = useState(meetingTypes[1].id)
  const [duration, setDuration] = useState(30)
  const [date, setDate] = useState<Date>(days[0])
  const [time, setTime] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const selectedType = meetingTypes.find((t) => t.id === typeId)!

  const upcoming = meetings.filter((m) => m.status === 'Upcoming')

  function book() {
    if (!time) return
    addMeeting({
      type: selectedType.name,
      date: date.toISOString().slice(0, 10),
      time,
      duration,
    })
    setConfirmed(true)
    setTime('')
    setTimeout(() => setConfirmed(false), 4000)
  }

  return (
    <>
      <PageHeader
        title="Book a Meeting"
        description="Schedule time with your SONAWEB strategist. Pick a type, duration and slot."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Meeting types */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground">
              1 · Choose a meeting type
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {meetingTypes.map((t) => {
                const active = t.id === typeId
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTypeId(t.id)
                      setDuration(t.durations[0])
                    }}
                    className={cn(
                      'flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors',
                      active
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg',
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground',
                      )}
                    >
                      <t.icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {t.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </Card>

          {/* Duration + date + time */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground">
              2 · Duration
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedType.durations.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors',
                    duration === d
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/40',
                  )}
                >
                  <Clock className="h-3.5 w-3.5" /> {d} min
                </button>
              ))}
            </div>

            <h3 className="mt-5 text-sm font-semibold text-foreground">
              3 · Select a date
            </h3>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {days.map((d) => {
                const active = d.toDateString() === date.toDateString()
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => setDate(d)}
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
                    <span className="text-[11px] text-muted-foreground">
                      {d.toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  </button>
                )
              })}
            </div>

            <h3 className="mt-5 text-sm font-semibold text-foreground">
              4 · Select a time
            </h3>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setTime(slot)}
                  className={cn(
                    'rounded-lg border py-2 text-sm transition-colors',
                    time === slot
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-foreground hover:border-primary/40',
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {selectedType.name} · {duration} min ·{' '}
                {date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
                {time ? ` · ${time}` : ''} · {selectedType.mode}
              </p>
              <Button onClick={book} disabled={!time} className="gap-1.5">
                <CalendarCheck className="h-4 w-4" />
                Confirm booking
              </Button>
            </div>

            {confirmed && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-chart-2/15 px-3 py-2 text-sm text-chart-2">
                <Check className="h-4 w-4" /> Meeting confirmed — a calendar
                invite is on its way.
              </div>
            )}
          </Card>
        </div>

        {/* Upcoming */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground">
              Upcoming meetings
            </h3>
            {upcoming.length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">
                No meetings scheduled yet.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {upcoming.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-start gap-3 rounded-lg border border-border p-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {m.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(`${m.date}T00:00:00`).toLocaleDateString(
                          'en-US',
                          { weekday: 'short', month: 'short', day: 'numeric' },
                        )}{' '}
                        · {m.time} · {m.duration} min
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground">
              What to expect
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              {[
                'A confirmation and calendar invite immediately after booking',
                'A dedicated strategist who knows your account',
                'A short recap with action items after the call',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}
