'use client'

import { useMemo, useState } from 'react'
import { TeamPageHeader } from '@/components/team-shell'
import { StatCard } from '@/components/stat-card'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAgency, type AgencyClient } from '@/lib/agency-store'
import { cn } from '@/lib/utils'
import { Search, MapPin } from 'lucide-react'

type StatusFilter = 'All' | AgencyClient['status']
const statusFilters: StatusFilter[] = ['All', 'Active', 'At Risk', 'Onboarding']

const tierStyle: Record<AgencyClient['tier'], string> = {
  Starter: 'bg-secondary text-foreground',
  Pro: 'bg-accent text-accent-foreground',
  Elite: 'bg-primary/15 text-primary',
}

function healthTone(health: number) {
  if (health >= 80) return 'text-primary'
  if (health >= 60) return 'text-chart-4'
  if (health >= 40) return 'text-chart-4'
  return 'text-destructive'
}

export default function AdminClientsPage() {
  const { clients } = useAgency()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('All')

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const matchesStatus = status === 'All' || c.status === status
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        c.company.toLowerCase().includes(q) ||
        c.contact.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
      return matchesStatus && matchesQuery
    })
  }, [clients, query, status])

  const totalMrr = clients.reduce((s, c) => s + c.monthlySpend, 0)
  const avgHealth = Math.round(
    clients.reduce((s, c) => s + c.health, 0) / clients.length,
  )
  const atRisk = clients.filter((c) => c.status === 'At Risk').length

  return (
    <>
      <TeamPageHeader
        title="Clients"
        description="Every account SONAWEB manages, with health and spend at a glance."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total clients" value={`${clients.length}`} />
        <StatCard
          label="Total MRR"
          value={`$${totalMrr.toLocaleString()}`}
          delta={8}
          sub="vs last month"
        />
        <StatCard label="Avg. health" value={`${avgHealth}`} sub="all accounts" />
        <StatCard label="At risk" value={`${atRisk}`} sub="need attention" />
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients, contacts, cities..."
            className="h-10 pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                status === s
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => (
          <Card key={c.id} className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-foreground">
                  {c.company}
                </h3>
                <p className="text-xs text-muted-foreground">{c.contact}</p>
              </div>
              <Badge className={cn('shrink-0', tierStyle[c.tier])}>
                {c.tier}
              </Badge>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {c.city}, {c.country}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-secondary/40 px-2 py-2">
                <p className="text-[10px] uppercase text-muted-foreground">
                  Monthly
                </p>
                <p className="text-sm font-semibold text-foreground">
                  ${(c.monthlySpend / 1000).toFixed(1)}k
                </p>
              </div>
              <div className="rounded-lg bg-secondary/40 px-2 py-2">
                <p className="text-[10px] uppercase text-muted-foreground">
                  Lifetime
                </p>
                <p className="text-sm font-semibold text-foreground">
                  ${(c.lifetimeSpend / 1000).toFixed(0)}k
                </p>
              </div>
              <div className="rounded-lg bg-secondary/40 px-2 py-2">
                <p className="text-[10px] uppercase text-muted-foreground">
                  Health
                </p>
                <p className={cn('text-sm font-semibold', healthTone(c.health))}>
                  {c.health}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {c.services.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium',
                  c.status === 'Active' && 'bg-primary/15 text-primary',
                  c.status === 'At Risk' && 'bg-destructive/15 text-destructive',
                  c.status === 'Onboarding' && 'bg-accent text-accent-foreground',
                )}
              >
                {c.status}
              </span>
              <span className="text-xs text-muted-foreground">
                Manager: {c.manager}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="mt-4 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No clients match your filters.
          </p>
        </Card>
      )}
    </>
  )
}
