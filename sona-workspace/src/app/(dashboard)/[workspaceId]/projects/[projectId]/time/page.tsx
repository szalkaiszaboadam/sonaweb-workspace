import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TimeManager } from '../../components/TimeManager'
import { checkPermission } from '@/lib/permissions' // <-- 1. ÚJ IMPORT

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

// 🚀 3. JOGOK KISZÁMOLÁSA A SZERVEREN
    const hasViewOthers = await checkPermission(workspaceId, 'time:view_others')
    const hasEditOthers = await checkPermission(workspaceId, 'time:edit_others')
    const hasDeleteOthers = await checkPermission(workspaceId, 'time:delete_others')

    const { data: memberData } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single()
        
    const isOwner = memberData?.role === 'owner'

    // 🚀 4. IDŐBEJEGYZÉSEK LEKÉRÉSE (JOGOSULTSÁG ALAPJÁN SZŰRVE)
    let query = supabase
        .from('time_entries')
        .select(`*, tasks ( title )`)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

    // Ha nem tulajdonos, és nincs joga másokat látni, szűrjük a lekérdezést!
    if (!isOwner && !hasViewOthers) {
        query = query.eq('user_id', user.id)
    }

    const { data: entries } = await query

    // 5. Munkatársak adatainak lekérése a Workspace-ből
    const { data: membersData } = await supabase.rpc('get_workspace_users', { ws_id: workspaceId })
    const members = membersData?.map((m: any) => ({
      id: m.user_id,
      email: m.email,
      name: m.name || m.email.split('@')[0],
      avatar_url: m.avatar_url 
    })) || []

    // 6. Adatok megformázása a TimeManager komponens számára
    const initialEntries = (entries || []).map(entry => {
        const member = members.find((m: any) => m.id === entry.user_id)
        const displayName = member
            ? (member.name !== member.email ? `${member.name} (${member.email})` : member.email)
            : 'Ismeretlen kolléga'

        return {
            id: entry.id,
            user_id: entry.user_id, // <--- 2. EZ HIÁNYZOTT (Fontos a jogosultságokhoz!)
            description: entry.description,
            date: entry.date,
            duration_minutes: entry.duration_minutes,
            user_email: entry.user_id === user.id ? 'Te' : displayName,
            user_avatar_url: member?.avatar_url,
            created_at: entry.created_at,
            task_title: entry.tasks?.title || null,
            project_id: entry.project_id, 
            task_id: entry.task_id 
        }
    })

return (
        <div className="animate-in fade-in duration-500">
            <TimeManager
                initialEntries={initialEntries}
                projectTasks={projectTasks || []}
                workspaceId={workspaceId}
                projectId={projectId}
                currentUserId={user.id}                    
                hasEditOthersPerm={hasEditOthers}          
                hasDeleteOthersPerm={hasDeleteOthers}      
                hasViewOthersPerm={hasViewOthers}         
            />
        </div>
    )
}