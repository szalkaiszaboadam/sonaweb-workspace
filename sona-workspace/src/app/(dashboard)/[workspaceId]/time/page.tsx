import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Timer } from 'lucide-react'
import { TimeManager } from '../projects/components/TimeManager'
import { checkPermission } from '@/lib/permissions' 

export default async function WorkspaceTimePage({
  params
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 🚀 1. JOGOK KISZÁMOLÁSA A SZERVEREN
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

  // 🚀 2. IDŐBEJEGYZÉSEK LEKÉRDEZÉSÉNEK FELÉPÍTÉSE
  let query = supabase
    .from('time_entries')
    .select(`*, projects(name), tasks(title)`)
    .eq('workspace_id', workspaceId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  // HA NEM TULAJDONOS ÉS NINCS JOGA MÁSOKAT LÁTNI -> Csak a sajátját kérjük le!
  if (!isOwner && !hasViewOthers) {
    query = query.eq('user_id', user.id)
  }

  // 3. LEKÉRDEZÉS VÉGREHAJTÁSA (Egyetlen, tiszta deklaráció)
  const { data: entries } = await query

  // 4. KIEGÉSZÍTŐ ADATOK LEKÉRÉSE
  const { data: projects } = await supabase.from('projects').select('id, name, emoji, color').eq('workspace_id', workspaceId)
  const { data: wsMembers } = await supabase.rpc('get_workspace_users', { ws_id: workspaceId })

  // 5. ADATOK ÖSSZEFÉSÜLÉSE A TIMEMANAGER-ED SZÁMÁRA
  const formattedEntries = entries?.map((entry: any) => {
    const member = wsMembers?.find((m: any) => m.user_id === entry.user_id)
    return {
      ...entry,
      user_id: entry.user_id,
      user_email: member?.email || 'Ismeretlen',
      user_avatar_url: member?.avatar_url || null,
      project_name: entry.projects?.name || null,
      task_title: entry.tasks?.title || null
    }
  }) || []

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col h-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Timer className="w-8 h-8 text-primary" />
          Időkövetés
        </h1>
        <p className="text-sm text-sona-neutral mt-2">
          Az összes projekt munkaidő bejegyzésének globális áttekintése.
        </p>
      </div>

<div className="flex-1 bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col p-6">
        <TimeManager 
          initialEntries={formattedEntries} 
          workspaceId={workspaceId} 
          projectId={undefined}
          projects={projects || []}
          projectTasks={[]} 
          currentUserId={user.id}                    
          hasEditOthersPerm={hasEditOthers}          
          hasDeleteOthersPerm={hasDeleteOthers}
          hasViewOthersPerm={hasViewOthers}       
        />
      </div>
    </div>
  )
}