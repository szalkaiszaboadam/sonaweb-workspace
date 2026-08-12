import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WorkspaceSidebar } from '@/components/layout/WorkspaceSidebar'
import { TopNavbar } from '@/components/layout/TopNavbar'
import { WorkspaceMobileMenu } from '@/components/layout/WorkspaceMobileMenu'
import { Search, Bell, HelpCircle, Bug } from 'lucide-react'
import { checkPermission } from '@/lib/permissions' // <-- ÚJ IMPORT

type MembershipData = {
  workspace_id: string
  role: string | null
  workspaces: { id: string; name: string } | { id: string; name: string }[] | null
}

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data } = await supabase
    .from('workspace_members')
    .select('workspace_id, role, workspaces(id, name)')
    .eq('user_id', user.id)

  const memberships = data as MembershipData[] | null
  if (!memberships || memberships.length === 0) redirect('/workspaces')

  const currentMembership = memberships.find(m => m.workspace_id === workspaceId)
  if (!currentMembership) redirect('/workspaces')

  const userRole = currentMembership.role || 'member'

  const allWorkspaces = memberships.map(m => {
    const ws = Array.isArray(m.workspaces) ? m.workspaces[0] : m.workspaces
    return { id: ws?.id || '', name: ws?.name || '' }
  }).filter(ws => ws.id !== '')

  const currentWorkspaceName = allWorkspaces.find(ws => ws.id === workspaceId)?.name || 'Munkaterület'

// 🚀 AZ ÚJ JOGOSULTSÁG SZÁMÍTÓ LOGIKA:
  const isOwner = userRole === 'owner'
  const canCreateProject = isOwner || await checkPermission(workspaceId, 'project:create')
  
  const hasWorkspaceSettings = await checkPermission(workspaceId, 'workspace:settings')
  const hasTeamManage = await checkPermission(workspaceId, 'member:manage') // <-- A KULCS ÁTÍRVA: member:manage lett!
  const hasRolesManage = await checkPermission(workspaceId, 'role:manage')  // <-- A KULCS ÁTÍRVA: role:manage lett!

  const canManageSettings = isOwner || hasWorkspaceSettings || hasTeamManage || hasRolesManage
  
  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      <TopNavbar
        userEmail={user.email || ''}
        userName={user.user_metadata?.name}
        userAvatar={user.user_metadata?.avatar_url}
        leftContent={
          <WorkspaceMobileMenu
            workspaceId={workspaceId}
            workspaceName={currentWorkspaceName}
            workspaces={allWorkspaces}
            canCreateProject={canCreateProject} // Passzoljuk le!
            canManageSettings={canManageSettings} // Passzoljuk le!
          />
        }
        centerContent={
          <div className="relative w-full group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sona-neutral group-hover:text-primary transition-colors" />
            <input type="text" placeholder="Keresés feladatokra, doksikra..." className="w-full bg-background border border-border rounded-lg pl-9 pr-14 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-sans font-bold text-sona-neutral bg-surface border border-border rounded shadow-sm">⌘</kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] font-sans font-bold text-sona-neutral bg-surface border border-border rounded shadow-sm">K</kbd>
            </div>
          </div>
        }
        rightContent={
          <div className="flex items-center gap-1 sm:gap-2">
            <button className="hidden sm:block p-2 text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground rounded-lg transition-colors relative" title="Értesítések">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-surface" />
            </button>
            <button className="hidden sm:block p-2 text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground rounded-lg transition-colors" title="Súgó"><HelpCircle className="w-5 h-5" /></button>
            <button className="hidden sm:block p-2 text-sona-neutral hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors" title="Hibabejelentés"><Bug className="w-5 h-5" /></button>
            <button className="sm:hidden p-2 text-sona-neutral hover:bg-sona-neutral/10 hover:text-foreground rounded-lg transition-colors" title="Keresés"><Search className="w-5 h-5" /></button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        <WorkspaceSidebar
          currentWorkspaceId={workspaceId}
          currentWorkspaceName={currentWorkspaceName}
          workspaces={allWorkspaces}
          canCreateProject={canCreateProject} // Passzoljuk le!
          canManageSettings={canManageSettings} // Passzoljuk le!
        />
        <main className="flex-1 overflow-y-auto relative">
          <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}