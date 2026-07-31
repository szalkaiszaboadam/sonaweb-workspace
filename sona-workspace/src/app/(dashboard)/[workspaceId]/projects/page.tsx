import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreateProjectModal } from './components/CreateProjectModal' 
import { ProjectActions } from './components/ProjectActions'
import { ProjectStatusBadge } from './components/ProjectStatusBadge'
import { FolderKanban, Clock } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

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

  const { data: memberData } = await supabase.from('workspace_members').select('role').eq('workspace_id', workspaceId).eq('user_id', user.id).single()
  const isWorkspaceOwner = memberData?.role === 'owner'

  // ÚJ: Lekérjük a tagokat és csoportokat a Modal számára
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
        
        {/* ITT ADJUK ÁT AZ ADATOKAT A MODALNAK */}
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
            const isManager = isWorkspaceOwner || project.user_id === user.id

            return (
              <div key={project.id} className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-shadow group relative flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <ProjectStatusBadge projectId={project.id} workspaceId={workspaceId} currentStatus={project.status} />
                  </div>
                  <ProjectActions project={project} isManager={isManager} />
                </div>
                
                <Link href={`/${workspaceId}/projects/${project.id}`} className="text-lg font-semibold text-foreground mb-3 hover:text-primary transition-colors inline-block">
                  {project.name}
                </Link>
                
                {/* ÜGYFÉL NÉV TÖRÖLVE INNEN */}
                
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
            <FolderKanban className="w-8 h-8 text-primary" />
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