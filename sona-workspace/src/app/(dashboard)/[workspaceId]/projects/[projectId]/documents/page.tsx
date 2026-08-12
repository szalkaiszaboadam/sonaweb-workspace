import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDocuments } from '../../actions'
import { DocumentManager } from '../../components/DocumentManager'
import { checkPermission } from '@/lib/permissions' // <-- ÚJ

export default async function DocsPage({
  params }: {
  params: Promise<{ workspaceId: string; projectId: string }>
}) {
  const resolvedParams = await params
  const { workspaceId, projectId } = resolvedParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  const docsResult = await getDocuments(projectId)

  // 🚀 JOGOK KISZÁMOLÁSA A SZERVEREN
  const hasEditOthers = await checkPermission(workspaceId, 'document:edit_others')
  const hasDeleteOthers = await checkPermission(workspaceId, 'document:delete')

  return (
    <div className="h-full">
      <DocumentManager 
        initialDocuments={docsResult.documents || []} 
        projectId={projectId} 
        currentUserId={user.id}
        hasEditOthersPerm={hasEditOthers}
        hasDeleteOthersPerm={hasDeleteOthers}
      />
    </div>
  )
}