'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, FileText, HardDrive, Settings, Timer, Users, ChevronDown } from 'lucide-react'

export function ProjectNavbar({ workspaceId, projectId, isManager }: { workspaceId: string, projectId: string, isManager: boolean }) {
  const pathname = usePathname()
  const baseUrl = `/${workspaceId}/projects/${projectId}`
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null) // ÚJ: Referencia a menühöz

  const navItems = [
    { name: 'Áttekintés', href: baseUrl, exact: true, icon: LayoutDashboard },
    { name: 'Feladatok', href: `${baseUrl}/tasks`, exact: false, icon: CheckSquare },
    { name: 'Dokumentumok', href: `${baseUrl}/documents`, exact: false, icon: FileText },
    { name: 'Fájlok', href: `${baseUrl}/files`, exact: false, icon: HardDrive },
    { name: 'Időkövetés', href: `${baseUrl}/time`, exact: false, icon: Timer },
    { name: 'Csapat', href: `${baseUrl}/team`, exact: false, icon: Users },
    ...(isManager ? [{ name: 'Beállítások', href: `${baseUrl}/settings`, exact: false, icon: Settings }] : []),
  ]

  const activeItem = navItems.find(item => item.exact ? pathname === item.href : pathname.startsWith(item.href)) || navItems[0]
  const ActiveIcon = activeItem.icon

  // ÚJ: Kívülre kattintás (Outside Click) figyelése
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Ha a menü nyitva van, és a kattintás NEM a menün belül (menuRef) történt, akkor bezárjuk
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    // Takarítás, ha a komponens eltűnik a képernyőről
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  return (
    <div className="w-full mb-2 pb-2 border-b border-border relative">
      
      {/* ========================================== */}
      {/* KISEBB KÉPERNYŐK: Legördülő menü (< xl)    */}
      {/* ========================================== */}
      {/* Hozzáadtuk a ref={menuRef}-et a szülő elemhez */}
      <div className="xl:hidden relative" ref={menuRef}>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <div className="flex items-center gap-2.5">
            <ActiveIcon className="w-4 h-4 text-primary" strokeWidth={2.5} />
            {activeItem.name}
          </div>
          <ChevronDown className={`w-4 h-4 text-sona-neutral transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-lg z-50 py-1.5 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary/5 text-primary' : 'text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'opacity-70'}`} strokeWidth={isActive ? 2.5 : 2} />
                  {item.name}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* ASZTALI NÉZET: Egyenletesen elosztott Kapszula */}
      {/* ========================================== */}
      <nav className="hidden xl:flex items-center gap-1 w-full p-1 bg-surface/50 border border-border/50 rounded-xl shadow-sm">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all select-none whitespace-nowrap ${
                isActive
                  ? 'bg-background shadow-sm text-foreground border border-border/50'
                  : 'text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'opacity-70'}`} strokeWidth={isActive ? 2.5 : 2} />
              {item.name}
            </Link>
          )
        })}
      </nav>

    </div>
  )
}