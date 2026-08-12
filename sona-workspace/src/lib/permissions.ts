import { createClient } from '@/lib/supabase/server'
import { WorkspacePermission } from './permissions.constants'

export * from './permissions.constants'

export async function checkPermission(workspaceId: string, permission: WorkspacePermission) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  // 1. TAG LEKÉRÉSE
  const { data: member } = await supabase
    .from('workspace_members')
    .select('id, role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (!member) return false

  // 1. RÉTEG: OWNER (Isteni mód) - Mindent szabad!
  if (member.role === 'owner') return true

  // 2. RÉTEG: EGYÉNI FELÜLBÍRÁLÁS (Overrides)
  const { data: override } = await supabase
    .from('member_permission_overrides')
    .select('is_granted')
    .eq('member_id', member.id)
    .eq('permission', permission)
    .single()

  if (override && override.is_granted) return true

  // 3. RÉTEG: SZEREPKÖRÖK (Roles)
  const { data: rolePerms } = await supabase
    .from('member_roles')
    .select('roles!inner(role_permissions(permission))')
    .eq('member_id', member.id)

  // Megnézzük, hogy a tag bármelyik kiosztott szerepköre tartalmazza-e ezt a jogot
  const hasRolePerm = rolePerms?.some((mr: any) =>
    mr.roles.role_permissions.some((rp: any) => rp.permission === permission)
  )

  return !!hasRolePerm
}

export async function requirePermission(workspaceId: string, permission: WorkspacePermission) {
  const hasPerm = await checkPermission(workspaceId, permission)
  if (!hasPerm) throw new Error(`Nincs jogosultságod ehhez a művelethez! (${permission})`)
  return true
}