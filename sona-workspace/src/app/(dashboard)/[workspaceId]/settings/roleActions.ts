'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Biztonsági ellenőrzés közvetlenül az akcióban (Bombabiztos védelem)
async function isWorkspaceOwner(workspaceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase.from('workspace_members').select('role').eq('workspace_id', workspaceId).eq('user_id', user.id).single()
  return data?.role === 'owner'
}

export async function saveRole(workspaceId: string, roleId: string | null, name: string, permissions: string[]) {
  try {
    if (!(await isWorkspaceOwner(workspaceId))) throw new Error('Nincs jogosultságod a szerepkörök módosításához!')
    const supabase = await createClient()
    let currentRoleId = roleId

    if (currentRoleId) {
      const { error: e1 } = await supabase.from('roles').update({ name }).eq('id', currentRoleId)
      if (e1) throw new Error(e1.message)
      const { error: e2 } = await supabase.from('role_permissions').delete().eq('role_id', currentRoleId)
      if (e2) throw new Error(e2.message)
    } else {
      const { data, error: e3 } = await supabase.from('roles').insert({ workspace_id: workspaceId, name }).select().single()
      if (e3) throw new Error(e3.message)
      currentRoleId = data.id
    }

    if (permissions.length > 0) {
      const perms = permissions.map(p => ({ role_id: currentRoleId, permission: p }))
      const { error: e4 } = await supabase.from('role_permissions').insert(perms)
      if (e4) throw new Error(e4.message)
    }
    revalidatePath(`/${workspaceId}/settings`)
    return { success: true }
  } catch (e: any) { return { error: e.message } }
}

export async function deleteRole(workspaceId: string, roleId: string) {
  try {
    if (!(await isWorkspaceOwner(workspaceId))) throw new Error('Nincs jogosultságod!')
    const supabase = await createClient()
    const { error: e1 } = await supabase.from('role_permissions').delete().eq('role_id', roleId)
    if (e1) throw new Error(e1.message)
    const { error: e2 } = await supabase.from('member_roles').delete().eq('role_id', roleId)
    if (e2) throw new Error(e2.message)
    const { error: e3 } = await supabase.from('roles').delete().eq('id', roleId)
    if (e3) throw new Error(e3.message)
    revalidatePath(`/${workspaceId}/settings`)
    return { success: true }
  } catch (e: any) { return { error: e.message } }
}

export async function updateMemberCustomRoles(workspaceId: string, dbMemberId: string, roleIds: string[]) {
  try {
    if (!(await isWorkspaceOwner(workspaceId))) throw new Error('Nincs jogosultságod!')
    const supabase = await createClient()
    
    // Törlés hibaellenőrzéssel
    const { error: e1 } = await supabase.from('member_roles').delete().eq('member_id', dbMemberId)
    if (e1) throw new Error(e1.message)
    
    // Beszúrás hibaellenőrzéssel
    if (roleIds.length > 0) {
      const inserts = roleIds.map(rId => ({ member_id: dbMemberId, role_id: rId }))
      const { error: e2 } = await supabase.from('member_roles').insert(inserts)
      if (e2) throw new Error(e2.message)
    }
    revalidatePath(`/${workspaceId}/settings`)
    return { success: true }
  } catch (e: any) { return { error: e.message } }
}

export async function updateMemberOverrides(workspaceId: string, dbMemberId: string, grantedPermissions: string[]) {
  try {
    if (!(await isWorkspaceOwner(workspaceId))) throw new Error('Nincs jogosultságod!')
    const supabase = await createClient()
    
    const { error: e1 } = await supabase.from('member_permission_overrides').delete().eq('member_id', dbMemberId)
    if (e1) throw new Error(e1.message)
    
    if (grantedPermissions.length > 0) {
      const inserts = grantedPermissions.map(perm => ({ member_id: dbMemberId, permission: perm, is_granted: true }))
      const { error: e2 } = await supabase.from('member_permission_overrides').insert(inserts)
      if (e2) throw new Error(e2.message)
    }
    revalidatePath(`/${workspaceId}/settings`)
    return { success: true }
  } catch (e: any) { return { error: e.message } }
}