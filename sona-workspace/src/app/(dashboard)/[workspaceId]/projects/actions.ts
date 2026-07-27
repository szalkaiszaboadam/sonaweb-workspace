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

// PROJEKT STÁTUSZ FRISSÍTÉSE
export async function updateProjectStatus(projectId: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Nincs jogosultságod.' }

  const { error } = await supabase
    .from('projects')
    .update({ status })
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) {
    console.error("Hiba a státusz frissítésekor:", error.message)
    return { error: 'Hiba történt a módosítás során.' }
  }

  return { success: true }
}

// --- FELADATOK (TASKS) ACTIONS ---

// 1. Gyors feladat létrehozása (Trello stílus: csak cím és státusz)
export async function createTask(
  workspaceId: string, 
  projectId: string, 
  title: string, 
  status: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }
  if (!title || title.trim() === '') return { error: 'A feladat neve kötelező.' }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      workspace_id: workspaceId,
      project_id: projectId,
      title: title.trim(),
      status: status,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    console.error("Hiba a feladat létrehozásakor:", error.message)
    return { error: 'Nem sikerült létrehozni a feladatot.' }
  }

  return { success: true, task: data }
}

// 2. Feladat státuszának (oszlopának) frissítése
export async function updateTaskStatus(taskId: string, newStatus: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const { error } = await supabase
    .from('tasks')
    .update({ status: newStatus })
    .eq('id', taskId)
    .eq('user_id', user.id)

  if (error) return { error: 'Nem sikerült frissíteni a feladatot.' }
  return { success: true }
}

// 3. Feladat részleteinek frissítése (határidő, becsült idő, leírás)
export async function updateTaskDetails(taskId: string, updates: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .eq('user_id', user.id)

  if (error) return { error: 'Nem sikerült menteni a részleteket.' }
  return { success: true }
}

// FELADATOK SORRENDJÉNEK ÉS STÁTUSZÁNAK TÖMEGES FRISSÍTÉSE
export async function updateTaskOrders(updates: { id: string; status: string; position: number }[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  // Mivel több kártyát frissítünk egyszerre, Promise.all-t használunk a gyorsaságért
  const promises = updates.map(update =>
    supabase
      .from('tasks')
      .update({ status: update.status, position: update.position })
      .eq('id', update.id)
      .eq('user_id', user.id)
  )

  try {
    await Promise.all(promises)
    return { success: true }
  } catch (error) {
    console.error("Hiba a sorrend mentésekor:", error)
    return { error: 'Nem sikerült menteni a sorrendet.' }
  }
}

// FELADAT TÖRLÉSE
export async function deleteTask(taskId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', user.id)

  if (error) {
    console.error("Hiba a feladat törlésekor:", error.message)
    return { error: 'Nem sikerült törölni a feladatot.' }
  }

  return { success: true }
}