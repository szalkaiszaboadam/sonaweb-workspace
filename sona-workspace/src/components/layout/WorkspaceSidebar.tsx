'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Timer, Users, CheckSquare, FolderKanban, FileText, Settings, ChevronsUpDown, Check, HardDrive, PanelLeftClose, PanelLeft, Plus } from 'lucide-react'

type Workspace = { id: string, name: string }

export function WorkspaceSidebar({
  currentWorkspaceId, currentWorkspaceName, workspaces, userRole,
}: {
  currentWorkspaceId: string, currentWorkspaceName: string, workspaces: Workspace[], userRole: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sona-sidebar-collapsed')
      if (savedState === 'true') setIsCollapsed(true)
    }
  }, [])

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const newState = !prev
      if (typeof window !== 'undefined') localStorage.setItem('sona-sidebar-collapsed', String(newState))
      return newState
    })
  }

  const navItems = [
    { name: 'Áttekintés', href: `/${currentWorkspaceId}/overview`, icon: LayoutDashboard },
    { name: 'Projektek', href: `/${currentWorkspaceId}/projects`, icon: FolderKanban },
    { name: 'Feladatok', href: `/${currentWorkspaceId}/tasks`, icon: CheckSquare },
    { name: 'Dokumentumok', href: `/${currentWorkspaceId}/documents`, icon: FileText },
    { name: 'Fájlok', href: `/${currentWorkspaceId}/files`, icon: HardDrive },
    { name: 'Időkövetés', href: `/${currentWorkspaceId}/time`, icon: Timer },
    { name: 'Csapat', href: `/${currentWorkspaceId}/team`, icon: Users },
    ...(userRole === 'owner' ? [{ name: 'Beállítások', href: `/${currentWorkspaceId}/settings`, icon: Settings }] : []),
  ]

  if (!isMounted) return <aside className="bg-surface border-r border-border h-full hidden md:flex flex-col w-64 relative z-20" />

  return (
    <aside className={`bg-surface border-r border-border h-full hidden md:flex flex-col transition-all duration-300 relative z-20 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      
      {/* 1. FELSŐ SZEKCIÓ (Kinyitva vs. Becsukva) */}
      <div className="p-3 border-b border-border">
        {!isCollapsed ? (
          // --- KINYITOTT ÁLLAPOT ---
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <button onClick={() => setIsSwitcherOpen(!isSwitcherOpen)} className="flex-1 flex items-center justify-between p-2 rounded-lg hover:bg-sona-neutral/10 transition-colors focus:outline-none cursor-pointer">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 text-sm">
                    {currentWorkspaceName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-sm truncate text-foreground">{currentWorkspaceName}</span>
                </div>
                <ChevronsUpDown className="w-4 h-4 text-sona-neutral shrink-0" />
              </button>

              <button onClick={toggleSidebar} className="p-1.5 text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground rounded-lg transition-colors shrink-0" title="Összecsukás">
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </div>

            {/* Munkaterület lenyíló menü */}
            {isSwitcherOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsSwitcherOpen(false)} />
                <div className="absolute top-16 left-3 bg-surface border border-border shadow-2xl rounded-xl z-50 py-1.5 w-[calc(100%-24px)] max-h-64 overflow-y-auto">
                  <div className="px-3 py-2 text-[10px] font-bold text-sona-neutral uppercase tracking-wider">Munkaterületek</div>
                  {workspaces.map(ws => (
                    <button key={ws.id} onClick={() => { setIsSwitcherOpen(false); router.push(`/${ws.id}/overview`) }} className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-sona-neutral/10 transition-colors text-foreground font-medium">
                      <span className="truncate">{ws.name}</span>
                      {ws.id === currentWorkspaceId && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  ))}
                  <div className="border-t border-border mt-1 pt-1">
                    <Link href="/workspaces" onClick={() => setIsSwitcherOpen(false)} className="block px-3 py-2 text-sm font-medium text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10 transition-colors">Összes nézete...</Link>
                  </div>
                </div>
              </>
            )}

            <Link href={`/${currentWorkspaceId}/projects?newProject=true`} className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-lg py-2 text-sm font-bold shadow-sm px-3 mt-1">
              <Plus className="w-4 h-4 shrink-0" />
              <span className="truncate">Új projekt</span>
            </Link>
          </div>
        ) : (
          // --- BECSUKOTT ÁLLAPOT (Elegáns, App-szerű Dock) ---
          <div className="flex flex-col items-center gap-3 mt-1">
            
            {/* Varázsgomb: Alapból a Munkaterület betűje, hoverre kinyitó ikon! */}
            <button onClick={toggleSidebar} className="group relative w-10 h-10 flex items-center justify-center focus:outline-none" title="Kinyitás">
              <div className="absolute inset-0 flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold text-lg transition-all duration-200 group-hover:opacity-0 group-hover:scale-75">
                {currentWorkspaceName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute inset-0 flex items-center justify-center w-10 h-10 rounded-xl bg-sona-neutral/10 text-foreground opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 shadow-sm border border-border">
                <PanelLeft className="w-5 h-5" />
              </div>
            </button>

            {/* Kocka Új projekt gomb */}
            <Link href={`/${currentWorkspaceId}/projects?newProject=true`} className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-xl shadow-sm" title="Új projekt">
              <Plus className="w-5 h-5 shrink-0" />
            </Link>

          </div>
        )}
      </div>

      {/* 2. MENÜPONTOK */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {!isCollapsed && <div className="px-2 mb-3"><span className="text-[10px] font-bold text-sona-neutral uppercase tracking-wider">Navigáció</span></div>}
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.includes(item.href)
          return (
            <Link key={item.name} href={item.href} title={isCollapsed ? item.name : undefined} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-semibold group ${isActive ? 'bg-primary/10 text-primary' : 'text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10'} ${isCollapsed ? 'justify-center px-0' : ''}`}>
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'opacity-70 group-hover:opacity-100 transition-opacity'}`} strokeWidth={isActive ? 2.5 : 2} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}