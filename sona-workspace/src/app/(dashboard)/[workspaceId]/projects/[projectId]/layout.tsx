import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProjectIcon, getProjectColor } from '@/lib/project-icons'

const STATUS_MAP = {
  planning: { label: 'Tervezés alatt', class: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
  in_progress: { label: 'Folyamatban', class: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  on_hold: { label: 'Felfüggesztve', class: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  completed: { label: 'Befejezett', class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
}

export default async function ProjectLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ workspaceId: string; projectId: string }>
}) {
  const { workspaceId, projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('workspace_id', workspaceId)
    .single()

  if (!project) redirect(`/${workspaceId}/projects`)

  const Icon = getProjectIcon(project.emoji)
  const colorTheme = getProjectColor(project.color)
  const statusConfig = STATUS_MAP[project.status as keyof typeof STATUS_MAP] || STATUS_MAP.planning

  return (
    <div className="w-full flex flex-col h-full animate-in fade-in duration-500 p-2 sm:p-4">
      
      {/* Projekt Fejléc (Már nincs benne vissza gomb, mert a Breadcrumb mutatja!) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center shadow-sm border ${colorTheme.bg} ${colorTheme.text} ${colorTheme.border}`}>
            <Icon className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-foreground tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="text-xs text-sona-neutral mt-0.5 line-clamp-1">{project.description}</p>
            )}
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider shrink-0 w-fit ${statusConfig.class}`}>
          {statusConfig.label}
        </div>
      </div>

      <div className="flex-1">
        {children}
      </div>
      
    </div>
  )
}