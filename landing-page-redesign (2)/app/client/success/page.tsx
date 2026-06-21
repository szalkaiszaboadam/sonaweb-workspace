'use client'

import Link from 'next/link'
import { PageHeader } from '@/components/portal-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StatCard } from '@/components/stat-card'
import { UpsellCards } from '@/components/upsell-cards'
import { usePortal } from '@/lib/portal-store'
import { client } from '@/lib/data'
import { cn } from '@/lib/utils'
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Globe,
  FileText,
  CalendarCheck,
  Sparkles,
  Upload,
  ClipboardCheck,
} from 'lucide-react'

export default function SuccessPage() {
  const { content, meetings, ownedServices, setAssistantOpen } = usePortal()

  const pendingApprovals = content.filter(
    (c) => c.status === 'Waiting For Approval',
  )
  const upcomingMeeting = meetings.find((m) => m.status === 'Upcoming')

  const actions = [
    {
      id: 'approve',
      label: `Review ${pendingApprovals.length} item${pendingApprovals.length === 1 ? '' : 's'} awaiting approval`,
      href: '/client/content',
      icon: ClipboardCheck,
      done: pendingApprovals.length === 0,
    },
    {
      id: 'upload',
      label: 'Upload your latest brand assets',
      href: '/client/documents',
      icon: Upload,
      done: false,
    },
    {
      id: 'meeting',
      label: upcomingMeeting
        ? 'Strategy meeting booked — prep your questions'
        : 'Book your next strategy meeting',
      href: '/client/meetings',
      icon: CalendarCheck,
      done: !!upcomingMeeting,
    },
  ]

  const journey = [
    { label: 'Onboarding complete', done: true },
    { label: 'Website in development', done: true },
    { label: 'Content engine live', done: true },
    { label: 'Scale advertising', done: false },
  ]

  return (
    <>
      <PageHeader
        title="Success Center"
        description={`Welcome back, ${client.contact.split(' ')[0]}. Here's everything that needs your attention and how your growth is tracking.`}
      />

      {/* Health overview */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Account Health" value="Excellent" sub="on track" />
        <StatCard label="Active Services" value={String(ownedServices.length)} sub="in your plan" />
        <StatCard label="Open Actions" value={String(actions.filter((a) => !a.done).length)} sub="need attention" />
        <StatCard label="Goal Progress" value="72%" delta={8} sub="toward Q3 target" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Action items */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Your action items
            </h3>
            <span className="text-xs text-muted-foreground">
              {actions.filter((a) => !a.done).length} pending
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {actions.map((a) => (
              <Link
                key={a.id}
                href={a.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                  a.done
                    ? 'border-border bg-secondary/30'
                    : 'border-border hover:border-primary/40',
                )}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    a.done
                      ? 'bg-chart-2/15 text-chart-2'
                      : 'bg-primary/10 text-primary',
                  )}
                >
                  <a.icon className="h-4 w-4" />
                </span>
                <span
                  className={cn(
                    'flex-1 text-sm',
                    a.done
                      ? 'text-muted-foreground line-through'
                      : 'font-medium text-foreground',
                  )}
                >
                  {a.label}
                </span>
                {!a.done && (
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </Link>
            ))}
          </div>
        </Card>

        {/* Growth journey */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground">
            Your growth journey
          </h3>
          <div className="mt-4 space-y-4">
            {journey.map((step, i) => (
              <div key={step.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  {step.done ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  {i < journey.length - 1 && (
                    <span
                      className={cn(
                        'mt-1 h-8 w-px',
                        step.done ? 'bg-primary/40' : 'bg-border',
                      )}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    'pt-0.5 text-sm',
                    step.done
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Project + invoices snapshot */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Website project
            </h3>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Development phase</p>
          <div className="mt-2 flex items-center gap-3">
            <Progress value={64} className="h-2" />
            <span className="text-sm font-semibold text-foreground">64%</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/client/website" />}
            className="mt-4 w-full"
          >
            View project
          </Button>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Billing</h3>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Next invoice</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">$1,240</p>
          <p className="text-xs text-muted-foreground">Due Sep 1, 2026</p>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/client/invoices" />}
            className="mt-4 w-full"
          >
            View invoices
          </Button>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Next meeting
            </h3>
          </div>
          {upcomingMeeting ? (
            <>
              <p className="mt-3 text-sm font-medium text-foreground">
                {upcomingMeeting.type}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(
                  `${upcomingMeeting.date}T00:00:00`,
                ).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                · {upcomingMeeting.time}
              </p>
            </>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">
              No meeting scheduled.
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/client/meetings" />}
            className="mt-4 w-full"
          >
            {upcomingMeeting ? 'Manage meetings' : 'Book a meeting'}
          </Button>
        </Card>
      </div>

      {/* Smart upsell recommendations */}
      <UpsellCards className="mt-4" />

      {/* Assistant CTA */}
      <Card className="mt-4 flex flex-col items-start justify-between gap-4 bg-gradient-to-br from-primary/10 to-card p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Need guidance? Ask your AI strategist
            </h3>
            <p className="text-xs text-muted-foreground">
              Get instant answers about your performance and next best steps.
            </p>
          </div>
        </div>
        <Button onClick={() => setAssistantOpen(true)} className="gap-1.5">
          <Sparkles className="h-4 w-4" /> Open assistant
        </Button>
      </Card>
    </>
  )
}
