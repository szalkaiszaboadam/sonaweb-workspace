import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WorkspaceSidebar } from '@/components/layout/WorkspaceSidebar'

// Típusdefiníció frissítve a 'role' paraméterrel
type MembershipData = {
  workspace_id: string
  role: string | null // <-- ÚJ: Hozzáadtuk a szerepkört
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

  // Lekérjük a tagságokat ÉS a szerepkört ('role')
  const { data } = await supabase
    .from('workspace_members')
    .select('workspace_id, role, workspaces(id, name)') // <-- ÚJ: Bekerült a role
    .eq('user_id', user.id)

  const memberships = data as MembershipData[] | null

  if (!memberships || memberships.length === 0) {
    redirect('/workspaces')
  }

  // Kikeressük az aktuális munkaterülethez tartozó tagságot
  const currentMembership = memberships.find(m => m.workspace_id === workspaceId)
  
  if (!currentMembership) redirect('/workspaces')

  // Kinyerjük a szerepkört (ha véletlenül üres lenne, alapértelmezetten 'member')
  const userRole = currentMembership.role || 'member'

  // Formázzuk az adatokat a Sidebar számára
  const allWorkspaces = memberships.map(m => {
    const ws = Array.isArray(m.workspaces) ? m.workspaces[0] : m.workspaces
    return { id: ws?.id || '', name: ws?.name || '' }
  }).filter(ws => ws.id !== '')

  const currentWorkspaceName = allWorkspaces.find(ws => ws.id === workspaceId)?.name || 'Munkaterület'

  return (
    <div className="flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Itt adjuk át az adatokat ÉS a szerepkört az új Sidebarnak */}
      <WorkspaceSidebar 
        currentWorkspaceId={workspaceId}
        currentWorkspaceName={currentWorkspaceName}
        workspaces={allWorkspaces}
        userRole={userRole} // <-- ÚJ: Átadjuk a szerepkört a komponensnek!
      />
      
      <main className="flex-1 overflow-y-auto bg-background relative">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          <div className="mb-6 pb-6 border-b border-border">
            <h2 className="text-2xl font-semibold text-foreground">{currentWorkspaceName}</h2>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}