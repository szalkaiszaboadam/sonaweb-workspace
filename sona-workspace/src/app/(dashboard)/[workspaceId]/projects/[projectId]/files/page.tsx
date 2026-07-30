import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProjectFiles } from '../../actions'
import { FilesView } from '@/components/ui/FilesView'

export default async function ProjectFilesPage({
  params
}: {
  params: Promise<{ workspaceId: string; projectId: string }>
}) {
  const resolvedParams = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { files } = await getProjectFiles(resolvedParams.projectId)

return (
  <div className="h-full">
    <FilesView files={files} title="Projekt Fájlok" />
  </div>
)
}