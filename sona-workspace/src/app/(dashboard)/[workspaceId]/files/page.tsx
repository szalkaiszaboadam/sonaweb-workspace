import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getWorkspaceFiles } from '../projects/actions'
import { FilesView } from '@/components/ui/FilesView'

export default async function WorkspaceFilesPage({
  params
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const resolvedParams = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { files } = await getWorkspaceFiles(resolvedParams.workspaceId)

  return (
    <div className="h-full flex flex-col pt-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Munkatér Fájljai</h1>
      <div className="flex-1 min-h-0">
        <FilesView files={files} title="Összes feltöltött fájl" />
      </div>
    </div>
  )
}