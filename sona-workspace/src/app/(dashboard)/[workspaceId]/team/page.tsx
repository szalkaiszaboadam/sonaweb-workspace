import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Clock, Mail } from 'lucide-react'
import { TeamManager } from './components/TeamManager'
import { InviteMemberModal } from './components/InviteMemberModal'
import { GroupManager } from './components/GroupManager'

export default async function TeamPage({
  params
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Tagok lekérése (A frissített, jogosultságokat is tartalmazó SQL-el)
  const { data: membersData } = await supabase.rpc('get_workspace_users', { ws_id: workspaceId })
  
  const members = membersData?.map((m: any) => ({
    id: m.user_id,
    email: m.email,
    name: m.name || m.email.split('@')[0],
    role: m.role || 'member'
  })) || []

  // Kikeressük az aktuálisan belépett felhasználó szerepkörét
  const currentMember = members.find((m: any) => m.id === user.id)
  const currentUserRole = currentMember?.role || 'member'

  // 2. Függőben lévő meghívások lekérése (EZT CSAK A TULAJDONOSOKNAK KÉRJÜK LE!)
  let pendingInvitations: any[] = []
  if (currentUserRole === 'owner') {
    const { data: invitations } = await supabase
      .from('workspace_invitations')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      
    pendingInvitations = invitations || []
  }

// ... eddigi lekérdezéseid (members, pendingInvitations) ...

  // 3. CSOPORTOK LEKÉRÉSE ÉS FORMÁZÁSA
  const { data: groupsData } = await supabase
    .from('workspace_groups')
    .select(`
      id, 
      name,
      workspace_group_members ( user_id )
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true })

  const groups = groupsData?.map(g => ({
    id: g.id,
    name: g.name,
    // Kinyerjük csak az ID-kat egy egyszerű tömbbe
    memberIds: g.workspace_group_members.map((m: any) => m.user_id)
  })) || []


  return (
    <div className="p-6 md:p-8 max-w-5xl w-full flex flex-col gap-8 h-full animate-in fade-in duration-500">
      
      {/* ========================================================= */}
      {/* FEJLÉC ÉS MEGHÍVÓ GOMB */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
              <Users className="w-7 h-7" />
            </div>
            Csapat kezelése
          </h1>
          <p className="text-sm text-sona-neutral mt-2">
            {currentUserRole === 'owner' 
              ? 'Kezeld a munkaterület tagjait, hívj meg újakat, vagy módosítsd a jogosultságaikat.'
              : 'Tekintsd meg, kik dolgoznak ezen a munkaterületen.'}
          </p>
        </div>
        
        {/* Meghívás gomb CSAK Tulajdonosoknak */}
        {currentUserRole === 'owner' && (
          <InviteMemberModal workspaceId={workspaceId} />
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. SZEKCIÓ: AKTÍV TAGOK (TeamManager) */}
      {/* ========================================================= */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Aktív csapattagok</h2>
        <TeamManager 
          workspaceId={workspaceId} 
          members={members} 
          currentUserId={user.id}
          currentUserRole={currentUserRole}
        />
      </div>

      <hr className="border-border my-2" />

      {/* ========================================================= */}
      {/* ÚJ SZEKCIÓ: CSOPORTOK */}
      {/* ========================================================= */}
      <GroupManager 
        workspaceId={workspaceId}
        members={members}
        groups={groups}
        currentUserRole={currentUserRole}
      />

      {/* ========================================================= */}
      {/* 2. SZEKCIÓ: VÁRAKOZÓ MEGHÍVÁSOK (Csak Tulajdonosoknak) */}
      {/* ========================================================= */}
      {currentUserRole === 'owner' && (
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-sona-neutral" />
            Függőben lévő meghívások
          </h2>

          {pendingInvitations.length === 0 ? (
            <div className="bg-surface border border-dashed border-border rounded-xl p-8 text-center flex flex-col items-center">
              <Mail className="w-8 h-8 text-sona-neutral/50 mb-3" />
              <p className="text-sm text-sona-neutral">Nincsenek kiküldött, várakozó meghívók.</p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="divide-y divide-border">
                {pendingInvitations.map((invite) => (
                  <div key={invite.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-sona-neutral/5 transition-colors">
                    
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {invite.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{invite.email}</p>
                        <p className="text-xs text-sona-neutral">
                          Lejár: {new Date(invite.expires_at).toLocaleDateString('hu-HU')}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                        Várakozás
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}