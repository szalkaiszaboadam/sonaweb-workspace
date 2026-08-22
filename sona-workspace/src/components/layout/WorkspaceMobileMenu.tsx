'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FolderKanban, CheckSquare, Timer, MoreHorizontal, FileText, HardDrive, Users, Settings, Plus, ChevronsUpDown, Check, Lock } from 'lucide-react'
import { UserMenu } from './UserMenu'

type Workspace = { id: string, name: string }

type Props = {
  workspaceId: string
  workspaceName: string
  workspaces: Workspace[]
  projects: { id: string, name: string }[]
  canCreateProject: boolean
  canManageSettings: boolean
  userProfile: { email: string, name?: string, avatarUrl?: string }
}

export function WorkspaceMobileMenu({
  workspaceId, workspaceName, workspaces, projects, canCreateProject, canManageSettings, userProfile
}: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)

  useEffect(() => { setIsOpen(false); setIsSwitcherOpen(false) }, [pathname])

  const projectIdMatch = pathname.match(/\/projects\/([^\/]+)/)
  const activeProjectId = projectIdMatch ? projectIdMatch[1] : null
  const activeProject = activeProjectId ? projects.find(p => p.id === activeProjectId) : null

  // Fő navigációs elemek (A Floating Dock-hoz)
  const bottomNavItems = [
    { name: 'Áttekintés', href: `/${workspaceId}/overview`, icon: LayoutDashboard },
    { name: 'Projektek', href: `/${workspaceId}/projects`, icon: FolderKanban },
    { name: 'Feladatok', href: `/${workspaceId}/tasks`, icon: CheckSquare },
    { name: 'Idő', href: `/${workspaceId}/time`, icon: Timer },
  ]

  // Másodlagos elemek (A Drawerbe kerülnek)
  const drawerItems = [
    { name: 'Dokumentumok', href: `/${workspaceId}/documents`, icon: FileText },
    { name: 'Fájlok', href: `/${workspaceId}/files`, icon: HardDrive },
    { name: 'Csapat', href: `/${workspaceId}/team`, icon: Users },
    { name: 'Beállítások', href: `/${workspaceId}/settings`, icon: Settings, locked: !canManageSettings },
  ]

  const isItemActive = (href: string) => {
      return pathname === href || (pathname.startsWith(href) && !href.endsWith('/projects'))
  }

  const isMoreActive = drawerItems.some(i => isItemActive(i.href)) || isOpen || (activeProject && pathname.includes(activeProject.id))

  return (
    <>
      {/* 🚀 APPLE DESIGN: LEBEGŐ ALSÓ KAPSZULA (Floating Island Dock) */}
      <div className="fixed bottom-4 left-4 right-4 z-40 flex justify-center pointer-events-none">
          <nav className="pointer-events-auto w-full max-w-md bg-surface/80 backdrop-blur-2xl border border-border/40 rounded-full shadow-2xl px-3 py-2 flex items-center justify-between transition-all">
              {bottomNavItems.map((item) => {
                  const isActive = isItemActive(item.href)
                  const Icon = item.icon
                  return (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        className={`flex flex-col items-center justify-center gap-1 flex-1 h-11 rounded-full transition-all active:scale-95 ${isActive ? 'text-primary' : 'text-sona-neutral hover:text-foreground'}`}
                      >
                          <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                          <span className="text-[10px] font-medium leading-none">{item.name}</span>
                      </Link>
                  )
              })}
              
              {/* "Több" gomb, ami megnyitja a Drawert */}
              <button 
                onClick={() => setIsOpen(true)}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-11 rounded-full transition-all active:scale-95 ${isMoreActive ? 'text-primary' : 'text-sona-neutral hover:text-foreground'}`}
              >
                  <MoreHorizontal className="w-5 h-5" strokeWidth={isMoreActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium leading-none">Több</span>
              </button>
          </nav>
      </div>

      {/* 🚀 APPLE DESIGN: Bottom Sheet Drawer (Lentről felcsúszó kártya) */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full h-[85vh] bg-surface/95 backdrop-blur-3xl border-t border-border/40 rounded-t-[32px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-full duration-300">
            
            {/* Drag Handle */}
            <div className="w-full flex justify-center pt-4 pb-2" onClick={() => setIsOpen(false)}>
                <div className="w-12 h-1.5 bg-sona-neutral/20 rounded-full" />
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-12 space-y-6">
                
                {/* 1. WORKSPACE SWITCHER */}
                <div className="flex flex-col gap-2 mt-2">
                    <button onClick={() => setIsSwitcherOpen(!isSwitcherOpen)} className="w-full flex items-center justify-between p-3 rounded-2xl bg-background border border-border/40 hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 text-lg shadow-sm border border-primary/20">
                                {workspaceName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-base truncate">{workspaceName}</span>
                        </div>
                        <ChevronsUpDown className="w-5 h-5 text-sona-neutral shrink-0" />
                    </button>
                    
                    {isSwitcherOpen && (
                        <div className="bg-background border border-border/40 rounded-2xl p-2 animate-in fade-in">
                            <div className="px-3 py-2 text-[10px] font-bold text-sona-neutral uppercase tracking-wider">Munkaterületek</div>
                            {workspaces.map(ws => (
                                <button key={ws.id} onClick={() => { setIsSwitcherOpen(false); router.push(`/${ws.id}/overview`) }} className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-left hover:bg-sona-neutral/10 rounded-lg transition-colors text-foreground font-medium">
                                    <span className="truncate">{ws.name}</span>
                                    {ws.id === workspaceId && <Check className="w-4 h-4 text-primary shrink-0" />}
                                </button>
                            ))}
                            <div className="border-t border-border/40 mt-1 pt-1">
                                <Link href="/workspaces" onClick={() => setIsSwitcherOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10 rounded-lg transition-colors">Összes nézete...</Link>
                            </div>
                        </div>
                    )}
                    
                    {canCreateProject && (
                        <Link href={`/${workspaceId}/projects?newProject=true`} onClick={() => setIsOpen(false)} className="w-full flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 rounded-2xl py-3.5 text-[15px] font-bold shadow-md">
                            <Plus className="w-5 h-5 shrink-0" /> Új projekt
                        </Link>
                    )}
                </div>

                {/* 2. AKTÍV PROJEKT */}
                {activeProject && (
                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-2 flex flex-col gap-1">
                        <div className="px-3 py-2 text-sm font-bold text-primary truncate">
                            {activeProject.name}
                        </div>
                        <Link href={`/${workspaceId}/projects/${activeProjectId}/tasks`} onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium ${pathname.includes('/tasks') ? 'bg-background shadow-sm text-foreground' : 'text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground'}`}>
                            <CheckSquare className="w-5 h-5" /> Feladatok
                        </Link>
                        <Link href={`/${workspaceId}/projects/${activeProjectId}/documents`} onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium ${pathname.includes('/documents') ? 'bg-background shadow-sm text-foreground' : 'text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground'}`}>
                            <FileText className="w-5 h-5" /> Dokumentumok
                        </Link>
                        <Link href={`/${workspaceId}/projects/${activeProjectId}/files`} onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium ${pathname.includes('/files') ? 'bg-background shadow-sm text-foreground' : 'text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground'}`}>
                            <HardDrive className="w-5 h-5" /> Fájlok
                        </Link>
                        <Link href={`/${workspaceId}/projects/${activeProjectId}/time`} onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium ${pathname.includes('/time') ? 'bg-background shadow-sm text-foreground' : 'text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground'}`}>
                            <Timer className="w-5 h-5" /> Időmérés
                        </Link>
                        <Link href={`/${workspaceId}/projects/${activeProjectId}/settings`} onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium ${pathname.includes('/settings') ? 'bg-background shadow-sm text-foreground' : 'text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground'}`}>
                            <Settings className="w-5 h-5" /> Beállítások
                        </Link>
                    </div>
                )}

                {/* 3. TÖBBI PLATFORM ELEM */}
                <div>
                    <div className="px-2 mb-2"><span className="text-[10px] font-bold text-sona-neutral uppercase tracking-wider">Egyéb</span></div>
                    <div className="flex flex-col gap-1">
                        {drawerItems.map((item) => {
                            const Icon = item.icon
                            const isActive = isItemActive(item.href)

                            if (item.locked) {
                                return (
                                <div key={item.name} className="flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium text-sona-neutral/40 cursor-not-allowed">
                                    <Lock className="w-5 h-5 shrink-0 opacity-40" />
                                    <span className="truncate">{item.name}</span>
                                </div>
                                )
                            }

                            return (
                                <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground'}`}>
                                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'opacity-70'}`} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className="truncate">{item.name}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {/* 4. PROFIL ÉS BEÁLLÍTÁSOK */}
                <div className="border-t border-border/40 pt-6">
                    <UserMenu 
                        email={userProfile.email} 
                        name={userProfile.name} 
                        avatarUrl={userProfile.avatarUrl} 
                        variant="sidebar" 
                        workspaceId={workspaceId}
                    />
                </div>
                
            </div>
          </div>
        </div>
      )}
    </>
  )
}