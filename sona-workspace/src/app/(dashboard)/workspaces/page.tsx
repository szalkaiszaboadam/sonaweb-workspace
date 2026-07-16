import { Plus, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CreateWorkspaceModal } from './components/CreateWorkspaceModal'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function WorkspacesPage() {
  const supabase = await createClient()

  // 1. Biztosra megyünk: lekérjük a bejelentkezett usert
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // 2. BOMBABIZTOS LEKÉRDEZÉS: A tagságaidat keressük meg, és rácsatlakoztatjuk a workspace adatokat
  const { data: membersData, error: dbError } = await supabase
    .from('workspace_members')
    .select(`
      workspace_id,
      is_owner,
      workspaces (*)
    `)
    .eq('user_id', user?.id || '')

  // 3. Tisztítjuk az adatot a kártyákhoz
  const workspaces = membersData?.map(m => m.workspaces).filter(Boolean) || []

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 relative">
      

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Workspace-ek</h1>
          <p className="text-sona-neutral mt-1">Válaszd ki, melyik munkaterületen szeretnél dolgozni.</p>
        </div>
        
        <CreateWorkspaceModal />
      </div>

      {workspaces.length === 0 ? (
        <div className="bg-surface border border-dashed border-border rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-sona-neutral/10 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-sona-neutral" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Nincs még Workspace-ed</h3>
          <p className="text-sona-neutral mb-6 max-w-sm">
            Hozz létre egy új munkaterületet a projektek, feladatok és dokumentumok kezeléséhez.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {workspaces.map((workspace: any) => (
            <Link 
              key={workspace.id} 
              href={`/${workspace.id}/overview`} 
              className="group bg-surface border border-border rounded-xl p-5 hover:border-primary transition-colors hover:shadow-md cursor-pointer flex flex-col justify-between h-32"
            >
              <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors truncate">
                {workspace.name}
              </h3>
              <div className="flex justify-between items-center text-sm text-sona-neutral">
                <span>Belépés</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}