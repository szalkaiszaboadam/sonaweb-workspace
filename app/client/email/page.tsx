import { PageHeader } from '@/components/portal-shell'
import { StatCard } from '@/components/stat-card'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LockedGate } from '@/components/locked-gate'
import { Mail, Zap } from 'lucide-react'

const newsletters = [
  { name: 'August Product Drop', open: '48.2%', click: '9.1%', sent: 'Aug 5' },
  { name: 'Summer Sale Reminder', open: '41.7%', click: '7.4%', sent: 'Jul 22' },
  { name: 'Founder Letter #4', open: '52.6%', click: '11.3%', sent: 'Jul 10' },
]

const automations = [
  { name: 'Welcome series', active: true, subscribers: 1240 },
  { name: 'Abandoned cart', active: true, subscribers: 340 },
  { name: 'Win-back flow', active: false, subscribers: 210 },
  { name: 'Post-purchase', active: true, subscribers: 890 },
]

export default function EmailPage() {
  return (
    <LockedGate route="/client/email">
      <PageHeader
        title="Email Marketing"
        description="Campaign performance, automations and subscriber growth."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Campaigns Sent" value="12" sub="this month" />
        <StatCard label="Open Rate" value="47.5%" delta={3.2} sub="avg" />
        <StatCard label="Click Rate" value="9.3%" delta={1.1} sub="avg" />
        <StatCard label="Unsubscribe" value="0.4%" delta={-0.2} sub="rate" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground">
            Best Performing Newsletters
          </h3>
          <ul className="mt-4 space-y-3">
            {newsletters.map((n) => (
              <li
                key={n.name}
                className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <Mail className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{n.name}</p>
                  <p className="text-xs text-muted-foreground">Sent {n.sent}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {n.open}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {n.click} clicks
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground">
            Subscriber Growth
          </h3>
          <div className="mt-3">
            <p className="text-3xl font-semibold text-foreground">8,940</p>
            <p className="text-xs text-primary">+612 this month</p>
          </div>
          <h4 className="mt-5 text-sm font-semibold text-foreground">
            Automations
          </h4>
          <ul className="mt-3 space-y-2.5">
            {automations.map((a) => (
              <li key={a.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-foreground">
                  <Zap
                    className={`h-3.5 w-3.5 ${a.active ? 'text-primary' : 'text-muted-foreground'}`}
                  />
                  {a.name}
                </span>
                <Badge
                  variant={a.active ? 'default' : 'outline'}
                  className="text-[10px]"
                >
                  {a.active ? 'Active' : 'Paused'}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </LockedGate>
  )
}
