'use client'

import { useState } from 'react'
import { TeamPageHeader } from '@/components/team-shell'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  productionTasks as seedTasks,
  productionStages,
  type ProductionTask,
} from '@/lib/team-data'
import { cn } from '@/lib/utils'
import {
  Globe,
  Music2,
  ImageIcon,
  Megaphone,
  Mail,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'

const typeIcon: Record<ProductionTask['type'], typeof Globe> = {
  Website: Globe,
  TikTok: Music2,
  Content: ImageIcon,
  Advertising: Megaphone,
  Email: Mail,
}

const stageStyle: Record<ProductionTask['stage'], string> = {
  Backlog: 'text-muted-foreground',
  'In Progress': 'text-primary',
  Review: 'text-chart-4',
  Done: 'text-chart-2',
}

export default function AdminContentPage() {
  const [tasks, setTasks] = useState<ProductionTask[]>(seedTasks)

  function move(id: string, dir: -1 | 1) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const idx = productionStages.indexOf(t.stage)
        const next = productionStages[idx + dir]
        return next ? { ...t, stage: next } : t
      }),
    )
  }

  return (
    <>
      <TeamPageHeader
        title="Content Production"
        description="Track every deliverable from backlog to delivered across all clients."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {productionStages.map((stage) => {
          const items = tasks.filter((t) => t.stage === stage)
          return (
            <div key={stage} className="flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={cn(
                    'text-sm font-semibold',
                    stageStyle[stage],
                  )}
                >
                  {stage}
                </span>
                <Badge className="bg-secondary text-foreground">
                  {items.length}
                </Badge>
              </div>

              <div className="flex-1 space-y-3 rounded-xl bg-secondary/30 p-3">
                {items.length === 0 && (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    Nothing here
                  </p>
                )}
                {items.map((t) => {
                  const Icon = typeIcon[t.type]
                  const idx = productionStages.indexOf(t.stage)
                  return (
                    <Card key={t.id} className="gap-0 p-4">
                      <div className="flex items-start gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {t.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {t.client}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t.assignee}</span>
                        <span>Due {t.due}</span>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[11px] disabled:opacity-30"
                          disabled={idx === 0}
                          onClick={() => move(t.id, -1)}
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                          Back
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-[11px] disabled:opacity-30"
                          disabled={idx === productionStages.length - 1}
                          onClick={() => move(t.id, 1)}
                        >
                          Advance
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
