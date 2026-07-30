import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Timer } from 'lucide-react'
import { WorkspaceTimeView } from './components/WorkspaceTimeView'

export default async function WorkspaceTimePage({
  params
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Lekérjük a munkaterület összes időbejegyzését, plusz JOIN-nal a Projekt és Feladat nevét!
  const { data: entries } = await supabase
    .from('time_entries')
    .select(`
      *,
      projects ( name ),
      tasks ( title )
    `)
    .eq('workspace_id', workspaceId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  // Lekérjük a munkaterület tagjait, hogy szép neveket mutassunk (email helyett/mellett)
  const { data: membersData } = await supabase.rpc('get_workspace_users', { ws_id: workspaceId })
  
  const members = membersData?.map((m: any) => ({
    id: m.user_id,
    email: m.email,
    name: m.name || m.email.split('@')[0]
  })) || []

  // Megformázzuk a frontendnek
  const formattedEntries = (entries || []).map(entry => {
    const member = members.find((m: any) => m.id === entry.user_id)
    return {
      ...entry,
      user_name: member ? member.name : (entry.user_id === user.id ? 'Te' : 'Ismeretlen kolléga'),
      user_email: member ? member.email : '',
      project_name: entry.projects?.name || 'Törölt projekt',
      task_title: entry.tasks?.title || null
    }
  })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col h-full animate-in fade-in duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
            <Timer className="w-7 h-7" />
          </div>
          Globális Időkövetés
        </h1>
        <p className="text-sm text-sona-neutral mt-2">
          Az összes projektedre fordított munkaidő egyetlen, letisztult jelentésben.
        </p>
      </div>

      <div className="flex-1">
        <WorkspaceTimeView 
          entries={formattedEntries} 
          currentUserId={user.id} 
        />
      </div>

    </div>
  )
}