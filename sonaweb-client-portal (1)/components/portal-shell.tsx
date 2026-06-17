'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { TeamShell } from '@/components/team-shell'
import { MarketingShell } from '@/components/marketing/marketing-shell'
import { PortalProvider } from '@/lib/portal-store'
import { AgencyProvider } from '@/lib/agency-store'
import { AiAssistantWidget } from '@/components/ai-assistant-widget'

export function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <AgencyProvider>
      <PortalProvider>
        <ShellRouter>{children}</ShellRouter>
      </PortalProvider>
    </AgencyProvider>
  )
}

function ShellRouter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isTeam = pathname === '/admin' || pathname.startsWith('/admin/')
  const isClient = pathname === '/client' || pathname.startsWith('/client/')

  if (isTeam) {
    return <TeamShell>{children}</TeamShell>
  }

  if (isClient) {
    return <PortalLayout>{children}</PortalLayout>
  }

  // Everything else is the public marketing website.
  return <MarketingShell>{children}</MarketingShell>
}

function PortalLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-72">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
      <AiAssistantWidget />
    </div>
  )
}

export function PageHeader({
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
