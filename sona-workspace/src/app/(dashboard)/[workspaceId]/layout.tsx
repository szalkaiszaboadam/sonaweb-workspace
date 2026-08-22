import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { checkPermission } from '@/lib/permissions'
import { WorkspaceShell } from '@/components/layout/WorkspaceShell'

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

  const { data: projects } = await supabase.from('projects').select('id, name').eq('workspace_id', workspaceId)

  const isOwner = userRole === 'owner'
  const canCreateProject = isOwner || await checkPermission(workspaceId, 'project:create')
  const hasWorkspaceSettings = await checkPermission(workspaceId, 'workspace:settings')
  const hasTeamManage = await checkPermission(workspaceId, 'member:manage')
  const hasRolesManage = await checkPermission(workspaceId, 'role:manage')

  const canManageSettings = isOwner || hasWorkspaceSettings || hasTeamManage || hasRolesManage

  const userProfile = {
      email: user.email || '',
      name: user.user_metadata?.name,
      avatarUrl: user.user_metadata?.avatar_url
  }

  return (
    <WorkspaceShell
        workspaceId={workspaceId}
        currentWorkspaceName={currentWorkspaceName}
        allWorkspaces={allWorkspaces}
        projects={projects || []}
        canCreateProject={canCreateProject}
        canManageSettings={canManageSettings}
        userProfile={userProfile}
    >
        {children}
    </WorkspaceShell>
  )
}