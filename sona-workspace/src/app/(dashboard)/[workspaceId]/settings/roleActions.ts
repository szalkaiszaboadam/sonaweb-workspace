'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/permissions'

export async function saveRole(workspaceId: string, roleId: string | null, name: string, permissions: string[]) {
  try {
    await requirePermission(workspaceId, 'roles:manage')
    const supabase = await createClient()

    let currentRoleId = roleId

    if (currentRoleId) {
      // Frissítés: Töröljük a régi jogokat
      await supabase.from('roles').update({ name }).eq('id', currentRoleId)
      await supabase.from('role_permissions').delete().eq('role_id', currentRoleId)
    } else {
      // Új létrehozása
      const { data, error } = await supabase.from('roles').insert({ workspace_id: workspaceId, name }).select().single()
      if (error) throw new Error('Nem sikerült létrehozni a szerepkört.')
      currentRoleId = data.id
    }

    // Új jogok beszúrása
    if (permissions.length > 0) {
      const permsToInsert = permissions.map(p => ({ role_id: currentRoleId, permission: p }))
      await supabase.from('role_permissions').insert(permsToInsert)
    }

    revalidatePath(`/${workspaceId}/settings`)
    return { success: true }
  } catch (e: any) { return { error: e.message } }
}

export async function deleteRole(workspaceId: string, roleId: string) {
  try {
    await requirePermission(workspaceId, 'roles:manage')
    const supabase = await createClient()
    
    // Töröljük a kapcsolatokat
    await supabase.from('role_permissions').delete().eq('role_id', roleId)
    await supabase.from('member_roles').delete().eq('role_id', roleId)
    
    // Töröljük magát a szerepkört
    const { error } = await supabase.from('roles').delete().eq('id', roleId)
    if (error) throw new Error('Hiba a törléskor.')
    
    revalidatePath(`/${workspaceId}/settings`)
    return { success: true }
  } catch (e: any) { return { error: e.message } }
}

export async function updateMemberCustomRoles(workspaceId: string, dbMemberId: string, roleIds: string[]) {
  try {
    await requirePermission(workspaceId, 'roles:manage')
    const supabase = await createClient()

    // 1. Töröljük az eddigi egyedi szerepköreit
    await supabase.from('member_roles').delete().eq('member_id', dbMemberId)

    // 2. Kiosztjuk az újakat
    if (roleIds.length > 0) {
      const inserts = roleIds.map(rId => ({ member_id: dbMemberId, role_id: rId }))
      await supabase.from('member_roles').insert(inserts)
    }

    revalidatePath(`/${workspaceId}/settings`)
    return { success: true }
  } catch (e: any) { return { error: e.message } }
}

export async function updateMemberOverrides(workspaceId: string, dbMemberId: string, grantedPermissions: string[]) {
  try {
    await requirePermission(workspaceId, 'roles:manage')
    const supabase = await createClient()

    // 1. Töröljük az eddigi egyéni felülbírálásokat
    await supabase.from('member_permission_overrides').delete().eq('member_id', dbMemberId)

    // 2. Kiosztjuk az újakat (csak a pozitív, "granted" jogokat tároljuk a V1-ben egyszerűségből)
    if (grantedPermissions.length > 0) {
      const inserts = grantedPermissions.map(perm => ({ 
        member_id: dbMemberId, 
        permission: perm, 
        is_granted: true 
      }))
      await supabase.from('member_permission_overrides').insert(inserts)
    }

    revalidatePath(`/${workspaceId}/settings`)
    return { success: true }
  } catch (e: any) { return { error: e.message } }
}