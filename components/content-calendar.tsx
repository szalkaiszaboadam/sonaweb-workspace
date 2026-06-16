'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { usePortal, type ContentItem } from '@/lib/portal-store'
import { statusDot, PlatformIcon } from '@/components/platform-badge'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function ymd(d: Date) {
  return d.toISOString().slice(0, 10)
}

function startOfWeek(d: Date) {
  const date = new Date(d)
  const day = (date.getDay() + 6) % 7 // Monday = 0
  date.setDate(date.getDate() - day)
  date.setHours(0, 0, 0, 0)
  return date
}

export function ContentCalendar({
  view,
  onAdd,
}: {
  view: 'month' | 'week'
  onAdd: (date: string) => void
}) {
  const { content } = usePortal()
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  const byDate = content.reduce<Record<string, ContentItem[]>>((acc, c) => {
    ;(acc[c.date] ??= []).push(c)
    return acc
  }, {})

  const todayStr = ymd(new Date())

  // Build the visible day cells
  let days: Date[] = []
  let title = ''

  if (view === 'month') {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const gridStart = startOfWeek(first)
    days = Array.from({ length: 42 }, (_, i) => {
      const d = new Date(gridStart)
      d.setDate(gridStart.getDate() + i)
      return d
    })
    title = cursor.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  } else {
    const ws = startOfWeek(cursor)
    days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(ws)
      d.setDate(ws.getDate() + i)
      return d
    })
    const we = new Date(ws)
    we.setDate(ws.getDate() + 6)
    title = `${ws.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${we.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }

  function shift(dir: number) {
    const d = new Date(cursor)
    if (view === 'month') d.setMonth(d.getMonth() + dir)
    else d.setDate(d.getDate() + dir * 7)
    setCursor(d)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => shift(-1)}
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => shift(1)}
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h3 className="ml-1 text-sm font-semibold text-foreground">{title}</h3>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-border bg-border">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="bg-card px-2 py-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
          >
            {d}
          </div>
        ))}
        {days.map((d) => {
          const key = ymd(d)
          const items = byDate[key] ?? []
          const inMonth = view === 'week' || d.getMonth() === cursor.getMonth()
          const isToday = key === todayStr
          return (
            <div
              key={key}
              className={cn(
                'group relative min-h-24 bg-card p-1.5 transition-colors hover:bg-secondary/40 lg:min-h-28',
                !inMonth && 'opacity-40',
                view === 'week' && 'min-h-48',
              )}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs',
                    isToday
                      ? 'bg-primary font-semibold text-primary-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {d.getDate()}
                </span>
                <button
                  onClick={() => onAdd(key)}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Add content"
                >
                  <Plus className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
              <div className="space-y-1">
                {items.slice(0, view === 'week' ? 8 : 3).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-1.5 rounded-md bg-secondary/60 px-1.5 py-1"
                    title={`${c.title} · ${c.status}`}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 shrink-0 rounded-full',
                        statusDot[c.status],
                      )}
                    />
                    <PlatformIcon
                      platform={c.platform}
                      className="h-4 w-4 [&_svg]:h-2.5 [&_svg]:w-2.5"
                    />
                    <span className="truncate text-[11px] text-foreground">
                      {c.time} {c.title}
                    </span>
                  </div>
                ))}
                {items.length > (view === 'week' ? 8 : 3) && (
                  <p className="px-1 text-[10px] text-muted-foreground">
                    +{items.length - (view === 'week' ? 8 : 3)} more
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
