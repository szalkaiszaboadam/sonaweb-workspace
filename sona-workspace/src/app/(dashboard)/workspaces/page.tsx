import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CreateWorkspaceModal } from './components/CreateWorkspaceModal'
import { Building2, ChevronRight, CheckCircle2 } from 'lucide-react'
import { WorkspaceProfileCard } from './components/WorkspaceProfileCard'

export const dynamic = 'force-dynamic'

export default async function WorkspacesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

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
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 sm:p-8 font-sans selection:bg-primary/20">

      <main className="w-full max-w-[480px] flex flex-col animate-in fade-in zoom-in-95 duration-300">

        {/* 🚀 JAVÍTÁS: Kisebb, elegánsabb logó (h-6 sm:h-8) */}
        <div className="mb-8 flex items-center justify-center">
          <img 
            src="/sonaweb-workspace-logo-black.png" 
            alt="SONA Workspace" 
            className="h-6 sm:h-8 w-auto block [.dark_&]:hidden" 
          />
          <img 
            src="/sonaweb-workspace-logo-white.png" 
            alt="SONA Workspace" 
            className="h-6 sm:h-8 w-auto hidden [.dark_&]:block" 
          />
        </div>

        <div className="w-full bg-surface border border-border/60 rounded-[24px] shadow-xl overflow-hidden flex flex-col">

          <div className="flex flex-col p-6 pb-2">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight text-center mb-6">
              Munkaterületek
            </h1>
            
            <WorkspaceProfileCard user={user} />
          </div>

          {workspaces.length === 0 ? (
            <div className="flex flex-col items-center text-center px-6 pb-10 pt-4">
              <div className="w-14 h-14 bg-sona-neutral/10 rounded-[14px] flex items-center justify-center mb-5 border border-sona-neutral/20">
                <Building2 className="w-7 h-7 text-sona-neutral" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-1 tracking-tight">
                Még nincs munkaterületed
              </h2>
              <p className="text-[13.5px] text-sona-neutral mb-6 max-w-[260px] leading-relaxed">
                Hozz létre egyet a projektjeid és a csapatod kezeléséhez.
              </p>
              <CreateWorkspaceModal variant="empty" />
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/40 border-t border-border/40 bg-sona-neutral/5">
              {workspaces.map(ws => (
                <Link
                  key={ws.id}
                  href={`/${ws.id}/overview`}
                  className="group flex items-center justify-between p-4 hover:bg-sona-neutral/10 transition-colors outline-none focus-visible:bg-sona-neutral/10"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-[12px] bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0 border border-primary/10 group-hover:scale-105 transition-transform duration-300">
                      {ws.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex flex-col min-w-0 pr-4">
                      <span className="text-[16px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {ws.name}
                      </span>
                      <span className="text-[13px] font-medium text-sona-neutral mt-0.5 truncate flex items-center gap-1.5">
                          {ws.role === 'owner' ? (
                              <><CheckCircle2 className="w-3.5 h-3.5 text-orange-500" /> Tulajdonos</>
                          ) : (
                              'Tag'
                          )}
                      </span>
                    </div>
                  </div>

                  <div className="text-sona-neutral/40 group-hover:text-foreground transition-colors shrink-0">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </Link>
              ))}

              <CreateWorkspaceModal variant="row" />
            </div>
          )}
        </div>

      </main>
    </div>
  )
}