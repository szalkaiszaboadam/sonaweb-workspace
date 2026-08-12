'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LayoutDashboard, FolderKanban, CheckSquare, FileText, HardDrive, Timer, Users, Settings, Plus, ChevronsUpDown, Check, Lock } from 'lucide-react'

type Workspace = { id: string, name: string }

export function WorkspaceMobileMenu({
  workspaceId, workspaceName, workspaces, canCreateProject, canManageSettings
}: {
  workspaceId: string, workspaceName: string, workspaces: Workspace[], canCreateProject: boolean, canManageSettings: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)

  useEffect(() => { setIsOpen(false); setIsSwitcherOpen(false) }, [pathname])

  const navItems = [
    { name: 'Áttekintés', href: `/${workspaceId}/overview`, icon: LayoutDashboard },
    { name: 'Projektek', href: `/${workspaceId}/projects`, icon: FolderKanban },
    { name: 'Feladatok', href: `/${workspaceId}/tasks`, icon: CheckSquare },
    { name: 'Dokumentumok', href: `/${workspaceId}/documents`, icon: FileText },
    { name: 'Fájlok', href: `/${workspaceId}/files`, icon: HardDrive },
    { name: 'Időkövetés', href: `/${workspaceId}/time`, icon: Timer },
    { name: 'Csapat', href: `/${workspaceId}/team`, icon: Users },
    ...(canManageSettings ? [{ name: 'Beállítások', href: `/${workspaceId}/settings`, icon: Settings }] : []),
  ]

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="md:hidden p-1.5 -ml-1.5 text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10 rounded-md transition-colors">
        <Menu className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative w-72 max-w-[85%] bg-surface h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            
            <div className="h-14 flex items-center justify-between border-b border-border px-4">
              <span className="font-bold text-foreground">Menü</span>
              <button onClick={() => setIsOpen(false)} className="p-1.5 -mr-1.5 text-sona-neutral hover:bg-sona-neutral/10 rounded-md"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-3 border-b border-border flex flex-col gap-2 relative z-50">
              <button onClick={() => setIsSwitcherOpen(!isSwitcherOpen)} className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-sona-neutral/10">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 text-sm">
                    {workspaceName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-sm truncate">{workspaceName}</span>
                </div>
                <ChevronsUpDown className="w-4 h-4 text-sona-neutral shrink-0" />
              </button>
              
              {/* LAKATOS MOBIL GOMB */}
              {canCreateProject ? (
                <Link href={`/${workspaceId}/projects?newProject=true`} onClick={() => setIsOpen(false)} className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg py-2 text-sm font-bold shadow-sm px-3 mt-1">
                  <Plus className="w-4 h-4 shrink-0" /> <span className="truncate">Új projekt</span>
                </Link>
              ) : (
                <div className="w-full flex items-center justify-center gap-2 bg-surface border border-border text-sona-neutral/50 rounded-lg py-2 text-sm font-bold px-3 mt-1 cursor-not-allowed">
                  <Lock className="w-4 h-4 shrink-0" /> <span className="truncate">Új projekt</span>
                </div>
              )}
            </div>

            <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              <div className="px-2 mb-3"><span className="text-[10px] font-bold text-sona-neutral uppercase tracking-wider">Navigáció</span></div>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname.includes(item.href)
                return (
                  <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${isActive ? 'bg-primary/10 text-primary' : 'text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10'}`}>
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'opacity-70'}`} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}