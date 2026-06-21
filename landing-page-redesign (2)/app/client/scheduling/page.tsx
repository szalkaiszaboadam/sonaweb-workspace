'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/portal-shell'
import { LockedGate } from '@/components/locked-gate'
import { ContentCalendar } from '@/components/content-calendar'
import { ContentComposer } from '@/components/content-composer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { usePortal, type ContentStatus } from '@/lib/portal-store'
import { statusDot, statusStyles, PlatformIcon } from '@/components/platform-badge'
import { cn } from '@/lib/utils'
import { Plus, CalendarClock } from 'lucide-react'

const legend: ContentStatus[] = [
  'Draft',
  'Waiting For Approval',
  'Approved',
  'Scheduled',
  'Published',
  'Rejected',
]

export default function SchedulingPage() {
  const { content } = usePortal()
  const [view, setView] = useState<'month' | 'week' | 'list'>('month')
  const [composerOpen, setComposerOpen] = useState(false)
  const [composerDate, setComposerDate] = useState<string | undefined>()

  function openComposer(date?: string) {
    setComposerDate(date)
    setComposerOpen(true)
  }

  const upcoming = [...content]
    .filter((c) => c.status !== 'Published')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))

  return (
    <LockedGate route="/client/scheduling">
      <PageHeader
        title="Content Scheduling"
        description="Plan, schedule and track all your TikTok, Instagram and Facebook content."
        action={
          <Button onClick={() => openComposer()} className="gap-2">
            <Plus className="h-4 w-4" />
            Schedule content
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {legend.map((s) => (
            <span
              key={s}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
            >
              <span className={cn('h-2 w-2 rounded-full', statusDot[s])} />
              {s}
            </span>
          ))}
        </div>
      </div>

      <Card className="p-4 lg:p-5">
        {view === 'list' ? (
          <div className="space-y-2">
            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarClock className="h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Nothing scheduled yet.
                </p>
              </div>
            ) : (
              upcoming.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <PlatformIcon platform={c.platform} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {c.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.type} ·{' '}
                      {new Date(c.date + 'T00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at {c.time}
                    </p>
                  </div>
                  <Badge className={statusStyles[c.status]}>{c.status}</Badge>
                </div>
              ))
            )}
          </div>
        ) : (
          <ContentCalendar view={view} onAdd={openComposer} />
        )}
      </Card>

      <ContentComposer
        open={composerOpen}
        onOpenChange={setComposerOpen}
        defaultDate={composerDate}
      />
    </LockedGate>
  )
}
