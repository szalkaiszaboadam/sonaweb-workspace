'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, FileText, HardDrive, Settings, Timer, ChevronDown, Check } from 'lucide-react'

export function ProjectNavbar({ workspaceId, projectId }: { workspaceId: string, projectId: string }) {
  const pathname = usePathname()
  const baseUrl = `/${workspaceId}/projects/${projectId}`
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { name: 'Áttekintés', href: baseUrl, exact: true, icon: LayoutDashboard },
    { name: 'Feladatok', href: `${baseUrl}/tasks`, exact: false, icon: CheckSquare },
    { name: 'Dokumentumok', href: `${baseUrl}/documents`, exact: false, icon: FileText },
    { name: 'Fájlok', href: `${baseUrl}/files`, exact: false, icon: HardDrive },
    { name: 'Időkövetés', href: `${baseUrl}/time`, exact: false, icon: Timer },
    { name: 'Beállítások', href: `${baseUrl}/settings`, exact: false, icon: Settings },
  ]

  const activeItem = navItems.find(item => item.exact ? pathname === item.href : pathname.includes(item.href)) || navItems[0]

  return (
    <div className="border-b border-border bg-surface sticky top-0 z-10">
      
      {/* ========================================================= */}
      {/* 1. ASZTALI NÉZET (Csak laptopon és monitoron: lg:flex) */}
      {/* ========================================================= */}
      <nav className="hidden lg:flex flex-row items-center gap-6 px-6 h-14 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.includes(item.href)
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative h-full flex items-center text-sm font-medium transition-colors whitespace-nowrap hover:text-foreground ${
                isActive ? 'text-primary' : 'text-sona-neutral'
              }`}
            >
              <div className="flex items-center gap-2">
                <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'opacity-60'}`} />
                {item.name}
              </div>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* ========================================================= */}
      {/* 2. TABLET ÉS MOBIL NÉZET (lg:hidden) */}
      {/* ========================================================= */}
      <div className="lg:hidden relative px-4 py-3 bg-surface">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-background border border-border rounded-xl shadow-sm text-sm font-semibold text-foreground focus:outline-none active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-2.5">
            <activeItem.icon className="w-4 h-4 text-primary" />
            {activeItem.name}
          </div>
          <ChevronDown className={`w-4 h-4 text-sona-neutral transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {isMobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]" 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
            
            <div className="absolute top-full left-4 right-4 mt-2 bg-surface border border-border shadow-2xl rounded-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col">
                {navItems.map(item => {
                  const isActive = activeItem.name === item.name
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3.5 text-sm transition-colors border-b border-border/50 last:border-0 ${
                        isActive ? 'bg-primary/5 text-primary font-bold' : 'text-foreground hover:bg-sona-neutral/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-sona-neutral'}`} />
                        {item.name}
                      </div>
                      {isActive && <Check className="w-4 h-4 text-primary" />}
                    </Link>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  )
}