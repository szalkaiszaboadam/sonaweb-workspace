import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Shield, Globe2, Crown, Lock, Building2 } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'

// ITT A MEGOLDÁS: Megmondjuk a TypeScriptnek, hogy hogy néz ki egy tag
type TeamMember = {
  user_id: string
  name: string | null
  email: string
  role: string
  avatar_url?: string | null // <--- ÚJ
}

export default async function ProjectTeamPage({
  params
}: {
  params: Promise<{ workspaceId: string; projectId: string }>
}) {
  const { workspaceId, projectId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Projekt alapadatok lekérése
  const { data: project } = await supabase.from('projects').select('user_id, is_private, name').eq('id', projectId).single()
  if (!project) redirect(`/${workspaceId}/projects`)

  // 2. Munkatér összes tagjának és szerepkörének lekérése
  const { data: wsUsers } = await supabase.rpc('get_workspace_users', { ws_id: workspaceId })
  const { data: wsRoles } = await supabase.from('workspace_members').select('user_id, role').eq('workspace_id', workspaceId)

  // Összefésüljük a neveket, emaileket és a szerepköröket (role), ÉS rákényszerítjük a TeamMember típust!
const workspaceMembers: TeamMember[] = (wsUsers || []).map((u: any) => ({
    user_id: u.user_id,
    name: u.name,
    email: u.email,
    role: wsRoles?.find(r => r.user_id === u.user_id)?.role || 'member',
    avatar_url: u.avatar_url // <--- ÚJ
  }))

  // 3. Projekt-specifikus hozzáférések (ha privát)
  let projectMemberIds: string[] = []
  let projectGroups: any[] = []

  if (project.is_private) {
    const { data: pm } = await supabase.from('project_members').select('user_id').eq('project_id', projectId)
    projectMemberIds = pm?.map(m => m.user_id) || []

    const { data: pg } = await supabase.from('project_groups').select('group_id').eq('project_id', projectId)
    const groupIds = pg?.map(g => g.group_id) || []

    if (groupIds.length > 0) {
      const { data: wg } = await supabase.from('workspace_groups').select('id, name').in('id', groupIds)
      projectGroups = wg || []
    }
  }

  // 4. Szétválogatjuk a felhasználókat a megjelenítéshez
  const projectCreator = workspaceMembers.find(m => m.user_id === project.user_id)
  const workspaceOwners = workspaceMembers.filter(m => m.role === 'owner' && m.user_id !== project.user_id)

  // Kiszámoljuk, kik az aktív, normál tagok a projekten
  const activeMembers = project.is_private
    ? workspaceMembers.filter(m => projectMemberIds.includes(m.user_id) && m.user_id !== project.user_id && m.role !== 'owner')
    : workspaceMembers.filter(m => m.user_id !== project.user_id && m.role !== 'owner')

  return (
    <div className="max-w-4xl animate-in fade-in duration-500 pb-12">
      
      {/* Tájékoztató fejléc a projekt láthatóságáról */}
      <div className={`mb-8 p-4 rounded-xl border flex items-start gap-4 ${project.is_private ? 'bg-orange-500/5 border-orange-500/20' : 'bg-primary/5 border-primary/20'}`}>
        {project.is_private ? (
          <Lock className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
        ) : (
          <Globe2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
        )}
        <div className="flex flex-col">
          <h2 className={`text-sm font-bold ${project.is_private ? 'text-orange-500' : 'text-primary'}`}>
            {project.is_private ? 'Privát Projekt' : 'Publikus Projekt'}
          </h2>
          <p className="text-sm text-sona-neutral mt-1">
            {project.is_private 
              ? 'Ehhez a projekthez csak a Projektvezető, a Munkatér tulajdonosok, és a külön meghívott tagok/csoportok férnek hozzá.' 
              : 'Ez a projekt publikus, így a munkatér összes tagja láthatja és dolgozhat rajta.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* PROJEKTVEZETŐ */}
        <section>
          <h3 className="text-xs font-bold text-sona-neutral uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
            <Crown className="w-4 h-4" /> Projektvezető
          </h3>
          <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
           <Avatar 
  name={projectCreator?.name || '?'} 
  url={projectCreator?.avatar_url} 
  className="w-10 h-10 text-sm" 
/>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                {projectCreator?.name || 'Ismeretlen'} {projectCreator?.user_id === user.id && '(Te)'}
              </span>
              <span className="text-xs text-sona-neutral">{projectCreator?.email}</span>
            </div>
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-md">
              Létrehozó
            </span>
          </div>
        </section>

        {/* TULAJDONOSOK */}
        {workspaceOwners.length > 0 && (
          <section>
            <h3 className="text-xs font-bold text-sona-neutral uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Munkatér Tulajdonosok
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {workspaceOwners.map(owner => (
                <div key={owner.user_id} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
                  <Avatar 
  name={owner.name || '?'} 
  url={owner.avatar_url} 
  fallbackClass="bg-sona-neutral/10 text-foreground" 
  className="w-10 h-10 text-sm" 
/>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {owner.name || 'Ismeretlen'} {owner.user_id === user.id && '(Te)'}
                    </span>
                    <span className="text-xs text-sona-neutral truncate">{owner.email}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CSOPORTOK (Csak ha privát és vannak meghívva) */}
        {project.is_private && projectGroups.length > 0 && (
          <section>
            <h3 className="text-xs font-bold text-sona-neutral uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Meghívott Csoportok
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {projectGroups.map(group => (
                <div key={group.id} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 border-l-2 border-l-primary">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">{group.name}</span>
                    <span className="text-xs text-sona-neutral">A csoport összes tagja hozzáfér</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CSAPATTAGOK */}
        <section>
          <h3 className="text-xs font-bold text-sona-neutral uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
            <Users className="w-4 h-4" /> {project.is_private ? 'Meghívott Munkatársak' : 'Projekt Csapat'}
          </h3>
          
          {activeMembers.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-border rounded-xl bg-surface/50 text-sona-neutral text-sm">
              Nincsenek további tagok a projekten.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeMembers.map(member => (
                <div key={member.user_id} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4">
                <Avatar 
  name={member.name || '?'} 
  url={member.avatar_url} 
  fallbackClass="bg-sona-neutral/10 text-foreground" 
  className="w-10 h-10 text-sm" 
/>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {member.name || 'Ismeretlen'} {member.user_id === user.id && '(Te)'}
                    </span>
                    <span className="text-xs text-sona-neutral truncate">{member.email}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}