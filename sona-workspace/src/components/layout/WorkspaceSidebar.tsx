'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Timer, Users, CheckSquare, FolderKanban, FileText, Settings, ChevronsUpDown, Check, HardDrive, PanelLeftClose, PanelLeft, Plus } from 'lucide-react'
import { UserMenu } from './UserMenu'
import { useTheme } from 'next-themes' // <-- ÚJ IMPORT A TÉMAVÁLTÁSHOZ

type Workspace = { id: string, name: string }

export function WorkspaceSidebar({
  currentWorkspaceId,
  currentWorkspaceName,
  workspaces,
  userRole,
  userEmail,
  userName,
  userAvatarUrl
}: {
  currentWorkspaceId: string
  currentWorkspaceName: string
  workspaces: Workspace[]
  userRole: string
  userEmail: string
  userName?: string
  userAvatarUrl?: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme } = useTheme() // <-- LEKÉRJÜK A JELENLEGI TÉMÁT
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

  // Szélesebb Sidebar: w-64 helyett w-72-t használunk!
  if (!isMounted) return <aside className="bg-surface border-r border-border h-full hidden md:flex flex-col w-72 relative z-20" />

  const isDark = resolvedTheme === 'dark'

  return (
    <aside className={`bg-surface border-r border-border h-full hidden md:flex flex-col transition-all duration-300 relative z-20 ${isCollapsed ? 'w-16' : 'w-72'}`}>
      
      {/* 0. LOGÓ ÉS SIDEBAR VEZÉRLŐ SZEKCIÓ */}
      <div className="h-14 flex items-center justify-between border-b border-border shrink-0 px-4">
        {!isCollapsed ? (
          <>
            <Link href={`/${currentWorkspaceId}/overview`} className="flex items-center hover:opacity-80 transition-opacity">
              {/* React szintű képcsere, így 100% bombabiztos a témaváltás! */}
              <img 
                src={isDark ? "/sonaweb-workspace-logo-white.png" : "/sonaweb-workspace-logo-black.png"} 
                alt="Sonaweb" 
                className="h-6 w-auto object-contain block" 
              />
            </Link>
            
            {/* Sidebar bezáró gomb a logó mellett */}
            <button 
              onClick={toggleSidebar}
              className="p-1.5 text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground rounded-md transition-colors focus:outline-none"
              title="Összecsukás"
            >
              <PanelLeftClose className="w-[18px] h-[18px]" />
            </button>
          </>
        ) : (
          /* TRÜKKÖS GOMB: Csupasz "S" betű, Hoverre Sidebar kinyitó ikon! */
          <button 
            onClick={toggleSidebar}
            className="group relative w-10 h-10 mx-auto flex items-center justify-center focus:outline-none"
            title="Kinyitás"
          >
            {/* Levettük a fekete hátteret, most már csak egy szép S betű */}
            <div className="absolute inset-0 flex items-center justify-center text-foreground font-bold text-[22px] transition-all duration-200 group-hover:opacity-0 group-hover:scale-75">
              S
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 text-primary rounded-xl opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
              <PanelLeft className="w-5 h-5" />
            </div>
          </button>
        )}
      </div>

      {/* 1. WORKSPACE VÁLTÓ ÉS ÚJ PROJEKT GOMB */}
      <div className="p-3 border-b border-border flex flex-col gap-2">
        <button 
          onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
          className={`flex items-center justify-between w-full p-2 rounded-lg hover:bg-sona-neutral/10 transition-colors focus:outline-none cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 text-sm">
              {currentWorkspaceName.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-sm truncate text-foreground">{currentWorkspaceName}</span>
            )}
          </div>
          {!isCollapsed && <ChevronsUpDown className="w-4 h-4 text-sona-neutral shrink-0" />}
        </button>

        {isSwitcherOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsSwitcherOpen(false)} />
            <div className={`absolute top-28 left-3 bg-surface border border-border shadow-2xl rounded-xl z-50 py-1.5 max-h-64 overflow-y-auto ${isCollapsed ? 'w-56' : 'right-3'}`}>
              <div className="px-3 py-2 text-[10px] font-bold text-sona-neutral uppercase tracking-wider">Munkaterületek</div>
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => { setIsSwitcherOpen(false); router.push(`/${ws.id}/overview`) }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-sona-neutral/10 transition-colors focus:outline-none text-foreground font-medium"
                >
                  <span className="truncate">{ws.name}</span>
                  {ws.id === currentWorkspaceId && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
              ))}
              <div className="border-t border-border mt-1 pt-1">
                <Link href="/workspaces" onClick={() => setIsSwitcherOpen(false)} className="block px-3 py-2 text-sm font-medium text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10 transition-colors focus:outline-none">
                  Összes nézete...
                </Link>
              </div>
            </div>
          </>
        )}

        {/* GYORSGOMB: Új projekt (A te kérésed szerinti piros dizájnnal) */}
        <Link 
          href={`/${currentWorkspaceId}/projects?newProject=true`} 
          className={`w-full flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-lg py-2 text-sm font-bold shadow-sm ${isCollapsed ? 'px-0' : 'px-3'}`}
          title="Új projekt"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="truncate">Új projekt</span>}
        </Link>
      </div>

      {/* 2. MENÜPONTOK */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-2 mb-3">
            <span className="text-[10px] font-bold text-sona-neutral uppercase tracking-wider">Navigáció</span>
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-semibold group focus:outline-none ${
                isActive ? 'bg-primary/10 text-primary' : 'text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'opacity-70 group-hover:opacity-100 transition-opacity'}`} strokeWidth={isActive ? 2.5 : 2} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          )
        })}
      </div>

      {/* 3. PROFIL (SIDEBAR ALJÁN) */}
      <div className="p-3 border-t border-border mt-auto">
        <UserMenu 
          email={userEmail}
          name={userName}
          avatarUrl={userAvatarUrl}
          variant="sidebar"
          isCollapsed={isCollapsed}
        />
      </div>

    </aside>
  )
}