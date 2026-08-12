import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { SettingsForm } from '../../components/SettingsForm'
import { checkPermission } from '@/lib/permissions' // <-- ÚJ IMPORT

export default async function ProjectSettingsPage({
  params 
}: {
  params: Promise<{ workspaceId: string; projectId: string }>
}) {
  const { workspaceId, projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single()
  if (!project) notFound()

  const { data: memberData } = await supabase.from('workspace_members').select('role').eq('workspace_id', workspaceId).eq('user_id', user.id).single()

// 🚀 AZ ÚJ JOGOSULTSÁG SZÁMÍTÓ LOGIKA:
  const isWorkspaceOwner = memberData?.role === 'owner'
  const isProjectCreator = project.user_id === user.id
  
  const hasEdit = await checkPermission(workspaceId, 'project:edit')
  const hasDelete = await checkPermission(workspaceId, 'project:delete')
  const hasAccess = await checkPermission(workspaceId, 'project:manage_access')

  const isManager = isWorkspaceOwner || isProjectCreator || hasEdit || hasDelete || hasAccess

  // Ha BÁRMELYIK feltétel teljesül, bent maradhat. Ha egyik sem, kidobjuk!
  if (!isManager) {
    redirect(`/${workspaceId}/projects/${projectId}`) 
  }

  const { data: workspaceMembersData } = await supabase.rpc('get_workspace_users', { ws_id: workspaceId })
  const { data: projectMembers } = await supabase.from('project_members').select('user_id').eq('project_id', projectId)

  return (
    <div className="max-w-3xl animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">A projekt beállításai</h2>
        <p className="text-sona-neutral mt-1 text-sm">
          Itt módosíthatod a projekt alapadatait, státuszát, láthatóságát, vagy törölheted a teljes projektet.
        </p>
      </div>

      <SettingsForm 
        project={project} 
        workspaceId={workspaceId} 
        workspaceMembers={workspaceMembersData || []}
        activeMemberIds={projectMembers?.map(pm => pm.user_id) || []}
      />
    </div>
  )
}