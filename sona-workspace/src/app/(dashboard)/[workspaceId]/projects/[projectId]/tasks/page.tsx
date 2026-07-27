import { createClient } from '@/lib/supabase/server'
import { TaskManager } from '../../components/TaskManager'

type Props = {
  params: Promise<{ workspaceId: string; projectId: string }>
}

export default async function ProjectTasksPage(props: Props) {
  const { workspaceId, projectId } = await props.params
  const supabase = await createClient()

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  return (
    <div className="h-full flex flex-col">
      <TaskManager 
        initialTasks={tasks || []} 
        workspaceId={workspaceId} 
        projectId={projectId} 
      />
    </div>
  )
}