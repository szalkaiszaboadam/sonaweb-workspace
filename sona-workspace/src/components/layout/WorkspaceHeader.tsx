'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Bell, HelpCircle, Bug, Menu, X, LayoutDashboard, FolderKanban, CheckSquare, FileText, HardDrive, Timer, Users, Settings, Plus, ChevronsUpDown, Check } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { UserMenu } from './UserMenu'
import { useTheme } from 'next-themes'

type Workspace = { id: string, name: string }

export function WorkspaceHeader({
  workspaceId,
  workspaceName,
  workspaces,
  userRole,
  userEmail,
  userName,
  userAvatarUrl
}: {
  workspaceId: string
  workspaceName: string
  workspaces: Workspace[]
  userRole: string
  userEmail: string
  userName?: string
  userAvatarUrl?: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  
  // A mobilos menü állapota
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)
  
  const isDark = resolvedTheme === 'dark'

  // Ha a felhasználó egy linkre kattint mobilon, automatikusan becsukjuk a menüt
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsSwitcherOpen(false)
  }, [pathname])

  const navItems = [
    { name: 'Áttekintés', href: `/${workspaceId}/overview`, icon: LayoutDashboard },
    { name: 'Projektek', href: `/${workspaceId}/projects`, icon: FolderKanban },
    { name: 'Feladatok', href: `/${workspaceId}/tasks`, icon: CheckSquare },
    { name: 'Dokumentumok', href: `/${workspaceId}/documents`, icon: FileText },
    { name: 'Fájlok', href: `/${workspaceId}/files`, icon: HardDrive },
    { name: 'Időkövetés', href: `/${workspaceId}/time`, icon: Timer },
    { name: 'Csapat', href: `/${workspaceId}/team`, icon: Users },
    ...(userRole === 'owner' ? [{ name: 'Beállítások', href: `/${workspaceId}/settings`, icon: Settings }] : []),
  ]

  return (
    <>
      <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-4 lg:px-8 shrink-0 z-20 shadow-sm">
        
        {/* ========================================= */}
        {/* MOBIL: Hamburger Ikon és Logó             */}
        {/* ========================================= */}
        <div className="flex md:hidden items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 -ml-1.5 text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10 rounded-md transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          {/* React szintű képcsere a mobil fejlécben */}
          <img 
            src={isDark ? "/sonaweb-workspace-logo-white.png" : "/sonaweb-workspace-logo-black.png"} 
            alt="Sonaweb" 
            className="h-5 w-auto object-contain" 
          />
        </div>

        {/* ========================================= */}
        {/* ASZTALI: Cmd+K Keresősáv                  */}
        {/* ========================================= */}
        <div className="hidden md:flex flex-1 max-w-xl items-center">
          <div className="relative w-full group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sona-neutral group-hover:text-primary transition-colors" />
            <input 
              disabled 
              type="text" 
              placeholder="Keresés feladatokra, doksikra... (Hamarosan)" 
              className="w-full bg-background border border-border rounded-lg pl-9 pr-14 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-sona-neutral cursor-not-allowed transition-all" 
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-sans font-bold text-sona-neutral bg-surface border border-border rounded shadow-sm">⌘</kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] font-sans font-bold text-sona-neutral bg-surface border border-border rounded shadow-sm">K</kbd>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* MINDEN NÉZET: Jobb oldali Ikonok          */}
        {/* ========================================= */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-auto">
          
          <button disabled className="hidden sm:block p-2 text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground rounded-lg transition-colors cursor-not-allowed opacity-50 relative" title="Értesítések (Hamarosan)">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-surface" />
          </button>

          {/* Mobilon a hosszú keresősáv helyett egy kis nagyító ikont mutatunk */}
          <button disabled className="sm:hidden p-2 text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground rounded-lg transition-colors cursor-not-allowed opacity-50" title="Keresés (Hamarosan)">
            <Search className="w-5 h-5" />
          </button>

          <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

          <button disabled className="hidden sm:block p-2 text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground rounded-lg transition-colors cursor-not-allowed opacity-50" title="Súgó (Hamarosan)">
            <HelpCircle className="w-5 h-5" />
          </button>

          <button disabled className="hidden sm:block p-2 text-sona-neutral hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors cursor-not-allowed opacity-50" title="Hibabejelentés (Hamarosan)">
            <Bug className="w-5 h-5" />
          </button>

          <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

          <ThemeToggle />
        </div>
      </header>

      {/* ======================================================= */}
      {/* MOBIL OLDALSÁV (DRAWER) - Csak mobilon jelenik meg!     */}
      {/* ======================================================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex md:hidden">
          
          {/* Sötétítő háttér (Kattintásra bezáródik) */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          
          {/* Becsúszó Fiók (Drawer) */}
          <div className="relative w-72 max-w-[85%] bg-surface h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            
            {/* Drawer Fejléc */}
            <div className="h-14 flex items-center justify-between border-b border-border shrink-0 px-4">
              <img 
                src={isDark ? "/sonaweb-workspace-logo-white.png" : "/sonaweb-workspace-logo-black.png"} 
                alt="Sonaweb" 
                className="h-5 w-auto object-contain" 
              />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 -mr-1.5 text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10 rounded-md transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Munkaterület váltó & Új projekt (Mobil) */}
            <div className="p-3 border-b border-border flex flex-col gap-2 relative z-50">
              <button 
                onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-sona-neutral/10 transition-colors focus:outline-none"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 text-sm">
                    {workspaceName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-sm truncate text-foreground">{workspaceName}</span>
                </div>
                <ChevronsUpDown className="w-4 h-4 text-sona-neutral shrink-0" />
              </button>

              {isSwitcherOpen && (
                <div className="absolute top-14 left-3 bg-surface border border-border shadow-2xl rounded-xl z-50 py-1.5 w-[calc(100%-24px)] max-h-48 overflow-y-auto animate-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 text-[10px] font-bold text-sona-neutral uppercase tracking-wider">Munkaterületek</div>
                  {workspaces.map(ws => (
                    <button
                      key={ws.id}
                      onClick={() => { setIsSwitcherOpen(false); router.push(`/${ws.id}/overview`) }}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-sona-neutral/10 transition-colors text-foreground font-medium"
                    >
                      <span className="truncate">{ws.name}</span>
                      {ws.id === workspaceId && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              )}

              <Link 
                href={`/${workspaceId}/projects?newProject=true`} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-lg py-2 text-sm font-bold shadow-sm px-3"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="truncate">Új projekt</span>
              </Link>
            </div>

            {/* Navigációs menü (Mobil) */}
            <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              <div className="px-2 mb-3">
                <span className="text-[10px] font-bold text-sona-neutral uppercase tracking-wider">Navigáció</span>
              </div>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname.includes(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-semibold ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-sona-neutral hover:text-foreground hover:bg-sona-neutral/10'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'opacity-70'}`} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Profil a Drawer alján (Mobil) */}
            <div className="p-3 border-t border-border mt-auto">
              <UserMenu 
                email={userEmail}
                name={userName}
                avatarUrl={userAvatarUrl}
                variant="sidebar"
                isCollapsed={false}
              />
            </div>

          </div>
        </div>
      )}
    </>
  )
}