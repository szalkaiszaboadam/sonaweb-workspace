'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Segédfüggvény: Ellenőrzi, hogy a műveletet végző felhasználó TULAJDONOS-e
async function verifyOwnerStatus(supabase: any, workspaceId: string, userId: string) {
  const { data } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single()
  return data?.role === 'owner'
}

// Segédfüggvény: Megszámolja, hány tulajdonos van még
async function getOwnerCount(supabase: any, workspaceId: string) {
  const { count } = await supabase
    .from('workspace_members')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('role', 'owner')
  return count || 0
}

// 1. Szerepkör megváltoztatása (Promote / Demote)
export async function updateMemberRole(workspaceId: string, targetUserId: string, newRole: 'owner' | 'member') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Nincs bejelentkezve!' }

  // 1. Ellenőrizzük, hogy aki kéri, az tényleg tulajdonos-e?
  const isOwner = await verifyOwnerStatus(supabase, workspaceId, user.id)
  if (!isOwner) return { error: 'Nincs jogosultságod módosítani a tagokat!' }

  // 2. Ha épp egy tulajdonost akarunk visszaminősíteni (akár magunkat, akár mást)
  if (newRole === 'member') {
    const ownerCount = await getOwnerCount(supabase, workspaceId)
    if (ownerCount <= 1) {
      return { error: 'Nem minősítheted vissza az utolsó tulajdonost! Mindig lennie kell legalább egynek.' }
    }
  }

  // 3. Végrehajtás
  const { error } = await supabase
    .from('workspace_members')
    .update({ role: newRole })
    .eq('workspace_id', workspaceId)
    .eq('user_id', targetUserId)

  if (error) return { error: error.message }
  
  revalidatePath(`/${workspaceId}/team`)
  return { success: true }
}

// 2. Tag eltávolítása (Kick)
export async function removeMember(workspaceId: string, targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Nincs bejelentkezve!' }

  // 1. Jogosultság ellenőrzés
  const isOwner = await verifyOwnerStatus(supabase, workspaceId, user.id)
  if (!isOwner) return { error: 'Nincs jogosultságod eltávolítani a tagokat!' }

  // 2. Ellenőrizzük, hogy akit ki akarunk dobni, az tulajdonos-e, és ő-e az utolsó?
  const { data: targetMember } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', targetUserId)
    .single()

  if (targetMember?.role === 'owner') {
    const ownerCount = await getOwnerCount(supabase, workspaceId)
    if (ownerCount <= 1) {
      return { error: 'Nem távolíthatod el az utolsó tulajdonost a munkaterületről!' }
    }
  }

  // 3. Végrehajtás
  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', targetUserId)

  if (error) return { error: error.message }
  
  revalidatePath(`/${workspaceId}/team`)
  return { success: true }
}

// ==========================================
// CSOPORTOK KEZELÉSE
// ==========================================

export async function createGroup(workspaceId: string, name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs bejelentkezve!' }

  const isOwner = await verifyOwnerStatus(supabase, workspaceId, user.id)
  if (!isOwner) return { error: 'Csak tulajdonosok hozhatnak létre csoportot!' }
  if (!name.trim()) return { error: 'A csoport neve nem lehet üres!' }

  const { error } = await supabase
    .from('workspace_groups')
    .insert({ workspace_id: workspaceId, name: name.trim() })

  if (error) return { error: error.message }
  
  revalidatePath(`/${workspaceId}/team`)
  return { success: true }
}

export async function deleteGroup(workspaceId: string, groupId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs bejelentkezve!' }

  const isOwner = await verifyOwnerStatus(supabase, workspaceId, user.id)
  if (!isOwner) return { error: 'Csak tulajdonosok törölhetnek csoportot!' }

  const { error } = await supabase
    .from('workspace_groups')
    .delete()
    .eq('id', groupId)
    .eq('workspace_id', workspaceId)

  if (error) return { error: error.message }
  
  revalidatePath(`/${workspaceId}/team`)
  return { success: true }
}

export async function toggleGroupMember(workspaceId: string, groupId: string, userId: string, isMember: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs bejelentkezve!' }

  const isOwner = await verifyOwnerStatus(supabase, workspaceId, user.id)
  if (!isOwner) return { error: 'Nincs jogosultságod módosítani a csoportot!' }

  if (isMember) {
    // Ha bepipálták, hozzáadjuk a kapcsolótáblához
    const { error } = await supabase.from('workspace_group_members').insert({ group_id: groupId, user_id: userId })
    if (error) return { error: error.message }
  } else {
    // Ha kivették a pipát, töröljük a kapcsolótáblából
    const { error } = await supabase.from('workspace_group_members').delete().eq('group_id', groupId).eq('user_id', userId)
    if (error) return { error: error.message }
  }
  
  revalidatePath(`/${workspaceId}/team`)
  return { success: true }
}