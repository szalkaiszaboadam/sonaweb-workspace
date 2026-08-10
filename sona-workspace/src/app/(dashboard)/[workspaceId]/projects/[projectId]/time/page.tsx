import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TimeManager } from '../../components/TimeManager'

export default async function ProjectTimeTrackerPage({
    params
}: {
    params: Promise<{ workspaceId: string, projectId: string }>
}) {
    const { workspaceId, projectId } = await params
    const supabase = await createClient()

    // 1. Hitelesítés
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 2. Projekt feladatainak lekérése a legördülő menühöz (csak a nem lezártak)
    const { data: projectTasks } = await supabase
        .from('tasks')
        .select('id, title')
        .eq('project_id', projectId)
        .neq('status', 'done')

    // 3. Időbejegyzések lekérése a Supabase-ből (Feladat nevekkel együtt)
    const { data: entries } = await supabase
        .from('time_entries')
        .select(`
      *,
      tasks ( title )
    `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

    // 4. AZ ÚJ VARÁZSLAT: Munkatársak adatainak lekérése a Workspace-ből
// 4. AZ ÚJ VARÁZSLAT: Munkatársak adatainak lekérése a Workspace-ből
  const { data: membersData } = await supabase.rpc('get_workspace_users', { ws_id: workspaceId })
  const members = membersData?.map((m: any) => ({
    id: m.user_id,
    email: m.email,
    name: m.name || m.email.split('@')[0],
    avatar_url: m.avatar_url // <--- EZ A SOR HIÁNYZOTT!
  })) || []

  
    // 5. Adatok megformázása a TimeManager komponens számára
    const initialEntries = (entries || []).map(entry => {
        const member = members.find((m: any) => m.id === entry.user_id)
        const displayName = member
            ? (member.name !== member.email ? `${member.name} (${member.email})` : member.email)
            : 'Ismeretlen kolléga'

        return {
            id: entry.id,
            description: entry.description,
            date: entry.date,
            duration_minutes: entry.duration_minutes,
            user_email: entry.user_id === user.id ? 'Te' : displayName,
            user_avatar_url: member?.avatar_url,
            created_at: entry.created_at,
            task_title: entry.tasks?.title || null,
            project_id: entry.project_id, // <-- FONTOS A SZERKESZTÉSHEZ
            task_id: entry.task_id // <-- FONTOS A SZERKESZTÉSHEZ
        }
    })

    return (
        <div className="animate-in fade-in duration-500">
            <TimeManager
                initialEntries={initialEntries}
                projectTasks={projectTasks || []}
                workspaceId={workspaceId}
                projectId={projectId}
            />
        </div>
    )
}