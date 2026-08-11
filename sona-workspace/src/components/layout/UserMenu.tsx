'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, Settings, Sun, Moon, Monitor } from 'lucide-react'
import { logout } from '@/app/(auth)/actions'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { useTheme } from 'next-themes'

type UserMenuProps = {
  email: string
  name?: string
  avatarUrl?: string
  variant?: 'header' | 'sidebar'
  isCollapsed?: boolean
}

export function UserMenu({ email, name, avatarUrl, variant = 'header', isCollapsed = false }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const displayName = name || email.split('@')[0]
  
  // Téma horgok
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Félrekattintás figyelő
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      {/* 1. GOMB VARIÁCIÓK */}
      {variant === 'header' ? (
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="focus:outline-none hover:opacity-80 transition-opacity"
        >
          <Avatar name={displayName} url={avatarUrl} className="w-9 h-9 text-sm border-none shadow-sm" />
        </button>
      ) : (
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${isOpen ? 'bg-sona-neutral/10' : 'hover:bg-sona-neutral/5'}`}
        >
          <Avatar name={displayName} url={avatarUrl} className="w-8 h-8 text-xs shrink-0 shadow-sm" />
          {!isCollapsed && (
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-sm font-bold text-foreground truncate w-full text-left">{displayName}</span>
              <span className="text-xs text-sona-neutral truncate w-full text-left">{email}</span>
            </div>
          )}
        </button>
      )}

      {/* 2. LEGÖRDÜLŐ MENÜ */}
      {isOpen && (
        <div 
          className={`absolute ${variant === 'sidebar' ? 'bottom-full left-0 mb-2' : 'top-full right-0 mt-2'} w-64 bg-surface border border-border rounded-xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="px-4 py-3 border-b border-border bg-sona-neutral/5">
            <p className="text-sm font-bold text-foreground truncate">{displayName}</p>
            <p className="text-xs text-sona-neutral truncate mt-0.5">{email}</p>
          </div>
          
          {/* Beállítások menüpont */}
          <div className="p-1.5 flex flex-col gap-1 border-b border-border">
            <Link onClick={() => setIsOpen(false)} href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-sona-neutral/10 transition-colors rounded-lg">
              <Settings className="w-4 h-4 text-sona-neutral" />
              Beállítások
            </Link>
          </div>
          
          {/* ÚJ TÉMA VÁLASZTÓ */}
          {mounted && (
            <div className="px-3 py-2 border-b border-border flex flex-col gap-2">
              <span className="text-[10px] font-bold text-sona-neutral uppercase tracking-wider pl-1">Megjelenés</span>
              <div className="flex items-center gap-1 bg-sona-neutral/10 p-1 rounded-lg">
                <button onClick={() => setTheme('light')} className={`flex-1 flex justify-center py-1.5 rounded-md transition-colors ${theme === 'light' ? 'bg-surface text-foreground shadow-sm' : 'text-sona-neutral hover:text-foreground'}`} title="Világos">
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setTheme('system')} className={`flex-1 flex justify-center py-1.5 rounded-md transition-colors ${theme === 'system' ? 'bg-surface text-foreground shadow-sm' : 'text-sona-neutral hover:text-foreground'}`} title="Rendszer">
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setTheme('dark')} className={`flex-1 flex justify-center py-1.5 rounded-md transition-colors ${theme === 'dark' ? 'bg-surface text-foreground shadow-sm' : 'text-sona-neutral hover:text-foreground'}`} title="Sötét">
                  <Moon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Kijelentkezés */}
          <div className="p-1.5">
            <form action={logout} className="w-full">
              <button 
                type="submit" 
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Kijelentkezés
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}