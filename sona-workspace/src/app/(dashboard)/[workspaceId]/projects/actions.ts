'use server'

import { createClient } from '@/lib/supabase/server'

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nincs jogosultságod.' }
  }

  // Adatok kinyerése
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const client_name = formData.get('client_name') as string
  
  // A rejtett mezőből kapjuk meg a workspace azonosítóját
  const workspace_id = formData.get('workspace_id') as string 

  if (!name || name.trim() === '') {
    return { error: 'A projekt nevének megadása kötelező.' }
  }

  // Beszúrás az adatbázisba
  const { error } = await supabase.from('projects').insert({
    name,
    description,
    client_name,
    workspace_id,
    user_id: user.id
  })

  if (error) {
    console.error("Hiba a projekt létrehozásakor:", error.message)
    return { error: 'Hiba történt a létrehozás során.' }
  }

  return { success: true }
}

// PROJEKT FRISSÍTÉSE
export async function updateProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Nincs jogosultságod.' }

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const client_name = formData.get('client_name') as string

  if (!name || name.trim() === '') {
    return { error: 'A projekt nevének megadása kötelező.' }
  }

  const { error } = await supabase
    .from('projects')
    .update({ name, description, client_name })
    .eq('id', id)
    .eq('user_id', user.id) // Biztonság: csak a sajátját módosíthatja!

  if (error) {
    console.error("Hiba a frissítéskor:", error.message)
    return { error: 'Hiba történt a módosítás során.' }
  }

  return { success: true }
}

// PROJEKT TÖRLÉSE
export async function deleteProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Nincs jogosultságod.' }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) {
    console.error("Hiba a törléskor:", error.message)
    return { error: 'Hiba történt a törlés során.' }
  }

  return { success: true }
}