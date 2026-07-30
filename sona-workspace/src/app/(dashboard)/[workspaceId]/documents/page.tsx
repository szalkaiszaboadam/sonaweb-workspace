import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileText } from 'lucide-react'
import { WorkspaceDocumentsView } from './components/WorkspaceDocumentsView'

export default async function WorkspaceDocumentsPage({
  params
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Zseniális SQL JOIN: Lekérjük az összes dokumentumot, DE csak azokat, 
  // amik ehhez a munkaterülethez tartozó projektekben vannak!
  // Ráadásul rögtön csatoljuk is hozzájuk a projekt azonosítóját és nevét.
  const { data: documents } = await supabase
    .from('documents')
    .select(`
      *,
      projects!inner ( id, name, workspace_id )
    `)
    .eq('projects.workspace_id', workspaceId)
    .order('updated_at', { ascending: false })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col h-full animate-in fade-in duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
            <FileText className="w-7 h-7" />
          </div>
          Tudásbázis
        </h1>
        <p className="text-sm text-sona-neutral mt-2">
          Keresés a munkaterület összes projektjének dokumentumai és jegyzetei között.
        </p>
      </div>

      <div className="flex-1">
        <WorkspaceDocumentsView 
          documents={documents || []} 
          workspaceId={workspaceId} 
        />
      </div>

    </div>
  )
}