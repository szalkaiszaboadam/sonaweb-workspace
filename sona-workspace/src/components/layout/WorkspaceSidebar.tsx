'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Timer, Users, CheckSquare, FolderKanban, FileText, Settings, ChevronsUpDown, Check, HardDrive, Plus, Lock, LifeBuoy, Send } from 'lucide-react'
import { UserMenu } from '@/components/layout/UserMenu'

type Workspace = { id: string, name: string }

type Props = {
  currentWorkspaceId: string
  currentWorkspaceName: string
  workspaces: Workspace[]
  projects: { id: string, name: string }[]
  canCreateProject: boolean
  canManageSettings: boolean
  userProfile: { email: string, name?: string, avatarUrl?: string }
  isCollapsed: boolean 
}

export function WorkspaceSidebar({
  currentWorkspaceId, currentWorkspaceName, workspaces, projects, canCreateProject, canManageSettings, userProfile, isCollapsed
}: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  const projectIdMatch = pathname.match(/\/projects\/([^\/]+)/)
  const activeProjectId = projectIdMatch ? projectIdMatch[1] : null
  const activeProject = activeProjectId ? projects.find(p => p.id === activeProjectId) : null

  const navItems = [
    { name: 'Áttekintés', href: `/${currentWorkspaceId}/overview`, icon: LayoutDashboard },
    { name: 'Projektek', href: `/${currentWorkspaceId}/projects`, icon: FolderKanban },
    { name: 'Feladatok', href: `/${currentWorkspaceId}/tasks`, icon: CheckSquare },
    { name: 'Dokumentumok', href: `/${currentWorkspaceId}/documents`, icon: FileText },
    { name: 'Fájlok', href: `/${currentWorkspaceId}/files`, icon: HardDrive },
    { name: 'Időmérés', href: `/${currentWorkspaceId}/time`, icon: Timer },
    { name: 'Csapat', href: `/${currentWorkspaceId}/team`, icon: Users },
    { name: 'Beállítások', href: `/${currentWorkspaceId}/settings`, icon: Settings, locked: !canManageSettings },
  ]

  if (!isMounted) return <aside className="h-full hidden md:flex flex-col w-64 relative z-20" />

  return (
    <aside className={`h-full hidden md:flex flex-col transition-all duration-300 relative z-20 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      
      {/* 1. MUNKATERÜLET VÁLTÓ */}
      <div className="p-4">
        {!isCollapsed ? (
          <div className="flex flex-col gap-3">
            <button onClick={() => setIsSwitcherOpen(!isSwitcherOpen)} className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-sona-neutral/10 transition-colors focus:outline-none cursor-pointer">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 text-[15px] shadow-sm">
                    {currentWorkspaceName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-[15px] truncate text-foreground">{currentWorkspaceName}</span>
                </div>
                <ChevronsUpDown className="w-4 h-4 text-sona-neutral shrink-0" />
            </button>
            
            {isSwitcherOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsSwitcherOpen(false)} />
                <div className="absolute top-16 left-4 bg-surface border border-border/50 shadow-xl rounded-xl z-50 py-1.5 w-[calc(100%-32px)] max-h-64 overflow-y-auto">
                  <div className="px-3 py-2 text-[10px] font-bold text-sona-neutral uppercase tracking-wider">Munkaterületek</div>
                  {workspaces.map(ws => (
                    <button key={ws.id} onClick={() => { setIsSwitcherOpen(false); router.push(`/${ws.id}/overview`) }} className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-sona-neutral/10 transition-colors text-foreground font-medium">
                      <span className="truncate">{ws.name}</span>
                      {ws.id === currentWorkspaceId && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  ))}
                  <div className="border-t border-border/50 mt-1 pt-1">
                    <Link href="/workspaces" onClick={() => setIsSwitcherOpen(false)} className="block px-3 py-2 text-sm font-medium text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10 transition-colors">Összes nézete...</Link>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center mt-1">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-[15px] shadow-sm">
              {currentWorkspaceName.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* 2. NAVIGÁCIÓ */}
      <div className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
        {!isCollapsed && (
            canCreateProject ? (
              <Link href={`/${currentWorkspaceId}/projects?newProject=true`} className="w-full flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 transition-colors rounded-xl py-2 text-[13px] font-semibold shadow-sm mb-4">
                <Plus className="w-4 h-4 shrink-0" /> Új projekt
              </Link>
            ) : (
              <div className="w-full flex items-center justify-center gap-2 bg-sona-neutral/10 text-sona-neutral/50 rounded-xl py-2 text-[13px] font-semibold mb-4 cursor-not-allowed">
                <Lock className="w-4 h-4 shrink-0" /> Új projekt
              </div>
            )
        )}

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && !item.href.endsWith('/projects')) 

          if (item.locked) {
             return (
               <div key={item.name} title="Nincs jogosultságod" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-sona-neutral/40 cursor-not-allowed group ${isCollapsed ? 'justify-center px-0' : ''}`}>
                 <Lock className="w-5 h-5 shrink-0 opacity-40" strokeWidth={2} />
                 {!isCollapsed && <span className="truncate">{item.name}</span>}
               </div>
             )
          }

          return (
            <div key={item.name} className="flex flex-col gap-1">
              <Link href={item.href} title={isCollapsed ? item.name : undefined} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-[14px] font-medium group ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10'} ${isCollapsed ? 'justify-center px-0' : ''}`}>
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'opacity-70 group-hover:opacity-100'}`} strokeWidth={isActive ? 2.5 : 2} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>

              {/* AKTÍV PROJEKT MENÜJE */}
              {item.name === 'Projektek' && activeProject && !isCollapsed && (
                  <div className="ml-5 pl-3 border-l border-border/50 flex flex-col gap-1 my-1">
                      <div className="px-3 py-1.5 mb-1 text-[12px] font-bold text-primary truncate bg-primary/5 rounded-lg">
                          {activeProject.name}
                      </div>
                      <Link href={`/${currentWorkspaceId}/projects/${activeProjectId}/tasks`} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium ${pathname.includes('/tasks') ? 'bg-surface shadow-sm text-foreground border border-border/50' : 'text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground'}`}><CheckSquare className="w-4 h-4 shrink-0" /> Feladatok</Link>
                      <Link href={`/${currentWorkspaceId}/projects/${activeProjectId}/documents`} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium ${pathname.includes('/documents') ? 'bg-surface shadow-sm text-foreground border border-border/50' : 'text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground'}`}><FileText className="w-4 h-4 shrink-0" /> Dokumentumok</Link>
                      <Link href={`/${currentWorkspaceId}/projects/${activeProjectId}/files`} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium ${pathname.includes('/files') ? 'bg-surface shadow-sm text-foreground border border-border/50' : 'text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground'}`}><HardDrive className="w-4 h-4 shrink-0" /> Fájlok</Link>
                      <Link href={`/${currentWorkspaceId}/projects/${activeProjectId}/time`} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium ${pathname.includes('/time') ? 'bg-surface shadow-sm text-foreground border border-border/50' : 'text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground'}`}><Timer className="w-4 h-4 shrink-0" /> Időmérés</Link>
                      <Link href={`/${currentWorkspaceId}/projects/${activeProjectId}/settings`} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium ${pathname.includes('/settings') ? 'bg-surface shadow-sm text-foreground border border-border/50' : 'text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground'}`}><Settings className="w-4 h-4 shrink-0" /> Beállítások</Link>
                  </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 3. LÁBLÉC */}
      <div className="p-3 mt-auto mb-2 mx-1">
         <UserMenu 
            email={userProfile.email} 
            name={userProfile.name} 
            avatarUrl={userProfile.avatarUrl} 
            variant="sidebar" 
            isCollapsed={isCollapsed}
            workspaceId={currentWorkspaceId}
         />
      </div>
    </aside>
  )
}