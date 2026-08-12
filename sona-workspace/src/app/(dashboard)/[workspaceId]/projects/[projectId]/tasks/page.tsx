import { createClient } from '@/lib/supabase/server'
import { TaskManager } from '../../components/TaskManager'
import { checkPermission } from '@/lib/permissions' // <-- ÚJ

type Props = {
  params: Promise<{ workspaceId: string; projectId: string }>
}

export default async function ProjectTasksPage(props: Props) {
  const { workspaceId, projectId } = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: tasks } = await supabase.from('tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: true })

  // 🚀 JOGOK KISZÁMOLÁSA A SZERVEREN
  const hasEditOthers = await checkPermission(workspaceId, 'task:edit_others')
  const hasDeleteOthers = await checkPermission(workspaceId, 'task:delete')

  return (
    <div className="h-full flex flex-col">
      <TaskManager 
        initialTasks={tasks || []} 
        workspaceId={workspaceId} 
        projectId={projectId}
        currentUserId={user?.id || ''}
        hasEditOthersPerm={hasEditOthers}
        hasDeleteOthersPerm={hasDeleteOthers}
      />
    </div>
  )
}