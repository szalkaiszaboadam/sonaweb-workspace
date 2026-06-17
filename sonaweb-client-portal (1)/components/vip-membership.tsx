'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePortal } from '@/lib/portal-store'
import { memberTiers, getMemberTier } from '@/lib/qualification'
import { cn } from '@/lib/utils'
import { Crown, Check, Lock } from 'lucide-react'

export function VipMembership() {
  const { memberTier, monthlySpend } = usePortal()
  const current = getMemberTier(memberTier)
  const currentIndex = memberTiers.findIndex((t) => t.id === memberTier)
  const nextTier = memberTiers[currentIndex + 1]
  const toNext = nextTier ? nextTier.minSpend - monthlySpend : 0

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Crown className={cn('h-4 w-4', current.accent)} />
          <h3 className="text-sm font-semibold text-foreground">
            Membership & Loyalty
          </h3>
        </div>
        <Badge className="bg-primary/15 text-primary">
          {current.label} member
        </Badge>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Your SONAWEB membership unlocks a luxury, members-only experience that
        scales with your investment.
        {nextTier && toNext > 0 && (
          <>
            {' '}
            Spend{' '}
            <span className="font-medium text-foreground">
              ${toNext.toLocaleString()}/mo
            </span>{' '}
            more to reach <span className="font-medium text-foreground">{nextTier.label}</span>.
          </>
        )}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {memberTiers.map((tier, i) => {
          const active = tier.id === memberTier
          const unlocked = i <= currentIndex
          return (
            <div
              key={tier.id}
              className={cn(
                'rounded-xl border p-4 transition-colors',
                active
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card',
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'text-sm font-semibold',
                    unlocked ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {tier.label}
                </span>
                {active ? (
                  <Badge className="bg-primary text-primary-foreground text-[10px]">
                    Current
                  </Badge>
                ) : unlocked ? (
                  <Check className="h-3.5 w-3.5 text-chart-2" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {tier.minSpend === 0
                  ? 'Included'
                  : `From $${tier.minSpend.toLocaleString()}/mo`}
              </p>
              <ul className="mt-3 space-y-1.5">
                {tier.benefits.map((b) => (
                  <li
                    key={b}
                    className={cn(
                      'flex items-start gap-1.5 text-[11px]',
                      unlocked ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    <Check
                      className={cn(
                        'mt-0.5 h-3 w-3 shrink-0',
                        unlocked ? 'text-primary' : 'text-muted-foreground/50',
                      )}
                    />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
