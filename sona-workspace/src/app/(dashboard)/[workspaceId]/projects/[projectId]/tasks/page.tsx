import { createClient } from '@/lib/supabase/server'
import { TaskManager } from '../../components/TaskManager'
import { checkPermission } from '@/lib/permissions' 

type Props = {
  params: Promise<{ workspaceId: string; projectId: string }>
}

export default async function ProjectTasksPage(props: Props) {
  const { workspaceId, projectId } = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: tasks } = await supabase.from('tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: true })

  const hasEditOthers = await checkPermission(workspaceId, 'task:edit_others')
  const hasDeleteOthers = await checkPermission(workspaceId, 'task:delete')

  // 🚀 ÚJ ADATOK A HOZZÁRENDELÉSEKHEZ
  // 1. Tagok lekérése
  const { data: wsUsers } = await supabase.rpc('get_workspace_users', { ws_id: workspaceId })
  const members = wsUsers?.map((u: any) => ({ user_id: u.user_id, email: u.email, name: u.name, avatar_url: u.avatar_url })) || []

  // 2. Elérhető Szerepkörök lekérése
  const { data: roles } = await supabase.from('roles').select('id, name').eq('workspace_id', workspaceId)

  // 3. A jelenlegi felhasználó belső ID-ja és szerepkörei
  const { data: member } = await supabase.from('workspace_members').select('id').eq('workspace_id', workspaceId).eq('user_id', user?.id).single()
  const { data: mRoles } = await supabase.from('member_roles').select('role_id').eq('member_id', member?.id)
  const currentUserRoleIds = mRoles?.map((mr: any) => mr.role_id) || []

  return (
    <div className="h-full flex flex-col">
      <TaskManager 
        initialTasks={tasks || []} 
        workspaceId={workspaceId} 
        projectId={projectId}
        currentUserId={user?.id || ''}
        currentUserRoleIds={currentUserRoleIds}    // <-- ÁTADVA
        hasEditOthersPerm={hasEditOthers}
        hasDeleteOthersPerm={hasDeleteOthers}
        members={members}                          // <-- ÁTADVA
        roles={roles || []}                        // <-- ÁTADVA
      />
    </div>
  )
}