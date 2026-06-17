'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navItems, navGroups } from '@/lib/nav'
import { routeAccess } from '@/lib/services'
import { usePortal } from '@/lib/portal-store'
import { SonawebLogo } from '@/components/sonaweb-logo'
import { client } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Nfc, Sparkles, X, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const pathname = usePathname()
  const { isRouteUnlocked } = usePortal()

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
          <Link href="/client" onClick={onClose}>
            <SonawebLogo />
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

        {/* NFC client card */}
        <div className="mx-4 mb-2 overflow-hidden rounded-xl border border-sidebar-border bg-gradient-to-br from-card to-background p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              NFC Client Card
            </span>
            <Nfc className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 font-mono text-xs text-foreground">
            {client.cardId}
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {client.name}
          </p>
          <p className="text-xs text-muted-foreground">{client.plan}</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {navGroups.map((group) => (
            <div key={group.id} className="mb-4">
              <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {navItems
                  .filter((item) => item.group === group.id)
                  .map((item) => {
                    const active =
                      item.href === '/client'
                        ? pathname === '/client'
                        : pathname.startsWith(item.href)
                    const locked = !isRouteUnlocked(item.href)
                    const lockedHref = `/client/services`
                    return (
                      <li key={item.href}>
                        <Link
                          href={locked ? lockedHref : item.href}
                          onClick={onClose}
                          aria-disabled={locked}
                          className={cn(
                            'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                            active
                              ? 'bg-sidebar-accent text-foreground'
                              : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
                            locked && 'opacity-55 hover:opacity-100',
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-1.5 w-1.5 rounded-full transition-colors',
                              active ? 'bg-primary' : 'bg-transparent',
                            )}
                          />
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span
                            className={cn(
                              'truncate',
                              locked && 'blur-[1.5px] group-hover:blur-0',
                            )}
                          >
                            {item.label}
                          </span>
                          {locked && (
                            <Lock className="ml-auto h-3.5 w-3.5 shrink-0 text-primary/80" />
                          )}
                        </Link>
                      </li>
                    )
                  })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <Link
            href="/client/assistant"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-primary/20"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            AI Marketing Assistant
          </Link>
        </div>
      </aside>
    </>
  )
}
