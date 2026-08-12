import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RenameWorkspaceForm } from './components/RenameWorkspaceForm'
import { DeleteWorkspaceButton } from './components/DeleteWorkspaceButton'
import { Avatar } from '@/components/ui/Avatar'
import { Settings, AlertTriangle, Users, Clock, Mail } from 'lucide-react'
import { RolesManager } from './components/RolesManager'
import { checkPermission } from '@/lib/permissions'
import { TeamManager } from './components/TeamManager'
import { InviteMemberModal } from './components/InviteMemberModal'

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // --- 1. MILYEN SZEREPKÖRE VAN? ---
  const { data: memberData } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  const isOwner = memberData?.role === 'owner'

  // --- 2. FINOMHANGOLT RBAC JOGOK ---
  // JAVÍTVA: Itt már az új 'role:manage' és 'member:manage' kulcsokat használjuk!
  const canManageWorkspace = isOwner || await checkPermission(workspaceId, 'workspace:settings')
  const canManageRoles = isOwner || await checkPermission(workspaceId, 'role:manage')
  const canManageTeam = isOwner || await checkPermission(workspaceId, 'member:manage')

  // VÉDELEM ÉS 404 FIX: Ha semmihez sincs joga a beállításokon belül, visszadobjuk az Overview-ra!
  if (!isOwner && !canManageWorkspace && !canManageRoles && !canManageTeam) {
    redirect(`/${workspaceId}/overview`) 
  }

  // --- 3. ADATOK LEKÉRÉSE ---
  const { data: workspace } = await supabase.from('workspaces').select('name').eq('id', workspaceId).single()

  const { data: rolesData } = await supabase.from('roles').select('id, name, role_permissions(permission)').eq('workspace_id', workspaceId)
  const customRoles = rolesData?.map(r => ({
    id: r.id,
    name: r.name,
    permissions: r.role_permissions.map((rp: any) => rp.permission)
  })) || []

  const { data: wsUsers } = await supabase.rpc('get_workspace_users', { ws_id: workspaceId })
  const { data: internalMembers } = await supabase
    .from('workspace_members')
    .select('id, user_id, role, member_roles(role_id), member_permission_overrides(permission, is_granted)')
    .eq('workspace_id', workspaceId)

  const members = wsUsers?.map((u: any) => {
    const internal = internalMembers?.find(im => im.user_id === u.user_id)
    return {
      id: u.user_id,
      db_id: internal?.id,
      email: u.email,
      name: u.name || u.email.split('@')[0],
      role: internal?.role || 'member',
      avatar_url: u.avatar_url,
      customRoleIds: internal?.member_roles?.map((mr: any) => mr.role_id) || [],
      customPermissions: internal?.member_permission_overrides?.filter((o:any) => o.is_granted).map((o:any) => o.permission) || []
    }
  }) || []

  const { data: invitations } = await supabase
    .from('workspace_invitations')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  
  const pendingInvitations = invitations || []

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
        {/* ÁLTALÁNOS BEÁLLÍTÁSOK (Csak ha van joga: workspace:settings) */}
        {/* ========================================== */}
        {canManageWorkspace && (
          <>
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
          </>
        )}

        {/* ========================================== */}
        {/* JOGOSULTSÁGOK (Csak ha van joga: role:manage) */}
        {/* ========================================== */}
        {canManageRoles && (
          <>
            <section className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Jogosultságok</h2>
                <p className="text-sm text-sona-neutral mt-1">Hozzon létre egyedi szerepköröket a csapattagoknak.</p>
              </div>
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                <RolesManager workspaceId={workspaceId} roles={customRoles} canManage={canManageRoles} />
              </div>
            </section>
            <hr className="border-border" />
          </>
        )}

        {/* ========================================== */}
        {/* CSAPAT KEZELÉSE (Csak ha van joga: member:manage) */}
        {/* ========================================== */}
        {canManageTeam && (
          <>
            <section className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Csapat Tagjai</h2>
                  <p className="text-sm text-sona-neutral mt-1">Kezeld a tagokat és oszd ki a szerepköröket.</p>
                </div>
                <InviteMemberModal workspaceId={workspaceId} />
              </div>
              <TeamManager 
                workspaceId={workspaceId} 
                members={members} 
                currentUserId={user.id} 
                currentUserRole={isOwner ? 'owner' : 'member'} 
                availableRoles={customRoles} 
              />
            </section>
            <hr className="border-border" />
            
            {/* VÁRAKOZÓ MEGHÍVÁSOK (Szintén csak a Csapatkezelők látják) */}
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
                </div>
              ) : (
                <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="divide-y divide-border">
                    {pendingInvitations.map((invite) => (
                      <div key={invite.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-sona-neutral/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar name={invite.email} className="w-10 h-10 text-sm" fallbackClass="bg-foreground text-background" />
                          <div>
                            <p className="text-sm font-semibold text-foreground">{invite.email}</p>
                            <p className="text-xs text-sona-neutral">Lejárat: {new Date(invite.expires_at).toLocaleDateString('hu-HU')}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sona-neutral/10 text-foreground border border-border shadow-sm">
                            Várakozik
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {/* ========================================== */}
        {/* VESZÉLYES ZÓNA (KIZÁRÓLAG TULAJDONOSNAK) */}
        {/* ========================================== */}
        {isOwner && (
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
        )}

      </div>
    </div>
  )
}