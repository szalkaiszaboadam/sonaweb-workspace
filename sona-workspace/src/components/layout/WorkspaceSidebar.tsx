'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Timer, Users, CheckSquare, FolderKanban, FileText, Settings, ChevronsUpDown, Check, HardDrive, PanelLeftClose, PanelLeft } from 'lucide-react'


type Workspace = { id: string, name: string }

export function WorkspaceSidebar({
  currentWorkspaceId,
  currentWorkspaceName,
  workspaces
}: {
  currentWorkspaceId: string
  currentWorkspaceName: string
  workspaces: Workspace[]
}) {
  const pathname = usePathname()
  const router = useRouter()

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)
  
  // -- ÁLLAPOTOK A MEMÓRIÁHOZ --
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // 1. Betöltéskor azonnal kiolvassuk a mentett állapotot
  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sona-sidebar-collapsed')
      if (savedState === 'true') {
        setIsCollapsed(true)
      }
    }
  }, [])

  // 2. Mentő függvény, amit a gomb megnyomásakor hívunk
  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const newState = !prev
      if (typeof window !== 'undefined') {
        localStorage.setItem('sona-sidebar-collapsed', String(newState))
      }
      return newState
    })
  }

const navItems = [
    { name: 'Áttekintés', href: `/${currentWorkspaceId}/overview`, icon: LayoutDashboard },
    { name: 'Projektek', href: `/${currentWorkspaceId}/projects`, icon: FolderKanban },
    { name: 'Feladatok', href: `/${currentWorkspaceId}/tasks`, icon: CheckSquare },
    { name: 'Dokumentumok', href: `/${currentWorkspaceId}/documents`, icon: FileText },
    { name: 'Fájlok', href: `/${currentWorkspaceId}/files`, icon: HardDrive },
    { name: 'Időkövetés', href: `/${currentWorkspaceId}/time`, icon: Timer }, // <-- ITT JAVÍTVA!
    { name: 'Csapat', href: `/${currentWorkspaceId}/team`, icon: Users },
    { name: 'Beállítások', href: `/${currentWorkspaceId}/settings`, icon: Settings },
  ]

  // Amíg a React nem töltött be a háttérben, egy üres sávot mutatunk, hogy ne "ugorjon" a képernyő
  if (!isMounted) {
    return <aside className="bg-surface border-r border-border h-full hidden md:flex flex-col w-64 relative z-20" />
  }

  return (
    <aside className={`bg-surface border-r border-border h-full hidden md:flex flex-col transition-all duration-300 relative z-20 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      
      {/* WORKSPACE VÁLTÓ SZEKCIÓ */}
      <div className="p-3 border-b border-border relative">
        <button
          // JAVÍTÁS 1: Levettük az "!isCollapsed" tiltást, így mindig nyitható!
          onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
          // JAVÍTÁS 2: Mindig cursor-pointer, hogy jelezze, kattintható összecsukva is
          className={`flex items-center justify-between w-full p-2 rounded-md hover:bg-sona-neutral/10 transition-colors focus:outline-none cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0 text-sm">
              {currentWorkspaceName.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <span className="font-medium text-sm truncate text-foreground">{currentWorkspaceName}</span>
            )}
          </div>
          {!isCollapsed && <ChevronsUpDown className="w-4 h-4 text-sona-neutral shrink-0" />}
        </button>

        {/* JAVÍTÁS 3: Itt is levettük a tiltást, és a legördülő menü okos méretezést kapott */}
        {isSwitcherOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsSwitcherOpen(false)} />
            {/* Ha össze van csukva, egy fix w-56 (224px) méretű Flyout menüt csinálunk, ha nyitva van, kitölti a sávot (right-3) */}
            <div className={`absolute top-full left-3 mt-1 bg-surface border border-border shadow-xl rounded-md z-50 py-1 max-h-64 overflow-y-auto ${isCollapsed ? 'w-56' : 'right-3'}`}>
              <div className="px-3 py-2 text-xs font-semibold text-sona-neutral uppercase">Munkaterületeid</div>
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setIsSwitcherOpen(false)
                    router.push(`/${ws.id}/overview`)
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-sona-neutral/10 transition-colors focus:outline-none"
                >
                  <span className="truncate">{ws.name}</span>
                  {ws.id === currentWorkspaceId && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
              ))}
              <div className="border-t border-border mt-1 pt-1">
                <Link
                  href="/workspaces"
                  onClick={() => setIsSwitcherOpen(false)}
                  className="block px-3 py-2 text-sm text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10 transition-colors focus:outline-none"
                >
                  Összes nézete...
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* MENÜPONTOK ÉS AZ ÚJ PROFI ÖSSZECSUKÓ GOMB */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        
        <div className={`flex items-center ${isCollapsed ? 'justify-center mb-4' : 'justify-between mb-3 px-2'}`}>
          {!isCollapsed && (
            <span className="text-[10px] font-bold text-sona-neutral uppercase tracking-wider">
              Menü
            </span>
          )}
          
          <button
            onClick={toggleSidebar}
            className="p-1.5 text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground rounded-md transition-colors focus:outline-none"
            title={isCollapsed ? "Kinyitás" : "Összecsukás"}
          >
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.includes(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium group focus:outline-none ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'opacity-70 group-hover:opacity-100 transition-opacity'}`} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          )
        })}
      </div>

    </aside>
  )
}