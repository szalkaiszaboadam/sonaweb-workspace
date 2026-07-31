import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreateProjectModal } from './components/CreateProjectModal' 
import { Clock } from 'lucide-react'
import Link from 'next/link'
import { getProjectIcon, getProjectColor } from '@/lib/project-icons'

export const dynamic = 'force-dynamic'

// Ugyanaz a stílus-szótár, amit a belső layoutban is használunk a tökéletes konzisztenciáért!
const STATUS_MAP = {
  planning: { label: 'Tervezés alatt', class: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
  in_progress: { label: 'Folyamatban', class: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  on_hold: { label: 'Felfüggesztve', class: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  completed: { label: 'Befejezett', class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
}

type Props = {
  params: Promise<{ workspaceId: string }>
}

export default async function ProjectsPage(props: Props) {
  const { workspaceId } = await props.params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workspace } = await supabase.from('workspaces').select('*').eq('id', workspaceId).single()
  if (!workspace) redirect('/workspaces')

  const { data: workspaceMembersData } = await supabase.rpc('get_workspace_users', { ws_id: workspaceId })
  const { data: workspaceGroups } = await supabase.from('workspace_groups').select('*').eq('workspace_id', workspaceId)
  const { data: projects } = await supabase.from('projects').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Projektek</h1>
          <p className="text-sm text-sona-neutral">
            Kezeld a(z) <span className="font-medium text-foreground">{workspace.name}</span> munkaterület aktív projektjeit.
          </p>
        </div>
        
        <CreateProjectModal 
          workspaceId={workspace.id} 
          workspaceMembers={workspaceMembersData || []}
          workspaceGroups={workspaceGroups || []}
          currentUserId={user.id}
        />
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const Icon = getProjectIcon(project.emoji)
            const colorTheme = getProjectColor(project.color)
            const statusConfig = STATUS_MAP[project.status as keyof typeof STATUS_MAP] || STATUS_MAP.planning

            return (
              <div key={project.id} className="bg-surface border border-border rounded-xl p-6 hover:shadow-md hover:border-primary/50 transition-all group relative flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg flex items-center justify-center w-11 h-11 shadow-sm ${colorTheme.bg} ${colorTheme.text}`}>
                      <Icon className="w-6 h-6" strokeWidth={2} />
                    </div>
                    
                    {/* STATIKUS, OLVASHATÓ STÁTUSZ JELZŐ */}
                    <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${statusConfig.class}`}>
                      {statusConfig.label}
                    </div>

                  </div>
                </div>
                
                <Link href={`/${workspaceId}/projects/${project.id}`} className="text-lg font-semibold text-foreground mb-3 hover:text-primary transition-colors inline-block before:absolute before:inset-0 before:z-0">
                  {project.name}
                </Link>
                
                <p className="text-sm text-sona-neutral line-clamp-2 flex-1 mb-6">
                  {project.description || 'Nincs megadva leírás.'}
                </p>
                
                <div className="flex items-center text-xs text-sona-neutral/70 mt-auto pt-4 border-t border-border/50">
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  Létrehozva: {new Date(project.created_at).toLocaleDateString('hu-HU')}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-center p-12 bg-surface/50 border border-border border-dashed rounded-2xl text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Nincsenek még projektek</h3>
          <p className="text-sona-neutral text-sm max-w-sm mb-6">
            Ebben a munkaterületben még nem hoztál létre egyetlen projektet sem. Kezdd el most!
          </p>
          <CreateProjectModal 
            workspaceId={workspace.id} 
            workspaceMembers={workspaceMembersData || []}
            workspaceGroups={workspaceGroups || []}
            currentUserId={user.id}
          />
        </div>
      )}
    </div>
  )
}