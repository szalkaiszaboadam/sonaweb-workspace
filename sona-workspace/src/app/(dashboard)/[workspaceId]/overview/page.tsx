import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  FolderKanban, 
  CheckSquare, 
  Timer, 
  ArrowRight, 
  Activity, 
  Clock,
  LayoutDashboard
} from 'lucide-react'

export default async function DashboardPage({
  params
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const supabase = await createClient()

  // 1. KÖTELEZŐ: Hitelesítés lekérése
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Projektek lekérése
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false }) 

  if (projectsError) {
    console.error("❌ Hiba a projektek lekérésekor:", JSON.stringify(projectsError))
  }

  const activeProjects = projects || []
  const recentProjects = activeProjects.slice(0, 4)

  // 3. Időkövetés összesítése
  const { data: timeEntries } = await supabase
    .from('time_entries')
    .select('duration_minutes')
    .eq('workspace_id', workspaceId)

  const totalMinutes = timeEntries?.reduce((sum, entry) => sum + entry.duration_minutes, 0) || 0
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMins = totalMinutes % 60

  // 4. Feladatok lekérése ÉS pontos számolása
  const projectIds = activeProjects.map(p => p.id)
  let recentTasks: any[] = []
  let totalTasksCount = 0
  
  if (projectIds.length > 0) {
    // A) Lekérjük a PONTOS darabszámot (adatok nélkül, villámgyorsan)
    const { count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .in('project_id', projectIds)
      
    totalTasksCount = count || 0

    // B) Lekérjük az 5 legfrissebbet a listához
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title, created_at, project_id')
      .in('project_id', projectIds)
      .order('created_at', { ascending: false })
      .limit(5)
      
    if (tasksError) {
      console.error("❌ Hiba a feladatok lekérésekor:", JSON.stringify(tasksError))
    }
    recentTasks = tasks || []
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      
      {/* FEJLÉC */}
      <div className="mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary hidden sm:block">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          Munkaterület Áttekintés
        </h1>
        <p className="text-sm text-sona-neutral mt-2 sm:ml-12">
          Kövesd nyomon a projektek haladását, a feladatokat és a rögzített munkaidőt.
        </p>
      </div>

      {/* ========================================================= */}
      {/* 1. SZEKCIÓ: STATISZTIKA BENTO GRID */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between group hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sona-neutral">
              <FolderKanban className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-semibold uppercase tracking-wider">Projektek</span>
            </div>
          </div>
          <div>
            <div className="text-4xl font-bold text-foreground">
              {activeProjects.length}
            </div>
            <p className="text-xs text-sona-neutral mt-1">Aktív projekt a munkaterületen</p>
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between group hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sona-neutral">
              <CheckSquare className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-semibold uppercase tracking-wider">Feladatok</span>
            </div>
          </div>
          <div>
            <div className="text-4xl font-bold text-foreground">
              {/* ITT MÁR A PONTOS SZÁMOT MUTATJUK! */}
              {totalTasksCount}
            </div>
            <p className="text-xs text-sona-neutral mt-1">Összes feladat a munkaterületen</p>
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between group hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sona-neutral">
              <Timer className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-semibold uppercase tracking-wider">Rögzített Idő</span>
            </div>
          </div>
          <div>
            <div className="text-4xl font-bold text-foreground flex items-baseline gap-1">
              {totalHours}<span className="text-xl text-sona-neutral font-medium">ó</span> 
              {remainingMins}<span className="text-xl text-sona-neutral font-medium">p</span>
            </div>
            <p className="text-xs text-sona-neutral mt-1">Összes naplózott munkaóra</p>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. SZEKCIÓ: LISTÁK (2 Oszlopos Grid) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        
        {/* BAL OSZLOP: Legfrissebb Feladatok */}
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border bg-sona-neutral/5 flex items-center justify-between">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Legfrissebb Feladatok
            </h3>
            <Link href={`/${workspaceId}/tasks`} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Összes <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="flex-1 p-2">
            {recentTasks.length === 0 ? (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-sona-neutral">
                <CheckSquare className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm font-medium">Nincsenek feladatok</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {recentTasks.map(task => {
                  const projectName = activeProjects.find(p => p.id === task.project_id)?.name || 'Projekt'
                  
                  return (
                    <Link 
                      key={task.id} 
                      href={`/${workspaceId}/projects/${task.project_id}/tasks`}
                      className="p-3 hover:bg-sona-neutral/10 rounded-xl transition-colors flex flex-col gap-1.5 group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-sm font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-sona-neutral uppercase tracking-wider">
                        <span className="flex items-center gap-1 bg-background border border-border px-1.5 py-0.5 rounded truncate max-w-[150px]">
                          <FolderKanban className="w-3 h-3" />
                          {projectName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(task.created_at).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* JOBB OSZLOP: Aktív Projektek */}
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border bg-sona-neutral/5 flex items-center justify-between">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-blue-500" />
              Legutóbbi Projektek
            </h3>
            <Link href={`/${workspaceId}/projects`} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Összes <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="flex-1 p-2">
            {recentProjects.length === 0 ? (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-sona-neutral">
                <FolderKanban className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm font-medium">Még nincsenek projektek</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {recentProjects.map(project => (
                  <Link 
                    key={project.id} 
                    href={`/${workspaceId}/projects/${project.id}`}
                    className="p-3 hover:bg-sona-neutral/10 rounded-xl transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <FolderKanban className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">{project.name}</span>
                        <span className="text-[11px] text-sona-neutral flex items-center gap-1">
                          Létrehozva: {new Date(project.created_at).toLocaleDateString('hu-HU')}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-sona-neutral opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}