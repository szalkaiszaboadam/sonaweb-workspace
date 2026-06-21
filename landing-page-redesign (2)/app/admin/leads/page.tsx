'use client'

import { TeamPageHeader } from '@/components/team-shell'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePortal } from '@/lib/portal-store'
import { type Lead, type LeadStatus } from '@/lib/portal-store'
import { cn } from '@/lib/utils'
import { CheckCircle2, Flag, Clock, TrendingUp } from 'lucide-react'

const columns: LeadStatus[] = ['New', 'Approved', 'Flagged', 'Follow-up']

const columnMeta: Record<LeadStatus, { tone: string; icon: typeof Clock }> = {
  New: { tone: 'text-primary', icon: Clock },
  Approved: { tone: 'text-chart-2', icon: CheckCircle2 },
  Flagged: { tone: 'text-destructive', icon: Flag },
  'Follow-up': { tone: 'text-chart-4', icon: TrendingUp },
}

const tierStyle: Record<Lead['tier'], string> = {
  high: 'bg-primary/15 text-primary',
  medium: 'bg-accent text-accent-foreground',
  low: 'bg-destructive/15 text-destructive',
}

export default function AdminLeadsPage() {
  const { leads, setLeadStatus } = usePortal()

  const pipelineValue = leads
    .filter((l) => l.status !== 'Flagged')
    .reduce((s, l) => s + l.revenuePotential, 0)
  const avgScore = leads.length
    ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length)
    : 0

  return (
    <>
      <TeamPageHeader
        title="Leads Pipeline"
        description="Qualified leads scored by the SONAWEB engine, ready to route and close."
      />

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryStat label="Total leads" value={`${leads.length}`} />
        <SummaryStat
          label="Pipeline value"
          value={`$${(pipelineValue / 1000).toFixed(0)}k`}
        />
        <SummaryStat label="Avg. score" value={`${avgScore}`} />
        <SummaryStat
          label="New this week"
          value={`${leads.filter((l) => l.status === 'New').length}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => {
          const items = leads.filter((l) => l.status === col)
          const Meta = columnMeta[col]
          return (
            <div key={col} className="flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Meta.icon className={cn('h-4 w-4', Meta.tone)} />
                  {col}
                </span>
                <Badge className="bg-secondary text-foreground">
                  {items.length}
                </Badge>
              </div>

              <div className="flex-1 space-y-3 rounded-xl bg-secondary/30 p-3">
                {items.length === 0 && (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    No leads
                  </p>
                )}
                {items.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onMove={(s) => setLeadStatus(lead.id, s)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="gap-0 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </Card>
  )
}

function LeadCard({
  lead,
  onMove,
}: {
  lead: Lead
  onMove: (status: LeadStatus) => void
}) {
  const otherStatuses = columns.filter((c) => c !== lead.status)
  return (
    <Card className="gap-0 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {lead.company}
          </p>
          <p className="truncate text-xs text-muted-foreground">{lead.name}</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10">
          <span className="text-sm font-bold leading-none text-primary">
            {lead.score}
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge className={cn('text-[10px] capitalize', tierStyle[lead.tier])}>
          {lead.tier} fit
        </Badge>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
          {lead.serviceName}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5 text-xs">
        <span className="text-muted-foreground">Potential</span>
        <span className="font-semibold text-foreground">
          ${lead.revenuePotential.toLocaleString()}/yr
        </span>
      </div>

      <div className="mt-3">
        <p className="mb-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          Move to
        </p>
        <div className="flex flex-wrap gap-1.5">
          {otherStatuses.map((s) => (
            <Button
              key={s}
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={() => onMove(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  )
}
