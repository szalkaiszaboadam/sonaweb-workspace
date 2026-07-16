'use client'

import { useState } from 'react'
import { User, LogOut } from 'lucide-react'
import { logout } from '@/app/(auth)/actions'

// Hozzáadjuk a name prop-ot
export function UserMenu({ email, name }: { email: string; name?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Ha valakinek nincs neve (pl. te, mert korábban regisztráltál), akkor az e-mailből csinálunk nevet
  const displayName = name || email.split('@')[0]

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors font-medium text-sm"
      >
        {displayName.charAt(0).toUpperCase()}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-lg z-50 py-1 overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              {/* NÉV NAGYBAN, E-MAIL KICSIBEN */}
              <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
              <p className="text-xs text-sona-neutral truncate mt-0.5">{email}</p>
            </div>
            
            <form action={logout} className="w-full">
              <button 
                type="submit" 
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Kijelentkezés
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}