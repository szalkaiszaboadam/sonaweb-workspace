'use client'

import { useState } from 'react'
import { TeamPageHeader } from '@/components/team-shell'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  useAgency,
  type AgencyProject,
  type ProjectStatus,
  CURRENT_CLIENT_ID,
} from '@/lib/agency-store'
import { cn } from '@/lib/utils'
import { AlertCircle, Minus, Plus, Radio } from 'lucide-react'

const statuses: ProjectStatus[] = [
  'Discovery',
  'In Progress',
  'Awaiting Client',
  'Review',
  'Live',
  'Delayed',
]

const statusStyles: Record<ProjectStatus, string> = {
  Discovery: 'bg-secondary text-foreground',
  'In Progress': 'bg-primary/15 text-primary',
  'Awaiting Client': 'bg-accent text-accent-foreground',
  Review: 'bg-primary/15 text-primary',
  Live: 'bg-primary text-primary-foreground',
  Delayed: 'bg-destructive/15 text-destructive',
}

export default function AdminProjectsPage() {
  const { projects, clients, setProjectStatus, setProjectProgress } = useAgency()
  const [filter, setFilter] = useState<'All' | ProjectStatus>('All')

  const visible =
    filter === 'All' ? projects : projects.filter((p) => p.status === filter)

  const clientName = (id: string) =>
    clients.find((c) => c.id === id)?.company ?? 'Unknown'

  return (
    <>
      <TeamPageHeader
        title="Projects"
        description="Update status and progress — changes sync instantly to each client's dashboard."
        action={
          <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
            <Radio className="h-3.5 w-3.5" />
            Live sync on
          </span>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {(['All', ...statuses] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              filter === s
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {visible.map((p) => (
          <ProjectRow
            key={p.id}
            project={p}
            clientName={clientName(p.clientId)}
            isClientFacing={p.clientId === CURRENT_CLIENT_ID}
            statusStyles={statusStyles}
            onStatus={(s) => setProjectStatus(p.id, s)}
            onProgress={(v) => setProjectProgress(p.id, v)}
          />
        ))}
      </div>
    </>
  )
}

function ProjectRow({
  project: p,
  clientName,
  isClientFacing,
  statusStyles,
  onStatus,
  onProgress,
}: {
  project: AgencyProject
  clientName: string
  isClientFacing: boolean
  statusStyles: Record<ProjectStatus, string>
  onStatus: (s: ProjectStatus) => void
  onProgress: (v: number) => void
}) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">{p.name}</h3>
            <Badge className={cn('text-[10px]', statusStyles[p.status])}>
              {p.status}
            </Badge>
            {isClientFacing && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                <Radio className="h-3 w-3" />
                Live on client portal
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {clientName} · {p.service} · due {p.due}
          </p>
          <p className="mt-2 text-sm text-foreground">{p.nextMilestone}</p>

          {p.missingMaterials.length > 0 && (
            <div className="mt-3 flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
              <p className="text-xs text-foreground">
                Waiting on client:{' '}
                <span className="text-muted-foreground">
                  {p.missingMaterials.join(', ')}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="w-full shrink-0 lg:w-80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Progress
            </span>
            <span className="text-sm font-semibold text-foreground">
              {p.progress}%
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => onProgress(p.progress - 10)}
              aria-label="Decrease progress"
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${p.progress}%` }}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => onProgress(p.progress + 10)}
              aria-label="Increase progress"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStatus(s)}
                className={cn(
                  'rounded-md border px-2 py-1 text-[11px] font-medium transition-colors',
                  p.status === s
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
