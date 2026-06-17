'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePortal, type Notification } from '@/lib/portal-store'
import { cn } from '@/lib/utils'
import {
  Bell,
  CheckCheck,
  ClipboardCheck,
  Globe,
  FileText,
  Receipt,
  CalendarCheck,
  Sparkles,
  PackageCheck,
} from 'lucide-react'

const iconFor: Record<Notification['type'], typeof Bell> = {
  approval: ClipboardCheck,
  website: Globe,
  report: FileText,
  invoice: Receipt,
  meeting: CalendarCheck,
  service: Sparkles,
  order: PackageCheck,
}

export function NotificationCenter() {
  const { notifications, unreadCount, markAllRead } = usePortal()

  return (
    <DropdownMenu onOpenChange={(open) => open && markAllRead()}>
      <DropdownMenuTrigger
        aria-label="Notifications"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </p>
          ) : (
            notifications.map((n) => {
              const Icon = iconFor[n.type]
              return (
                <div
                  key={n.id}
                  className={cn(
                    'flex gap-3 border-b border-border/60 px-4 py-3 last:border-0',
                    !n.read && 'bg-secondary/40',
                  )}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{n.body}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                      {n.time}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
