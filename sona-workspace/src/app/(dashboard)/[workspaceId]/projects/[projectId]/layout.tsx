import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ProjectNavbar } from '../components/ProjectNavbar'
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

  const { data: memberData } = await supabase.from('workspace_members').select('role').eq('workspace_id', workspaceId).eq('user_id', user.id).single()
  const isWorkspaceOwner = memberData?.role === 'owner'
  const isManager = isWorkspaceOwner || project.user_id === user.id

  const Icon = getProjectIcon(project.emoji)
  const colorTheme = getProjectColor(project.color)
  const statusConfig = STATUS_MAP[project.status as keyof typeof STATUS_MAP] || STATUS_MAP.planning

  return (
    // ELTÁVOLÍTOTTUK A DUPLA PADDINGEKET! (Nincs p-6 vagy max-w)
    <div className="w-full flex flex-col h-full animate-in fade-in duration-500"> 
      
      {/* Diszkrét Vissza gomb */}
      <div className="mb-2">
        <Link 
          href={`/${workspaceId}/projects`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-sona-neutral hover:text-foreground transition-colors -ml-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Projektek
        </Link>
      </div>

      {/* Címsor és Státusz */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
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

      <ProjectNavbar workspaceId={workspaceId} projectId={projectId} isManager={isManager} />

      {/* Tartalom */}
      <div className="flex-1 mt-4">
        {children}
      </div>
    </div>
  )
}