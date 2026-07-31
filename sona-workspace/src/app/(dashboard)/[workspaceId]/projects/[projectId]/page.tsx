import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Building2, CheckCircle2, FileText, BarChart3, ArrowRight, AlignLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ProjectOverviewPage({
  params
}: {
  params: Promise<{ workspaceId: string; projectId: string }>
}) {
  const { workspaceId, projectId } = await params 
  const supabase = await createClient()
  
  // -- ADATOK LEKÉRÉSE --
  
  // 1. Projekt adatok
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()
    
  if (projectError || !project) {
    notFound()
  }

  // 2. Feladatok lekérése a statisztikához
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, status')
    .eq('project_id', projectId)
    
  // 3. Dokumentumok lekérése a statisztikához
  const { data: docs } = await supabase
    .from('documents')
    .select('id')
    .eq('project_id', projectId)

  // -- STATISZTIKA SZÁMOLÁS --
  const totalTasks = tasks?.length || 0
  const completedTasks = tasks?.filter(t => t.status === 'done').length || 0 
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)
  const totalDocs = docs?.length || 0

  return (
    // INNEN KIVETTÜK A PADDINGOT ÉS A MAX-WIDTH-ET
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* 1. ÁTTEKINTÉS KÁRTYÁK (GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Projekt leírása */}
        <div className="md:col-span-2 bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <AlignLeft className="w-5 h-5 text-sona-neutral" /> Projekt leírása
            </h2>
          </div>
          <div className="h-px bg-border w-full" />
          {project.description ? (
            <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm">
              {project.description}
            </p>
          ) : (
            <p className="text-sona-neutral/60 italic text-sm">Nincs megadva részletes leírás a projekthez.</p>
          )}
        </div>

        {/* Haladás / Progress */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <BarChart3 className="w-5 h-5 text-sona-neutral" /> Haladás
          </h2>
          <div className="h-px bg-border w-full" />
          <div className="flex flex-col gap-3 mt-auto pt-4">
            <div className="flex items-end justify-between">
              <span className="text-5xl font-bold text-foreground">{progress}%</span>
              <span className="text-sm font-medium text-sona-neutral mb-1">{completedTasks} / {totalTasks} kész</span>
            </div>
            <div className="w-full bg-sona-neutral/20 h-3 rounded-full overflow-hidden">
              <div className="bg-primary h-full transition-all duration-1000 ease-out relative" style={{ width: `${progress}%` }}>
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GYORS LINKEK / NAVIGÁCIÓ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link href={`/${workspaceId}/projects/${projectId}/tasks`} className="group bg-background border border-border hover:border-primary/50 rounded-2xl p-6 flex items-center justify-between transition-all hover:shadow-md">
          <div className="flex items-center gap-5">
            <div className="p-3.5 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-7 h-7 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">Feladatok</span>
              <span className="text-sm text-sona-neutral">{totalTasks} db feladat a táblán</span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-sona-neutral group-hover:text-primary transition-colors group-hover:translate-x-1" />
        </Link>

        <Link href={`/${workspaceId}/projects/${projectId}/documents`} className="group bg-background border border-border hover:border-primary/50 rounded-2xl p-6 flex items-center justify-between transition-all hover:shadow-md">
          <div className="flex items-center gap-5">
            <div className="p-3.5 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
              <FileText className="w-7 h-7 text-blue-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">Dokumentumok</span>
              <span className="text-sm text-sona-neutral">{totalDocs} db feltöltött fájl</span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-sona-neutral group-hover:text-blue-500 transition-colors group-hover:translate-x-1" />
        </Link>
      </div>

    </div>
  )
}