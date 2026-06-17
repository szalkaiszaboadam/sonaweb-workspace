import Link from 'next/link'
import { PageHeader } from '@/components/portal-shell'
import { StatCard } from '@/components/stat-card'
import {
  VisitorsChart,
  ChannelChart,
  AdsChart,
} from '@/components/dashboard-charts'
import { ClientHealthCard } from '@/components/client-health-card'
import { UpsellCards } from '@/components/upsell-cards'
import { LiveProjectStatus } from '@/components/live-project-status'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  dashboardStats,
  client,
  tasks,
  approvals,
  recentActivity,
  deadlines,
} from '@/lib/data'
import {
  CheckCircle2,
  Clock,
  Plus,
  Sparkles,
  ShoppingBag,
  Upload,
  ArrowRight,
} from 'lucide-react'

const quickActions = [
  { label: 'Browse services', href: '/client/services', icon: ShoppingBag },
  { label: 'Upload assets', href: '/client/website', icon: Upload },
  { label: 'Ask the AI', href: '/client/assistant', icon: Sparkles },
  { label: 'New request', href: '/client/messages', icon: Plus },
]

const priorityColor: Record<string, string> = {
  high: 'bg-primary text-primary-foreground',
  medium: 'bg-accent text-accent-foreground',
  low: 'bg-muted text-muted-foreground',
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title={`Welcome back, ${client.contact.split(' ')[0]}`}
        description="Your growth command center — everything SONAWEB is building for you, in one place."
        action={
          <Button render={<Link href="/client/services" />} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Browse services
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map(({ key, ...s }) => (
          <StatCard key={key} {...s} />
        ))}
      </div>

      {/* Live project status (synced from the SONAWEB team) */}
      <LiveProjectStatus />

      {/* Quick actions */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {quickActions.map((a) => (
          <Link key={a.label} href={a.href}>
            <Card className="flex flex-row items-center gap-3 p-4 transition-colors hover:border-primary/50">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <a.icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-foreground">
                {a.label}
              </span>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Website Visitors & Leads
              </h3>
              <p className="text-xs text-muted-foreground">Last 8 months</p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Visitors
            </Badge>
          </div>
          <div className="mt-4">
            <VisitorsChart />
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground">
            Traffic by Channel
          </h3>
          <p className="text-xs text-muted-foreground">Lead source split</p>
          <ChannelChart />
        </Card>
      </div>

      {/* Ads + content production */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground">
            Advertising ROAS
          </h3>
          <p className="text-xs text-muted-foreground">
            Return on ad spend by platform
          </p>
          <div className="mt-4">
            <AdsChart />
          </div>
        </Card>

        <Card className="flex flex-col p-5">
          <h3 className="text-sm font-semibold text-foreground">
            Content Production
          </h3>
          <p className="text-xs text-muted-foreground">August status</p>
          <div className="mt-4 space-y-4">
            {[
              { label: 'TikTok videos', done: 6, total: 8 },
              { label: 'Instagram posts', done: 9, total: 12 },
              { label: 'Facebook posts', done: 7, total: 12 },
            ].map((c) => (
              <div key={c.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{c.label}</span>
                  <span className="font-medium text-foreground">
                    {c.done}/{c.total}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(c.done / c.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tasks, approvals, activity */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Tasks */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Current Tasks
            </h3>
            <Badge variant="secondary">{tasks.length}</Badge>
          </div>
          <ul className="mt-4 space-y-3">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase ${priorityColor[t.priority]}`}
                >
                  {t.priority}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{t.title}</p>
                  <p className="text-xs text-muted-foreground">Due {t.due}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Approvals */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Pending Approvals
            </h3>
            <Button
              render={<Link href="/client/content" />}
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
            >
              View <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          <ul className="mt-4 space-y-3">
            {approvals.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-border bg-secondary/40 p-3"
              >
                <p className="text-sm font-medium text-foreground">{a.title}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{a.type}</span>
                  <Badge
                    variant={
                      a.status === 'Revision Requested' ? 'outline' : 'default'
                    }
                    className="text-[10px]"
                  >
                    {a.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Activity + deadlines */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground">
            Recent Activity
          </h3>
          <ul className="mt-4 space-y-3">
            {recentActivity.map((a) => (
              <li key={a.id} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-foreground">
                    <span className="font-medium">{a.actor}</span> {a.action}
                  </p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <h3 className="text-sm font-semibold text-foreground">
            Upcoming Deadlines
          </h3>
          <ul className="mt-3 space-y-2">
            {deadlines.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2 text-foreground">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {d.label}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {d.date}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Client health + membership */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ClientHealthCard />
        <Card className="flex flex-col justify-center gap-3 bg-gradient-to-br from-primary/10 to-card p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              VIP membership perks
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Pro, Elite and Black members enjoy priority support, faster
            turnaround, exclusive strategy calls and a dedicated account manager
            — a luxury membership, not a typical agency relationship.
          </p>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/client/settings" />}
            className="w-fit"
          >
            View your membership
          </Button>
        </Card>
      </div>

      {/* Smart upsell engine */}
      <UpsellCards className="mt-4" />
    </>
  )
}
