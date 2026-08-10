import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WorkspaceSidebar } from '@/components/layout/WorkspaceSidebar'
import { WorkspaceHeader } from '@/components/layout/WorkspaceHeader' // <--- ÚJ IMPORT!

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

  return (
    <div className="flex flex-1 h-full overflow-hidden w-full">
      
      {/* TELJES MAGASSÁGÚ ASZTALI SIDEBAR (Mobilon elrejtve) */}
      <WorkspaceSidebar 
        currentWorkspaceId={workspaceId}
        currentWorkspaceName={currentWorkspaceName}
        workspaces={allWorkspaces}
        userRole={userRole}
        userEmail={user.email || ''}
        userName={user.user_metadata?.name}
        userAvatarUrl={user.user_metadata?.avatar_url}
      />
      
      {/* JOBB OLDALI TARTALOM (Navbar + Oldalak) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background relative">
        
        {/* AZ ÚJ OKOS HEADER (Asztali kereső + Mobilos Hamburger Menü) */}
        <WorkspaceHeader 
          workspaceId={workspaceId}
          workspaceName={currentWorkspaceName}
          workspaces={allWorkspaces}
          userRole={userRole}
          userEmail={user.email || ''}
          userName={user.user_metadata?.name}
          userAvatarUrl={user.user_metadata?.avatar_url}
        />

        {/* FŐ TARTALOM */}
        <main className="flex-1 overflow-y-auto relative">
          <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
        
      </div>
    </div>
  )
}