import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Timer } from 'lucide-react'
import { TimeManager } from '../projects/components/TimeManager' // <-- AZ ÚJ OKOS KOMPONENS

export default async function WorkspaceTimePage({
  params
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: entries } = await supabase
    .from('time_entries')
    .select(`*, projects ( name ), tasks ( title )`)
    .eq('workspace_id', workspaceId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  const { data: membersData } = await supabase.rpc('get_workspace_users', { ws_id: workspaceId })
  const members = membersData?.map((m: any) => ({
    id: m.user_id, email: m.email, name: m.name || m.email.split('@')[0], avatar_url: m.avatar_url
  })) || []

  const formattedEntries = (entries || []).map(entry => {
    const member = members.find((m: any) => m.id === entry.user_id)
    return {
      id: entry.id,
      description: entry.description,
      date: entry.date,
      duration_minutes: entry.duration_minutes,
      user_email: entry.user_id === user.id ? 'Te' : (member ? member.name : 'Ismeretlen kolléga'),
      user_avatar_url: member?.avatar_url,
      created_at: entry.created_at,
      project_name: entry.projects?.name || 'Törölt projekt',
      task_title: entry.tasks?.title || null,
      project_id: entry.project_id,
      task_id: entry.task_id
    }
  })

  // Plusz adatlekérés a globális szerkesztőhöz
  const { data: projects } = await supabase.from('projects').select('id, name').eq('workspace_id', workspaceId)
  const { data: allTasks } = await supabase.from('tasks').select('id, title, project_id').eq('workspace_id', workspaceId)

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3 mb-1">
          <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
            <Timer className="w-7 h-7" />
          </div>
          Globális Időkövetés
        </h1>
        <p className="text-sm text-sona-neutral">
          Indíts időmérést bármelyik projekthez, vagy szerkeszd utólag a bejegyzéseidet.
        </p>
      </div>
      <div className="flex-1">
        <TimeManager 
          initialEntries={formattedEntries} 
          projects={projects || []}
          projectTasks={allTasks || []}
          workspaceId={workspaceId} 
        />
      </div>
    </div>
  )
}