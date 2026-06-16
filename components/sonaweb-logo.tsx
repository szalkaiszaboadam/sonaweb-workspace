import { cn } from '@/lib/utils'

export function SonawebLogo({
  className,
  showText = true,
}: {
  className?: string
  showText?: boolean
}) {
  return (
    <div className={cn('flex items-center', className)}>
      <img
        src="/sonaweb-logo-white.png"
        alt="SONAWEB"
        className={cn('w-auto object-contain', showText ? 'h-4' : 'h-3')}
      />
    </div>
  )
}
