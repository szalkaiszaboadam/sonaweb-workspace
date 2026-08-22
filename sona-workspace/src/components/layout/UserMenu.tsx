'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, User, ChevronsUpDown } from 'lucide-react'
import { logout } from '@/app/(auth)/actions'
import { Avatar } from '@/components/ui/Avatar'
import { ProfileSettingsModal } from './ProfileSettingsModal'

type UserMenuProps = {
  email: string
  name?: string
  avatarUrl?: string
  variant?: 'header' | 'sidebar'
  isCollapsed?: boolean
  workspaceId?: string 
}

export function UserMenu({ email, name, avatarUrl, variant = 'header', isCollapsed = false, workspaceId }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  const displayName = name || email.split('@')[0]

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
    <>
      <div className="relative w-full" ref={menuRef}>
        
        {variant === 'header' ? (
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none transition-transform active:scale-95"
          >
            <Avatar name={displayName} url={avatarUrl} className="w-10 h-10 text-sm border-none shadow-sm" />
          </button>
        ) : (
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full flex items-center justify-between gap-3 p-2 rounded-xl transition-all ${isOpen ? 'bg-sona-neutral/10' : 'hover:bg-sona-neutral/5'}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={displayName} url={avatarUrl} className="w-9 h-9 text-xs shrink-0 shadow-sm" />
              {!isCollapsed && (
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-[14px] font-semibold text-foreground truncate w-full text-left">{displayName}</span>
                  <span className="text-[12px] text-sona-neutral truncate w-full text-left">{email}</span>
                </div>
              )}
            </div>
            
            {!isCollapsed && (
               <ChevronsUpDown className="w-4 h-4 text-sona-neutral shrink-0" />
            )}
          </button>
        )}

        {isOpen && (
          <div 
            className={`absolute ${variant === 'sidebar' ? 'bottom-full left-0 mb-3' : 'top-full right-0 mt-3'} w-[240px] bg-surface/85 backdrop-blur-2xl border border-border/40 shadow-2xl rounded-2xl z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200`}
          >
            <div className="px-4 py-2 border-b border-border/40 mb-1">
              <p className="text-[14px] font-bold text-foreground truncate">{displayName}</p>
              <p className="text-[12px] text-sona-neutral truncate">{email}</p>
            </div>
            
            <div className="px-2 py-1 flex flex-col gap-0.5 border-b border-border/40 mb-1">
              <button onClick={() => { setIsOpen(false); setIsProfileModalOpen(true); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground hover:bg-sona-neutral/10 transition-colors rounded-lg">
                <User className="w-4 h-4 text-sona-neutral" /> Profil beállítások
              </button>
            </div>

            <div className="px-2 pt-1">
              <form action={logout} className="w-full">
                <button 
                  type="submit" 
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Kijelentkezés
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        email={email}
        name={name}
        avatarUrl={avatarUrl}
      />
    </>
  )
}