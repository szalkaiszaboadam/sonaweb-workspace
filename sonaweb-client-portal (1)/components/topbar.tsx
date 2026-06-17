'use client'

import { Menu, Search, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { client } from '@/lib/data'
import { usePortal } from '@/lib/portal-store'
import { NotificationCenter } from '@/components/notification-center'

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { setAssistantOpen } = usePortal()

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
          placeholder="Search projects, files, invoices..."
          className="h-9 border-border bg-card pl-9 text-sm"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          onClick={() => setAssistantOpen(true)}
          size="sm"
          className="hidden gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 sm:inline-flex"
        >
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </Button>
        <NotificationCenter />
        <div className="flex items-center gap-2.5 rounded-full border border-border bg-card py-1 pl-1 pr-3">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              {client.initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-medium leading-none text-foreground">
              {client.contact}
            </p>
            <p className="text-[11px] leading-none text-muted-foreground">
              {client.name}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
