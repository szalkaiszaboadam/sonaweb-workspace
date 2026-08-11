import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { UserMenu } from '@/components/layout/UserMenu'
import { CreateWorkspaceModal } from './components/CreateWorkspaceModal'
import { Building2, ShieldCheck } from 'lucide-react'
import { TopNavbar } from '@/components/layout/TopNavbar'

export const dynamic = 'force-dynamic'

export default async function WorkspacesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Munkaterületek lekérése
  const { data: memberData } = await supabase
    .from('workspace_members')
    .select('role, workspaces(id, name)')
    .eq('user_id', user.id)

  const workspaces = memberData?.map(m => {
    const ws = Array.isArray(m.workspaces) ? m.workspaces[0] : m.workspaces
    return {
      id: ws?.id,
      name: ws?.name || 'Ismeretlen',
      role: m.role
    }
  }).filter(ws => ws.id) || []

return (
    <div className="flex-1 w-full min-h-screen bg-background flex flex-col">
      
      {/* EZ A RÉGI HEADER HELYETT LÉVŐ ÚJ KÓD: */}
      <TopNavbar 
        userEmail={user.email || ''}
        userName={user.user_metadata?.name}
        userAvatar={user.user_metadata?.avatar_url}
      />

      {/* KÖZÉPRE ZÁRT TARTALOM (Innentől marad a régi) */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          
          {workspaces.length === 0 ? (
            /* ÜRES ÁLLAPOT */
            <div className="text-center flex flex-col items-center py-6">
              <div className="w-16 h-16 bg-sona-neutral/10 rounded-2xl flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-sona-neutral" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Még nincs workspace-ed.</h1>
              <p className="text-sona-neutral mb-8">Hozz létre egyet, hogy elkezdhess dolgozni.</p>
              
              <CreateWorkspaceModal variant="empty" />
            </div>
          ) : (
            /* LISTA ÁLLAPOT */
            <>
              <h1 className="text-2xl font-bold text-foreground mb-6 text-center">
                Válassz egy workspace-t
              </h1>
              
              <div className="flex flex-col gap-3 mb-6 max-h-[50vh] overflow-y-auto pr-1">
                {workspaces.map(ws => (
                  <Link 
                    key={ws.id} 
                    href={`/${ws.id}/overview`}
                    className="flex items-center p-4 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-primary/5 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mr-4 shrink-0">
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-foreground truncate">{ws.name}</h2>
                      <div className="flex items-center gap-1.5 text-sm text-sona-neutral mt-0.5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>{ws.role === 'owner' ? 'Owner' : 'Member'}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="pt-4 border-t border-border flex justify-center">
                <CreateWorkspaceModal variant="default" />
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  )
}