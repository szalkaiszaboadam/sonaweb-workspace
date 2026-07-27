import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ProjectStatusBadge } from '../components/ProjectStatusBadge'
import { ProjectNavbar } from './components/ProjectNavbar'

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

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col h-full">
      
      {/* Vissza gomb */}
      <div className="mb-6">
        <Link 
          href={`/${workspaceId}/projects`}
          className="inline-flex items-center text-sm font-medium text-sona-neutral hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Vissza a projektekhez
        </Link>
      </div>

      {/* Közös Fejléc: Név és Státusz */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
        <ProjectStatusBadge 
          projectId={project.id} 
          currentStatus={project.status} 
        />
      </div>

      {/* A Belső Navigációs Menü (Fülek) */}
      <ProjectNavbar workspaceId={workspaceId} projectId={projectId} />

      {/* Dinamikus Tartalom (Itt jelenik meg az Áttekintés vagy a Feladatok) */}
      <div className="flex-1">
        {children}
      </div>

    </div>
  )
}