import { createClient } from '@/lib/supabase/server'
import { getTimeEntries } from '../../actions'
import { TimeManager } from '../../components/TimeManager'

export default async function ProjectTimePage({
  params
}: {
  params: Promise<{ workspaceId: string; projectId: string }>
}) {
  const { workspaceId, projectId } = await params
  const supabase = await createClient()
  
  // 1. Lekérjük az eddig rögzített időket
  const { entries } = await getTimeEntries(projectId)

  // 2. ÚJ: Lekérjük a projekt aktív feladatait a legördülő menühöz!
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  return (
    <div className="animate-in fade-in duration-500">
      <TimeManager 
        initialEntries={entries || []} 
        projectTasks={tasks || []} // <-- Átadjuk a feladatokat
        workspaceId={workspaceId} 
        projectId={projectId} 
      />
    </div>
  )
}