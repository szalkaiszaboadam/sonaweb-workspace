'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAgency, CURRENT_CLIENT_ID, type ProjectStatus } from '@/lib/agency-store'
import { cn } from '@/lib/utils'
import { AlertCircle, Radio } from 'lucide-react'

const statusStyles: Record<ProjectStatus, string> = {
  Discovery: 'bg-secondary text-foreground',
  'In Progress': 'bg-primary/15 text-primary',
  'Awaiting Client': 'bg-accent text-accent-foreground',
  Review: 'bg-primary/15 text-primary',
  Live: 'bg-primary text-primary-foreground',
  Delayed: 'bg-destructive/15 text-destructive',
}

export function LiveProjectStatus() {
  const { projects } = useAgency()
  const mine = projects.filter((p) => p.clientId === CURRENT_CLIENT_ID)

  if (mine.length === 0) return null

  return (
    <Card className="mt-4 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            Your live projects
            <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-primary">
              <Radio className="h-3 w-3" />
              Live
            </span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Updated in real time by your SONAWEB team
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {mine.map((p) => (
          <div
            key={p.id}
            className="rounded-lg border border-border bg-secondary/30 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {p.service} · due {p.due}
                </p>
              </div>
              <Badge className={cn('shrink-0 text-[10px]', statusStyles[p.status])}>
                {p.status}
              </Badge>
            </div>

            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${p.progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{p.nextMilestone}</p>

            {p.missingMaterials.length > 0 && (
              <div className="mt-3 flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                <p className="text-xs text-foreground">
                  We need from you:{' '}
                  <span className="text-muted-foreground">
                    {p.missingMaterials.join(', ')}
                  </span>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
