'use client'

import Link from 'next/link'
import { ReactNode, useEffect, useState } from 'react'
import { UserMenu } from '@/components/layout/UserMenu'
import { useTheme } from 'next-themes'

type Props = {
  userEmail: string
  userName?: string
  userAvatar?: string
  leftContent?: ReactNode
  centerContent?: ReactNode
  rightContent?: ReactNode
}

export function TopNavbar({ userEmail, userName, userAvatar, leftContent, centerContent, rightContent }: Props) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Megvárjuk a kliens oldali betöltést, hogy elkerüljük a Hydration hibát
  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'

  return (
    <header className="h-14 md:h-16 border-b border-border bg-surface flex items-center justify-between px-4 md:px-6 shrink-0 w-full z-50">
      
      <div className="flex items-center gap-3 md:gap-6 shrink-0">
        {leftContent}
        <Link href="/workspaces" className="flex items-center shrink-0">
          {/* Bombabiztos React állapot-alapú logó csere (Nagyobb, h-6 méretben) */}
          {mounted ? (
            <img 
              src={isDark ? "/sonaweb-workspace-logo-white.png" : "/sonaweb-workspace-logo-black.png"} 
              alt="Sonaweb" 
              className="h-6 w-auto object-contain block" 
            />
          ) : (
            // Placeholder amíg a téma be nem tölt, hogy ne ugorjon az oldal
            <div className="h-6 w-32" /> 
          )}
        </Link>
      </div>

      {centerContent && (
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          {centerContent}
        </div>
      )}

      {/* Gombok (értesítés, súgó, stb.) és a profil menü */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {rightContent}
        <UserMenu 
          email={userEmail} 
          name={userName} 
          avatarUrl={userAvatar} 
          variant="header" 
        />
      </div>
    </header>
  )
}