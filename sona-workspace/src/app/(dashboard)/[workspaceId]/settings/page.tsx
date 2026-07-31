import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RenameWorkspaceForm } from './components/RenameWorkspaceForm'
import { DeleteWorkspaceButton } from './components/DeleteWorkspaceButton'
import { Settings, AlertTriangle } from 'lucide-react'

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

  // Ha a felhasználó NEM tulajdonos (hanem pl. tag), AZONNAL kidobjuk!
  // Meg sem várjuk, hogy a return (...) rész betöltődjön.
  if (memberData?.role !== 'owner') {
    redirect(`/${workspaceId}`) 
  }
  // --- VÉDELEM VÉGE ---

  // Lekérjük a munkaterület jelenlegi nevét
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('name')
    .eq('id', workspaceId)
    .single()

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Beállítások
        </h1>
        <p className="text-sm text-sona-neutral mt-1">
          Kezeld a munkaterület alapvető adatait és preferenciáit.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* ÁLTALÁNOS BEÁLLÍTÁSOK */}
        <section className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-sona-neutral/5">
            <h2 className="text-base font-semibold text-foreground">Általános</h2>
          </div>
          <div className="p-6">
            <RenameWorkspaceForm 
              workspaceId={workspaceId} 
              initialName={workspace?.name || ''} 
            />
          </div>
        </section>

        {/* JÖVŐBELI SZEKCIÓK HELYE (pl. Számlázás, Címkék, stb.) */}
        <section className="bg-surface border border-border rounded-xl overflow-hidden opacity-60">
          <div className="px-6 py-4 border-b border-border bg-sona-neutral/5">
            <h2 className="text-base font-semibold text-foreground">Modulok (Hamarosan)</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-sona-neutral">
              Itt tudod majd be- és kikapcsolni a különböző funkciókat (pl. Időkövetés, Naptár) ehhez a munkaterülethez.
            </p>
          </div>
        </section>

        {/* VESZÉLYES ZÓNA */}
        <section className="border border-red-500/30 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-red-500/20 bg-red-500/5 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-semibold text-red-500">Veszélyes Zóna</h2>
          </div>
          <div className="p-6 bg-surface flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-medium text-foreground">Munkaterület törlése</h3>
              <p className="text-sm text-sona-neutral mt-1">
                A munkaterület és az összes benne lévő adat (projektek, feladatok) véglegesen törlődik.
              </p>
            </div>
            
            {/* Itt van az új, működő gomb! */}
            <DeleteWorkspaceButton 
  workspaceId={workspaceId} 
  workspaceName={workspace?.name || ''} 
/>
            
          </div>
        </section>

      </div>
    </div>
  )
}