import { createClient } from '@/lib/supabase/server'
import { Mail, Clock, Shield, Crown, User as UserIcon } from 'lucide-react'
import { InviteMemberModal } from './components/InviteMemberModal'

export const dynamic = 'force-dynamic'

export default async function TeamPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const supabase = await createClient()

  // 1. Lekérjük a függőben lévő (pending) meghívásokat
  const { data: invitations } = await supabase
    .from('workspace_invitations')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // 2. Lekérjük az aktív tagokat az új SQL függvénnyel
  const { data: members, error: membersError } = await supabase.rpc('get_workspace_members', {
    w_id: workspaceId
  })

  if (membersError) {
    console.error('Hiba a tagok lekérdezésekor:', membersError)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Csapat és Meghívások</h1>
          <p className="text-sm text-sona-neutral mt-1">
            Kezeld a munkaterület tagjait és küldj ki új meghívókat.
          </p>
        </div>
        
        <InviteMemberModal workspaceId={workspaceId} />
      </div>

      <div className="space-y-8">
        {/* AKTÍV TAGOK SZEKCIÓ */}
        <div>
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-sona-neutral" />
            Aktív Tagok
          </h2>
          
          {!members || members.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-sm text-sona-neutral text-center py-4">
                Nem sikerült betölteni a tagokat.
              </p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="divide-y divide-border">
                {members.map((member: any) => {
                  const displayName = member.name || member.email.split('@')[0]
                  
                  return (
                    <div key={member.id} className="p-4 flex items-center justify-between hover:bg-sona-neutral/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          {/* Főhelyen a Név */}
                          <p className="text-sm font-medium text-foreground">{displayName}</p>
                          {/* Alatta az E-mail és a Dátum */}
                          <p className="text-xs text-sona-neutral">
                            {member.email} • Csatlakozott: {new Date(member.created_at).toLocaleDateString('hu-HU')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {member.is_owner ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            <Crown className="w-3 h-3" />
                            Tulajdonos
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sona-neutral/10 text-foreground border border-border">
                            <UserIcon className="w-3 h-3" />
                            Tag
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* FÜGGŐBEN LÉVŐ MEGHÍVÁSOK SZEKCIÓ */}
        <div>
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-sona-neutral" />
            Függőben lévő meghívások
          </h2>

          {!invitations || invitations.length === 0 ? (
            <div className="bg-surface border border-dashed border-border rounded-xl p-8 text-center flex flex-col items-center">
              <Mail className="w-8 h-8 text-sona-neutral/50 mb-3" />
              <p className="text-sm text-sona-neutral">Nincsenek kiküldött, várakozó meghívók.</p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="divide-y divide-border">
                {invitations.map((invite) => (
                  <div key={invite.id} className="p-4 flex items-center justify-between hover:bg-sona-neutral/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {invite.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{invite.email}</p>
                        <p className="text-xs text-sona-neutral">
                          Lejár: {new Date(invite.expires_at).toLocaleDateString('hu-HU')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                        Várakozás
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}