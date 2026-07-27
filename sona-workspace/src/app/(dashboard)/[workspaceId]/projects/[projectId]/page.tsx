import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ workspaceId: string; projectId: string }>
}

export default async function ProjectOverviewPage(props: Props) {
  const { workspaceId, projectId } = await props.params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('workspace_id', workspaceId)
    .single()

  if (!project) redirect(`/${workspaceId}/projects`)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Fő információs oszlop */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Projekt leírása</h2>
          <p className="text-sona-neutral whitespace-pre-wrap">
            {project.description || 'Ehhez a projekthez nem adtak meg leírást.'}
          </p>
        </div>
      </div>

      {/* Oldalsáv adatok */}
      <div className="space-y-6">
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Részletek</h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-sona-neutral mb-1">Ügyfél neve</p>
              <p className="font-medium text-foreground">{project.client_name || 'Nincs megadva'}</p>
            </div>
            <div>
              <p className="text-sona-neutral mb-1">Létrehozva</p>
              <p className="font-medium text-foreground">
                {new Date(project.created_at).toLocaleDateString('hu-HU')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}