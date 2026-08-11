import { createClient } from '@/lib/supabase/server'
import { WorkspacePermission } from './permissions.constants'

// Továbbexportáljuk a konstansokat, hogy a korábbi szerveres importok ne törjenek el
export * from './permissions.constants'

export async function checkPermission(workspaceId: string, permission: WorkspacePermission) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: hasPermission } = await supabase.rpc('has_workspace_permission', {
    p_workspace_id: workspaceId,
    p_user_id: user.id,
    p_permission: permission
  })

  return !!hasPermission
}

export async function requirePermission(workspaceId: string, permission: WorkspacePermission) {
  const hasPerm = await checkPermission(workspaceId, permission)
  if (!hasPerm) throw new Error(`Nincs jogosultságod ehhez a művelethez! (${permission})`)
  return true
}