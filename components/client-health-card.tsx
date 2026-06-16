'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { usePortal } from '@/lib/portal-store'
import {
  clientHealthScore,
  healthLabel,
  type HealthInputs,
} from '@/lib/qualification'
import { cn } from '@/lib/utils'
import { HeartPulse } from 'lucide-react'

export function ClientHealthCard() {
  const { ownedServices, monthlySpend, meetings } = usePortal()

  const { score, label, tone, factors } = useMemo(() => {
    const meetingsAttended = meetings.length
    const inputs: HealthInputs = {
      activeServices: ownedServices.length,
      monthlySpend,
      engagement: 82,
      projectCompletion: 64,
      meetingsAttended,
    }
    const s = clientHealthScore(inputs)
    const { label, tone } = healthLabel(s)
    const factors = [
      { label: 'Active services', value: ownedServices.length, max: 6 },
      { label: 'Engagement', value: 82, max: 100, suffix: '%' },
      { label: 'Project completion', value: 64, max: 100, suffix: '%' },
      { label: 'Meetings attended', value: meetingsAttended, max: 4 },
    ]
    return { score: s, label, tone, factors }
  }, [ownedServices, monthlySpend, meetings])

  const circumference = 2 * Math.PI * 26

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <HeartPulse className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Client Success Score
        </h3>
      </div>

      <div className="mt-4 flex items-center gap-5">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="var(--secondary)"
              strokeWidth="6"
            />
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (score / 100) * circumference}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-semibold text-foreground">
              {score}
            </span>
            <span className="text-[10px] text-muted-foreground">/ 100</span>
          </div>
        </div>

        <div className="flex-1">
          <p className={cn('text-sm font-semibold', tone)}>{label}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Your account is performing well. Keep engaging to unlock the next
            membership tier.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2 border-t border-border pt-4">
        {factors.map((f) => (
          <div key={f.label} className="flex items-center gap-3">
            <span className="w-32 shrink-0 text-xs text-muted-foreground">
              {f.label}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary/70"
                style={{ width: `${Math.min((f.value / f.max) * 100, 100)}%` }}
              />
            </div>
            <span className="w-10 text-right text-xs font-medium text-foreground">
              {f.value}
              {f.suffix ?? ''}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
