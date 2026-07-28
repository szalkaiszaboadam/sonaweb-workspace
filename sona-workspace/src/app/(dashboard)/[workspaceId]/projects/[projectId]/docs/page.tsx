// A generált fájl tartalma (src/app/(dashboard)/[workspaceId]/projects/[projectId]/docs/page.tsx)
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDocuments } from '../../actions'
import { DocumentManager } from '../../components/DocumentManager'

export default async function DocsPage({
  params
}: {
  params: Promise<{ workspaceId: string; projectId: string }>
}) {
  const resolvedParams = await params
  const { projectId } = resolvedParams
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const docsResult = await getDocuments(projectId)

  return (
    <div className="pt-4 h-full">
      <DocumentManager 
        initialDocuments={docsResult.documents || []} 
        projectId={projectId} 
      />
    </div>
  )
}