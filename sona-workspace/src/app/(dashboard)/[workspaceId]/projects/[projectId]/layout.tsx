import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ProjectStatusBadge } from '../components/ProjectStatusBadge'
import { ProjectNavbar } from '../components/ProjectNavbar'

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

  // 1. ÚJ: Lekérjük a felhasználó szerepkörét a munkatérben
  const { data: memberData } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()
    
  const isWorkspaceOwner = memberData?.role === 'owner'
  
  // 2. ÚJ: Kiszámoljuk, hogy ő-e a menedzser (Munkatér tulajdonos VAGY ő hozta létre a projektet)
  const isManager = isWorkspaceOwner || project.user_id === user.id

  return (
    <div className="w-full flex flex-col h-full"> 
      
      {/* Vissza gomb */}
      <div className="mb-4">
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
          workspaceId={workspaceId} 
          currentStatus={project.status} 
        />
      </div>

      {/* A Belső Navigációs Menü (Fülek) */}
      {/* 3. ÚJ: Átadjuk az isManager értéket a Navbarnak! */}
      <ProjectNavbar workspaceId={workspaceId} projectId={projectId} isManager={isManager} />

      {/* Dinamikus Tartalom (Ami a fülek alatt cserélődik) */}
      <div className="flex-1 mt-2">
        {children}
      </div>

    </div>
  )
}