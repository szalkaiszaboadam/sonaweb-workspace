import { Music2, Camera, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Platform, ContentStatus } from '@/lib/portal-store'

const platformMeta: Record<
  Platform,
  { icon: typeof Music2; tint: string }
> = {
  TikTok: { icon: Music2, tint: 'bg-primary/15 text-primary' },
  Instagram: { icon: Camera, tint: 'bg-chart-4/20 text-chart-4' },
  Facebook: { icon: Users, tint: 'bg-chart-2/20 text-chart-2' },
}

export function PlatformIcon({
  platform,
  className,
}: {
  platform: Platform
  className?: string
}) {
  const { icon: Icon, tint } = platformMeta[platform]
  return (
    <span
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg',
        tint,
        className,
      )}
    >
      <Icon className="h-4 w-4" />
    </span>
  )
}

export const statusStyles: Record<ContentStatus, string> = {
  Draft: 'bg-muted text-muted-foreground',
  'Waiting For Approval': 'bg-chart-3/20 text-chart-3',
  Approved: 'bg-chart-2/20 text-chart-2',
  Scheduled: 'bg-chart-1/20 text-chart-1',
  Published: 'bg-primary/15 text-primary',
  Rejected: 'bg-destructive/20 text-destructive',
}

// Dot color for calendar entries
export const statusDot: Record<ContentStatus, string> = {
  Draft: 'bg-muted-foreground',
  'Waiting For Approval': 'bg-chart-3',
  Approved: 'bg-chart-2',
  Scheduled: 'bg-chart-1',
  Published: 'bg-primary',
  Rejected: 'bg-destructive',
}
