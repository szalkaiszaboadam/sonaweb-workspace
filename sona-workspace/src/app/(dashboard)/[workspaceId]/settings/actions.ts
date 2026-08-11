'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/permissions'


// ==========================================
// MUNKATERÜLET ÁLTALÁNOS AKCIÓI
// ==========================================

export async function updateWorkspaceName(workspaceId: string, newName: string) {
  try {
    // 1. Jogosultság ellenőrzése egyetlen sorban!
    await requirePermission(workspaceId, 'workspace:settings')
    
    const supabase = await createClient()
    const { error } = await supabase.from('workspaces').update({ name: newName.trim() }).eq('id', workspaceId)
    
    if (error) return { error: 'Hiba történt a mentés során.' }
    
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteWorkspace(workspaceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs bejelentkezve.' }

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (membership?.role !== 'owner') {
    return { error: 'Csak a tulajdonos törölheti a munkaterületet.' }
  }

  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', workspaceId)

  if (error) {
    console.error("Törlési hiba:", error)
    return { error: 'Nem sikerült törölni a munkaterületet.' }
  }

  redirect('/workspaces')
}

// ==========================================
// SEGÉDFÜGGVÉNYEK A CSAPATKEZELÉSHEZ
// ==========================================

async function verifyOwnerStatus(supabase: any, workspaceId: string, userId: string) {
  const { data } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single()
  return data?.role === 'owner'
}

async function getOwnerCount(supabase: any, workspaceId: string) {
  const { count } = await supabase
    .from('workspace_members')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('role', 'owner')
  return count || 0
}

// ==========================================
// CSAPAT ÉS JOGOSULTSÁG AKCIÓK
// ==========================================

export async function updateMemberRole(workspaceId: string, targetUserId: string, newRole: 'owner' | 'member') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs bejelentkezve!' }

  const isOwner = await verifyOwnerStatus(supabase, workspaceId, user.id)
  if (!isOwner) return { error: 'Nincs jogosultságod módosítani a tagokat!' }

  if (newRole === 'member') {
    const ownerCount = await getOwnerCount(supabase, workspaceId)
    if (ownerCount <= 1) {
      return { error: 'Nem minősítheted vissza az utolsó tulajdonost! Mindig lennie kell legalább egynek.' }
    }
  }

  const { error } = await supabase
    .from('workspace_members')
    .update({ role: newRole })
    .eq('workspace_id', workspaceId)
    .eq('user_id', targetUserId)

  if (error) return { error: error.message }
  
  // JAVÍTVA: A settings oldalt frissítjük!
  revalidatePath(`/${workspaceId}/settings`)
  return { success: true }
}

export async function removeMember(workspaceId: string, targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs bejelentkezve!' }

  const isOwner = await verifyOwnerStatus(supabase, workspaceId, user.id)
  if (!isOwner) return { error: 'Nincs jogosultságod eltávolítani a tagokat!' }

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

  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', targetUserId)

  if (error) return { error: error.message }
  
  // JAVÍTVA: A settings oldalt frissítjük!
  revalidatePath(`/${workspaceId}/settings`)
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
  
  // JAVÍTVA: A settings oldalt frissítjük!
  revalidatePath(`/${workspaceId}/settings`)
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
  
  // JAVÍTVA: A settings oldalt frissítjük!
  revalidatePath(`/${workspaceId}/settings`)
  return { success: true }
}

export async function toggleGroupMember(workspaceId: string, groupId: string, userId: string, isMember: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs bejelentkezve!' }

  const isOwner = await verifyOwnerStatus(supabase, workspaceId, user.id)
  if (!isOwner) return { error: 'Nincs jogosultságod módosítani a csoportot!' }

  if (isMember) {
    const { error } = await supabase.from('workspace_group_members').insert({ group_id: groupId, user_id: userId })
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('workspace_group_members').delete().eq('group_id', groupId).eq('user_id', userId)
    if (error) return { error: error.message }
  }
  
  // JAVÍTVA: A settings oldalt frissítjük!
  revalidatePath(`/${workspaceId}/settings`)
  return { success: true }
}