'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { TeamPageHeader } from '@/components/team-shell'
import { StatCard } from '@/components/stat-card'
import { ClientWorldMap } from '@/components/client-world-map'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAgency, type ServiceCategory } from '@/lib/agency-store'
import { cn } from '@/lib/utils'
import {
  Globe,
  Music2,
  ImageIcon,
  Megaphone,
  Mail,
  Video,
  FileImage,
  CalendarClock,
  AlertTriangle,
  Camera,
  ArrowRight,
} from 'lucide-react'

const categoryIcon: Record<ServiceCategory, typeof Globe> = {
  Website: Globe,
  TikTok: Music2,
  Content: ImageIcon,
  Advertising: Megaphone,
  Email: Mail,
}

const categories: ServiceCategory[] = [
  'Website',
  'TikTok',
  'Content',
  'Advertising',
  'Email',
]

export default function CommandCenterPage() {
  const { clients, metrics, approvals, meetings } = useAgency()

  const byCategory = useMemo(() => {
    return categories.map((cat) => {
      const clientsInCat = clients.filter((c) => c.services.includes(cat))
      const revenue = clientsInCat.reduce((s, c) => {
        // Distribute monthly spend evenly across a client's services.
        return s + c.monthlySpend / Math.max(c.services.length, 1)
      }, 0)
      return {
        category: cat,
        clients: clientsInCat.length,
        revenue: Math.round(revenue),
      }
    })
  }, [clients])

  const maxCatRevenue = Math.max(...byCategory.map((c) => c.revenue))
  const pendingApprovals = approvals.filter((a) => a.status === 'Pending')
  const upcomingMeetings = [...meetings]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)

  return (
    <>
      <TeamPageHeader
        title="Command Center"
        description="Your agency at a glance — live operations across every client."
        action={
          <Button render={<Link href="/admin/clients" />} className="gap-2">
            View all clients
            <ArrowRight className="h-4 w-4" />
          </Button>
        }
      />

      {/* Operational metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Active clients"
          value={`${metrics.activeClients}`}
          delta={12}
          sub="across 9 markets"
        />
        <StatCard
          label="Monthly recurring"
          value={`$${(metrics.mrr / 1000).toFixed(1)}k`}
          delta={8}
          sub="MRR"
        />
        <StatCard
          label="Meetings this week"
          value={`${metrics.meetingsThisWeek}`}
          sub={`${metrics.shootsThisWeek} are shoots`}
        />
        <StatCard
          label="Urgent tasks"
          value={`${metrics.urgentTasks}`}
          sub="need attention today"
        />
      </div>

      {/* Pending work strip */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat
          icon={Video}
          label="Videos to approve"
          value={metrics.videosPending}
          tone="primary"
        />
        <MiniStat
          icon={FileImage}
          label="Posts to approve"
          value={metrics.postsPending}
          tone="primary"
        />
        <MiniStat
          icon={AlertTriangle}
          label="Delayed projects"
          value={metrics.delayedProjects}
          tone="destructive"
        />
        <MiniStat
          icon={Camera}
          label="Shoots this week"
          value={metrics.shootsThisWeek}
          tone="muted"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Map */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Client locations
              </h3>
              <p className="text-xs text-muted-foreground">
                Hover or tap a marker to inspect an account
              </p>
            </div>
            <Badge className="bg-secondary text-foreground">
              {clients.length} clients
            </Badge>
          </div>
          <ClientWorldMap />
        </Card>

        {/* Service category overview */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground">
            Revenue by service
          </h3>
          <p className="text-xs text-muted-foreground">
            Monthly recurring split across offerings
          </p>
          <div className="mt-5 space-y-4">
            {byCategory.map((c) => {
              const Icon = categoryIcon[c.category]
              return (
                <div key={c.category}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-foreground">
                      <Icon className="h-4 w-4 text-primary" />
                      {c.category}
                    </span>
                    <span className="font-medium text-foreground">
                      ${c.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${(c.revenue / maxCatRevenue) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs text-muted-foreground">
                      {c.clients} {c.clients === 1 ? 'client' : 'clients'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Approvals queue */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Awaiting client approval
            </h3>
            <Badge className="bg-primary/15 text-primary">
              {pendingApprovals.length} pending
            </Badge>
          </div>
          <div className="space-y-2">
            {pendingApprovals.slice(0, 6).map((a) => {
              const client = clients.find((c) => c.id === a.clientId)
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2.5"
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      a.type === 'Video'
                        ? 'bg-primary/15 text-primary'
                        : 'bg-accent text-accent-foreground',
                    )}
                  >
                    {a.type === 'Video' ? (
                      <Video className="h-4 w-4" />
                    ) : (
                      <FileImage className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {a.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {client?.company} · {a.platform}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* This week */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              This week
            </h3>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            {upcomingMeetings.map((m) => {
              const client = clients.find((c) => c.id === m.clientId)
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2.5"
                >
                  <div className="flex flex-col items-center rounded-lg bg-card px-2.5 py-1 text-center">
                    <span className="text-[10px] uppercase text-muted-foreground">
                      {new Date(`${m.date}T00:00:00`).toLocaleDateString(
                        'en-US',
                        { month: 'short' },
                      )}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {new Date(`${m.date}T00:00:00`).getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {m.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {client?.company} · {m.time}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      'shrink-0 text-[10px]',
                      m.kind === 'Meeting'
                        ? 'bg-secondary text-foreground'
                        : 'bg-primary/15 text-primary',
                    )}
                  >
                    {m.kind}
                  </Badge>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </>
  )
}

function MiniStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Globe
  label: string
  value: number
  tone: 'primary' | 'destructive' | 'muted'
}) {
  return (
    <Card className="flex flex-row items-center gap-3 p-4">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
          tone === 'primary' && 'bg-primary/15 text-primary',
          tone === 'destructive' && 'bg-destructive/15 text-destructive',
          tone === 'muted' && 'bg-secondary text-foreground',
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xl font-semibold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  )
}
