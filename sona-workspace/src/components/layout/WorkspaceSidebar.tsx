'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, CheckSquare, FolderKanban, FileText, Settings, ChevronLeft, ChevronRight, ChevronsUpDown, Check } from 'lucide-react'

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
  
  // Állapotok az összecsukáshoz és a menühöz
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)

  const navItems = [
    // ITT JAVÍTVA: dashboard -> overview
    { name: 'Áttekintés', href: `/${currentWorkspaceId}/overview`, icon: LayoutDashboard },
    { name: 'Projektek', href: `/${currentWorkspaceId}/projects`, icon: FolderKanban },
    { name: 'Feladatok', href: `/${currentWorkspaceId}/tasks`, icon: CheckSquare },
    { name: 'Dokumentumok', href: `/${currentWorkspaceId}/docs`, icon: FileText },
    { name: 'Csapat', href: `/${currentWorkspaceId}/team`, icon: Users },
    { name: 'Beállítások', href: `/${currentWorkspaceId}/settings`, icon: Settings },
  ]

  return (
    <aside className={`bg-surface border-r border-border h-full hidden md:flex flex-col transition-all duration-300 relative z-20 ${isCollapsed ? 'w-16' : 'w-56'}`}>
      
      {/* WORKSPACE VÁLTÓ SZEKCIÓ */}
      <div className="p-3 border-b border-border relative">
        <button 
          onClick={() => !isCollapsed && setIsSwitcherOpen(!isSwitcherOpen)}
          className={`flex items-center justify-between w-full p-2 rounded-md hover:bg-sona-neutral/10 transition-colors ${isCollapsed ? 'justify-center cursor-default' : 'cursor-pointer'}`}
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

        {isSwitcherOpen && !isCollapsed && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsSwitcherOpen(false)} />
            <div className="absolute top-full left-3 right-3 mt-1 bg-surface border border-border shadow-lg rounded-md z-50 py-1 max-h-64 overflow-y-auto">
              <div className="px-3 py-2 text-xs font-semibold text-sona-neutral uppercase">Munkaterületeid</div>
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setIsSwitcherOpen(false)
                    // ITT IS JAVÍTVA: dashboard -> overview
                    router.push(`/${ws.id}/overview`)
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-sona-neutral/10 transition-colors"
                >
                  <span className="truncate">{ws.name}</span>
                  {ws.id === currentWorkspaceId && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
              ))}
              <div className="border-t border-border mt-1 pt-1">
                <Link 
                  href="/workspaces" 
                  onClick={() => setIsSwitcherOpen(false)}
                  className="block px-3 py-2 text-sm text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10 transition-colors"
                >
                  Összes nézete...
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* MENÜPONTOK */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="text-xs font-semibold text-sona-neutral uppercase tracking-wider mb-3 px-2">
            Menü
          </div>
        )}
        
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.includes(item.href)

          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'opacity-70'}`} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          )
        })}
      </div>

      {/* ÖSSZECSUKÓ GOMB */}
      <div className="p-3 border-t border-border mt-auto">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center w-full p-2 text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10 rounded-md transition-colors"
          title={isCollapsed ? "Kinyitás" : "Összecsukás"}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  )
}