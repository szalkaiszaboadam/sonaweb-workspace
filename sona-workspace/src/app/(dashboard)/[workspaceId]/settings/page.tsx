import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RenameWorkspaceForm } from './components/RenameWorkspaceForm'
import { DeleteWorkspaceButton } from './components/DeleteWorkspaceButton'
import { Avatar } from '@/components/ui/Avatar'
import { Settings, AlertTriangle, Users, Clock, Mail } from 'lucide-react'

// Az áthelyezett komponensek importálása
import { TeamManager } from './components/TeamManager'
import { InviteMemberModal } from './components/InviteMemberModal'
import { GroupManager } from './components/GroupManager'

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // --- KÖTELEZŐ VÉDELEM: SZEREPKÖR LEKÉRÉSE ---
  const { data: memberData } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (memberData?.role !== 'owner') {
    redirect(`/${workspaceId}`) 
  }

  // Munkaterület adatainak lekérése
  const { data: workspace } = await supabase.from('workspaces').select('name').eq('id', workspaceId).single()

  // --- CSAPAT ÉS JOGOSULTSÁG ADATOK LEKÉRÉSE ---
  const { data: membersData } = await supabase.rpc('get_workspace_users', { ws_id: workspaceId })
const members = membersData?.map((m: any) => ({
    id: m.user_id,
    email: m.email,
    name: m.name || m.email.split('@')[0],
    role: m.role || 'member',
    avatar_url: m.avatar_url // <--- EZ AZ ÚJ SOR
  })) || []

  const { data: invitations } = await supabase
    .from('workspace_invitations')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  const pendingInvitations = invitations || []

  const { data: groupsData } = await supabase
    .from('workspace_groups')
    .select(`id, name, workspace_group_members ( user_id )`)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true })

  const groups = groupsData?.map(g => ({
    id: g.id,
    name: g.name,
    memberIds: g.workspace_group_members.map((m: any) => m.user_id)
  })) || []

  return (
    <div className="max-w-5xl w-full flex flex-col gap-8 animate-in fade-in duration-500 pb-12">
      
      <div className="mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Settings className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          Beállítások
        </h1>
        <p className="text-sm text-sona-neutral mt-2">
          Kezeld a munkaterület adatait, a csapattagok jogosultságait és a modulokat.
        </p>
      </div>

      <div className="space-y-10">
        
        {/* ========================================== */}
        {/* ÁLTALÁNOS BEÁLLÍTÁSOK */}
        {/* ========================================== */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Általános</h2>
            <p className="text-sm text-sona-neutral mt-1">A munkaterület alapvető adatainak módosítása.</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm max-w-2xl">
            <RenameWorkspaceForm workspaceId={workspaceId} initialName={workspace?.name || ''} />
          </div>
        </section>

        <hr className="border-border" />

        {/* ========================================== */}
        {/* CSAPAT ÉS JOGOSULTSÁGOK */}
        {/* ========================================== */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Csapat és Jogosultságok</h2>
              <p className="text-sm text-sona-neutral mt-1">Kezeld a tagokat és a hozzáférési szinteket.</p>
            </div>
            <InviteMemberModal workspaceId={workspaceId} />
          </div>
          
          <TeamManager 
            workspaceId={workspaceId} 
            members={members} 
            currentUserId={user.id}
            currentUserRole="owner"
          />
          
          <GroupManager 
            workspaceId={workspaceId}
            members={members}
            groups={groups}
            currentUserRole="owner"
          />
        </section>

        <hr className="border-border" />

        {/* ========================================== */}
        {/* VÁRAKOZÓ MEGHÍVÁSOK */}
        {/* ========================================== */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Függőben lévő meghívások</h2>
            <p className="text-sm text-sona-neutral mt-1">Az elküldött, de még el nem fogadott meghívók listája.</p>
          </div>
          
          {pendingInvitations.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center bg-surface/30">
              <div className="w-12 h-12 rounded-full bg-sona-neutral/10 flex items-center justify-center mb-3">
                <Mail className="w-6 h-6 text-sona-neutral" />
              </div>
              <p className="text-sm font-medium text-foreground">Nincsenek várakozó meghívók</p>
              <p className="text-xs text-sona-neutral mt-1">Jelenleg minden meghívás elfogadásra került, vagy nem küldtél ki újat.</p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="divide-y divide-border">
                {pendingInvitations.map((invite) => (
                  <div key={invite.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-sona-neutral/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar 
                        name={invite.email} 
                        className="w-10 h-10 text-sm" 
                        fallbackClass="bg-foreground text-background" 
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{invite.email}</p>
                        <p className="text-xs text-sona-neutral">Lejár: {new Date(invite.expires_at).toLocaleDateString('hu-HU')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sona-neutral/10 text-foreground border border-border shadow-sm">
                        Várakozás
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ========================================== */}
        {/* VESZÉLYES ZÓNA */}
        {/* ========================================== */}
        <section className="mt-12 pt-8 border-t border-red-500/20">
          <div className="border border-red-500/30 rounded-xl overflow-hidden relative bg-surface">
            <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
            <div className="p-6 relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h3 className="text-base font-bold text-red-500 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Munkaterület törlése
                </h3>
                <p className="text-sm text-sona-neutral mt-1 max-w-xl">
                  A munkaterület és az összes benne lévő adat (projektek, feladatok, tagok) véglegesen törlődik. Ezt a műveletet nem lehet visszavonni.
                </p>
              </div>
              
              <div className="shrink-0">
                <DeleteWorkspaceButton workspaceId={workspaceId} workspaceName={workspace?.name || ''} />
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}