import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { SettingsForm } from '../../components/SettingsForm'

export default async function ProjectSettingsPage({
  params 
}: {
  params: Promise<{ workspaceId: string; projectId: string }>
}) {
  const { workspaceId, projectId } = await params
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error || !project) {
    notFound()
  }

  return (
    // INNEN KIVETTÜK A PADDINGOT!
    <div className="max-w-3xl animate-in fade-in duration-500">
      
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">A projekt beállításai</h2>
        <p className="text-sona-neutral mt-1 text-sm">
          Itt módosíthatod a projekt alapadatait, státuszát, vagy törölheted a teljes projektet.
        </p>
      </div>

      <SettingsForm project={project} workspaceId={workspaceId} />
      
    </div>
  )
}