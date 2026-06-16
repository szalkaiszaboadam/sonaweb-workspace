'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { teamNavItems, teamNavGroups } from '@/lib/nav'
import { useAgency } from '@/lib/agency-store'
import { SonawebLogo } from '@/components/sonaweb-logo'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  X,
  Menu,
  Search,
  ShieldCheck,
  LogOut,
  Lock,
  Building2,
} from 'lucide-react'

export function TeamShell({ children }: { children: React.ReactNode }) {
  const { teamAuthed } = useAgency()
  const [open, setOpen] = useState(false)

  if (!teamAuthed) return <TeamLogin />

  return (
    <div className="min-h-screen bg-background">
      <TeamSidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-72">
        <TeamTopbar onMenu={() => setOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}

function TeamLogin() {
  const { login } = useAgency()
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!login(value)) {
      setError(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center gap-2">
          <SonawebLogo />
        </div>
        <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <h1 className="mt-5 text-xl font-semibold text-foreground">
          SONAWEB Team Access
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This is the internal agency operating system. Authorized SONAWEB staff
          only.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="password"
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                setError(false)
              }}
              placeholder="Team passcode"
              className="h-11 pl-9"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">
              Incorrect passcode. Try again.
            </p>
          )}
          <Button type="submit" className="h-11 w-full">
            Enter Command Center
          </Button>
        </form>

        <p className="mt-4 rounded-lg bg-secondary/50 px-3 py-2 text-center text-xs text-muted-foreground">
          Demo passcode: <span className="font-mono text-foreground">sonaweb</span>
        </p>
        <Link
          href="/"
          className="mt-4 block text-center text-xs text-muted-foreground hover:text-foreground"
        >
          Back to client portal
        </Link>
      </Card>
    </div>
  )
}

function TeamSidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const pathname = usePathname()
  const { logout, metrics } = useAgency()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/admin" onClick={onClose} className="flex items-center gap-2">
            <SonawebLogo showText={false} />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              SONAWEB
              <span className="ml-1 font-normal text-muted-foreground">Team</span>
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="mx-4 mb-2 overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/15 to-background p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
              Agency OS
            </span>
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-sm font-semibold text-foreground">
            {metrics.activeClients} active clients
          </p>
          <p className="text-xs text-muted-foreground">
            ${(metrics.mrr / 1000).toFixed(1)}k MRR · {metrics.urgentTasks} urgent
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {teamNavGroups.map((group) => (
            <div key={group.id} className="mb-4">
              <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {teamNavItems
                  .filter((item) => item.group === group.id)
                  .map((item) => {
                    const active =
                      item.href === '/admin'
                        ? pathname === '/admin'
                        : pathname.startsWith(item.href)
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                            active
                              ? 'bg-sidebar-accent text-foreground'
                              : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-1.5 w-1.5 rounded-full transition-colors',
                              active ? 'bg-primary' : 'bg-transparent',
                            )}
                          />
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </li>
                    )
                  })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}

function TeamTopbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenu}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative hidden max-w-sm flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search clients, projects, leads..."
          className="h-9 border-border bg-card pl-9 text-sm"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:flex">
          <ShieldCheck className="h-3.5 w-3.5" />
          Team workspace
        </span>
        <div className="flex items-center gap-2.5 rounded-full border border-border bg-card py-1 pl-3 pr-1">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium leading-none text-foreground">
              Elena Marsh
            </p>
            <p className="text-[11px] leading-none text-muted-foreground">
              Operations Lead
            </p>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            EM
          </div>
        </div>
      </div>
    </header>
  )
}

export function TeamPageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-pretty text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
