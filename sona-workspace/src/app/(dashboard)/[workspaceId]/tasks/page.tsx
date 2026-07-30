import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckSquare } from 'lucide-react'
import { WorkspaceTasksView } from './components/WorkspaceTasksView'

export default async function WorkspaceTasksPage({
  params
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Zseniális SQL lekérdezés: Lekérjük az összes feladatot a munkaterületről,
  // és a reláció (projects) segítségével behúzzuk melléjük a projekt nevét is!
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      projects ( name )
    `)
    .eq('workspace_id', workspaceId)
    .order('due_date', { ascending: true, nullsFirst: false })

  // 2. Lekérjük a munkaterület tagjait a felelősök megjelenítéséhez
  const { data: membersData } = await supabase.rpc('get_workspace_users', { ws_id: workspaceId })
  
  const members = membersData?.map((m: any) => ({
    id: m.user_id,
    email: m.email,
    name: m.name || m.email.split('@')[0]
  })) || []

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col h-full animate-in fade-in duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <CheckSquare className="w-8 h-8 text-primary" />
          Minden feladat
        </h1>
        <p className="text-sm text-sona-neutral mt-2">
          Az összes projekt feladatainak globális áttekintése.
        </p>
      </div>

      <div className="flex-1">
        <WorkspaceTasksView 
          initialTasks={tasks || []} 
          members={members} 
          workspaceId={workspaceId} 
          currentUserId={user.id} 
        />
      </div>

    </div>
  )
}