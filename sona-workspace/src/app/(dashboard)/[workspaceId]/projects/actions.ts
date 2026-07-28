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

// ==========================================
//           DOKUMENTUMOK KEZELÉSE
// ==========================================

// Dokumentumok lekérdezése
export async function getDocuments(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false }) // A legutóbb módosított lesz legelöl
if (error) {
      // Így már a tényleges szöveget fogja kiírni, nem egy üres objektumot!
      console.error("Hiba a dokumentumok betöltésekor:", error.message || error)
      return { error: 'Hiba a dokumentumok betöltésekor.' }
    }
  return { documents: data }
}

// Új dokumentum létrehozása
export async function createDocument(projectId: string, title: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const { data, error } = await supabase
    .from('documents')
    .insert([{ project_id: projectId, user_id: user.id, title, content: '' }])
    .select()
    .single()

  if (error) {
    console.error("Hiba a dokumentum létrehozásakor:", error)
    return { error: 'Nem sikerült létrehozni a dokumentumot.' }
  }
  return { document: data }
}

// Dokumentum frissítése (cím vagy tartalom)
export async function updateDocument(documentId: string, updates: { title?: string; content?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const { error } = await supabase
    .from('documents')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', documentId)
    .eq('user_id', user.id)

  if (error) {
    console.error("Hiba a dokumentum mentésekor:", error)
    return { error: 'Hiba a mentéskor.' }
  }
  return { success: true }
}

// Dokumentum törlése
export async function deleteDocument(documentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)
    .eq('user_id', user.id)

  if (error) {
    console.error("Hiba a dokumentum törlésekor:", error)
    return { error: 'Nem sikerült törölni a dokumentumot.' }
  }
  return { success: true }
}

// FELADATOK LEKÉRDEZÉSE
export async function getTasks(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { tasks: [] }
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .order('position', { ascending: true }) // <-- Ez nagyon fontos, hogy jó sorrendben töltődjenek be a Drag&Drop miatt!

  if (error) {
    console.error("Hiba a feladatok betöltésekor:", error)
    return { tasks: [] }
  }

  return { tasks: data }
}

// ==========================================
//           KOMMENTEK KEZELÉSE
// ==========================================

export async function getComments(targetType: 'task' | 'document', targetId: string) {
  const supabase = await createClient()
  const column = targetType === 'task' ? 'task_id' : 'document_id'
  
  const { data, error } = await supabase
    .from('comments')
    .select('*, user:user_id(email)') // Lekérjük a kommentelő email címét is!
    .eq(column, targetId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error("Hiba a kommentek betöltésekor:", error)
    return { comments: [] }
  }
  return { comments: data }
}

export async function addComment(targetType: 'task' | 'document', targetId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const column = targetType === 'task' ? 'task_id' : 'document_id'

  const { data, error } = await supabase
    .from('comments')
    .insert([{ [column]: targetId, user_id: user.id, content }])
    .select('*, user:user_id(email)')
    .single()

  if (error) return { error: 'Hiba a kommenteléskor.' }
  return { comment: data }
}

export async function deleteComment(id: string) {
  const supabase = await createClient()
  await supabase.from('comments').delete().eq('id', id)
  return { success: true }
}

// ==========================================
//           FÁJLOK (CSATOLMÁNYOK) KEZELÉSE
// ==========================================

export async function getAttachments(targetType: 'task' | 'document', targetId: string) {
  const supabase = await createClient()
  const column = targetType === 'task' ? 'task_id' : 'document_id'
  
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .eq(column, targetId)
    .order('created_at', { ascending: false })

  if (error) return { attachments: [] }
  return { attachments: data }
}

export async function saveAttachmentMetadata(
  targetType: 'task' | 'document', 
  targetId: string, 
  fileName: string, 
  fileUrl: string, 
  fileSize: number
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const column = targetType === 'task' ? 'task_id' : 'document_id'

  const { data, error } = await supabase
    .from('attachments')
    .insert([{ [column]: targetId, user_id: user.id, file_name: fileName, file_url: fileUrl, file_size: fileSize }])
    .select()
    .single()

  if (error) return { error: 'Hiba a csatolmány mentésekor.' }
  return { attachment: data }
}

export async function deleteAttachment(id: string, fileName: string) {
  const supabase = await createClient()
  // 1. Töröljük a Supabase Storage-ból (a fájlt magát)
  await supabase.storage.from('project_files').remove([fileName])
  // 2. Töröljük az adatbázisból a hivatkozást
  await supabase.from('attachments').delete().eq('id', id)
  return { success: true }
}

export async function uploadAttachment(targetType: 'task' | 'document', targetId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const file = formData.get('file') as File
  if (!file) return { error: 'Nem található fájl.' }

  // Egyedi fájlnév generálása a tárhelyhez, hogy ne írják felül egymást az azonos nevű fájlok
  const fileExt = file.name.split('.').pop()
  const storageFileName = `${targetId}-${Math.random().toString(36).substring(2)}.${fileExt}`

  // 1. Feltöltés a Supabase Storage-ba
  const { error: uploadError } = await supabase.storage
    .from('project_files')
    .upload(storageFileName, file)

  if (uploadError) {
    console.error("Storage upload error:", uploadError)
    return { error: 'Nem sikerült feltölteni a fájlt a tárhelyre.' }
  }

  // 2. Publikus link lekérése
  const { data: publicUrlData } = supabase.storage
    .from('project_files')
    .getPublicUrl(storageFileName)

  // 3. Adatbázis bejegyzés létrehozása
  const column = targetType === 'task' ? 'task_id' : 'document_id'
  const { data, error: dbError } = await supabase
    .from('attachments')
    .insert([{ 
      [column]: targetId, 
      user_id: user.id, 
      file_name: file.name, // Az eredeti nevet mentjük el megjelenítésre
      file_url: publicUrlData.publicUrl, 
      file_size: file.size 
    }])
    .select()
    .single()

  if (dbError) return { error: 'Adatbázis hiba történt.' }
  return { attachment: data }
}

// ==========================================
//           ÖSSZESÍTETT FÁJLOK (FILES)
// ==========================================

export async function getProjectFiles(projectId: string) {
  const supabase = await createClient()
  
  // 1. Lekérjük a projekt összes feladatának és dokumentumának azonosítóját
  const [{ data: tasks }, { data: docs }] = await Promise.all([
    supabase.from('tasks').select('id').eq('project_id', projectId),
    supabase.from('documents').select('id').eq('project_id', projectId)
  ])

  const taskIds = tasks?.map(t => t.id) || []
  const docIds = docs?.map(d => d.id) || []

  if (taskIds.length === 0 && docIds.length === 0) return { files: [] }

  // 2. Összeállítjuk a szűrőt (vagy a feladatokhoz, vagy a doksikhoz tartozik)
  const orQuery = []
  if (taskIds.length > 0) orQuery.push(`task_id.in.(${taskIds.join(',')})`)
  if (docIds.length > 0) orQuery.push(`document_id.in.(${docIds.join(',')})`)

  // 3. Lekérjük a csatolmányokat
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .or(orQuery.join(','))
    .order('created_at', { ascending: false })

  if (error) console.error("Hiba a projekt fájlok lekérésekor:", error)
  return { files: data || [] }
}

export async function getWorkspaceFiles(workspaceId: string) {
  const supabase = await createClient()
  
  // 1. Lekérjük a munkatér összes projektjét
  const { data: projects } = await supabase.from('projects').select('id').eq('workspace_id', workspaceId)
  if (!projects || projects.length === 0) return { files: [] }
  
  const projectIds = projects.map(p => p.id)

  // 2. Lekérjük ezeknek a projekteknek a feladatait és doksijait
  const [{ data: tasks }, { data: docs }] = await Promise.all([
    supabase.from('tasks').select('id').in('project_id', projectIds),
    supabase.from('documents').select('id').in('project_id', projectIds)
  ])

  const taskIds = tasks?.map(t => t.id) || []
  const docIds = docs?.map(d => d.id) || []

  if (taskIds.length === 0 && docIds.length === 0) return { files: [] }

  const orQuery = []
  if (taskIds.length > 0) orQuery.push(`task_id.in.(${taskIds.join(',')})`)
  if (docIds.length > 0) orQuery.push(`document_id.in.(${docIds.join(',')})`)

  // 3. Lekérjük az összes csatolmányt a munkatérben
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .or(orQuery.join(','))
    .order('created_at', { ascending: false })

  if (error) console.error("Hiba a workspace fájlok lekérésekor:", error)
  return { files: data || [] }
}