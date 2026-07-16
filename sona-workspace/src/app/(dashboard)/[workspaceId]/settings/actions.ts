'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateWorkspaceName(workspaceId: string, newName: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs bejelentkezve.' }

  // Jogosultság ellenőrzése (csak Tulajdonos módosíthatja)
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('is_owner')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (!membership?.is_owner) {
    return { error: 'Csak a munkaterület tulajdonosa módosíthatja a beállításokat.' }
  }

  if (!newName.trim()) {
    return { error: 'A név nem lehet üres.' }
  }

  // Név frissítése az adatbázisban
  const { error } = await supabase
    .from('workspaces')
    .update({ name: newName.trim() })
    .eq('id', workspaceId)

  if (error) {
    return { error: 'Hiba történt a mentés során.' }
  }

  // Frissítjük a gyorsítótárat, hogy a Sidebarban és a fejlécben is azonnal átíródjon!
  revalidatePath('/', 'layout') 
  return { success: true }
}

export async function deleteWorkspace(workspaceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs bejelentkezve.' }

  // Ellenőrizzük, hogy tényleg ő-e a tulajdonos
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('is_owner')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (!membership?.is_owner) {
    return { error: 'Csak a tulajdonos törölheti a munkaterületet.' }
  }

  // Törlés végrehajtása
  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', workspaceId)

  if (error) {
    console.error("Törlési hiba:", error)
    return { error: 'Nem sikerült törölni a munkaterületet.' }
  }

  // Ha sikeres a törlés, kidobjuk a felhasználót a főoldalra
  redirect('/workspaces')
}