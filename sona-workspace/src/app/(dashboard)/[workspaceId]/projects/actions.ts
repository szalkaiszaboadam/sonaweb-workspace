'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkPermission, requirePermission } from '@/lib/permissions'

// ==========================================
// KÖZPONTI JOGOSULTSÁG ELLENŐRZŐ (Projekt szint)
// ==========================================
async function verifyProjectManager(supabase: any, workspaceId: string, projectId: string, userId: string) {
  const { data: project } = await supabase.from('projects').select('user_id').eq('id', projectId).single()
  if (project?.user_id === userId) return true // A projekt létrehozója
  
  const { data: member } = await supabase.from('workspace_members').select('role').eq('workspace_id', workspaceId).eq('user_id', userId).single()
  if (member?.role === 'owner') return true // Munkaterület tulajdonos
  
  // Ha nem owner és nem létrehozó, megnézzük a központi RBAC rendszert!
  const hasPerm = await checkPermission(workspaceId, 'project:manage_all')
  return hasPerm
}

// ==========================================
// PROJEKTEK KEZELÉSE
// ==========================================
export async function createProject(formData: FormData) {
  const workspace_id = formData.get('workspace_id') as string
  try { await requirePermission(workspace_id, 'project:create') } 
  catch (e: any) { return { error: e.message } }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const is_private = formData.get('is_private') === 'true'
  const emoji = formData.get('emoji') as string || '📁'
  const color = formData.get('color') as string || 'primary'
  const memberIds = JSON.parse((formData.get('member_ids') as string) || '[]')

  if (!name || name.trim() === '') return { error: 'A projekt nevének megadása kötelező.' }

  const { data: project, error } = await supabase.from('projects').insert({
    name, description, workspace_id, user_id: user.id, is_private, emoji, color, status: 'planning'
  }).select().single()

  if (error || !project) return { error: 'Hiba történt a létrehozás során.' }

if (is_private && memberIds.length > 0) {
    const membersToInsert = memberIds.map((id: string) => ({ project_id: project.id, user_id: id }))
    await supabase.from('project_members').insert(membersToInsert)
    // TÖRÖLVE: groupsToInsert
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const id = formData.get('id') as string
  const workspace_id = formData.get('workspace_id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const is_private = formData.get('is_private') === 'true'
  const status = formData.get('status') as string
  const emoji = formData.get('emoji') as string || '📁'
  const color = formData.get('color') as string || 'primary'

  if (!name || name.trim() === '') return { error: 'A projekt nevének megadása kötelező.' }

  const isManager = await verifyProjectManager(supabase, workspace_id, id, user.id)
  if (!isManager) return { error: 'Nincs jogosultságod módosítani ezt a projektet!' }

  const { error } = await supabase.from('projects').update({ name, description, is_private, status, emoji, color }).eq('id', id)
  if (error) return { error: 'Hiba történt a módosítás során.' }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateProjectStatus(projectId: string, workspaceId: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const isManager = await verifyProjectManager(supabase, workspaceId, projectId, user.id)
  if (!isManager) return { error: 'Csak a projektvezetők állíthatnak státuszt!' }

  const { error } = await supabase.from('projects').update({ status }).eq('id', projectId)
  if (error) return { error: 'Hiba történt a módosítás során.' }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteProject(projectId: string, workspaceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const isManager = await verifyProjectManager(supabase, workspaceId, projectId, user.id)
  if (!isManager) return { error: 'Nincs jogosultságod törölni ezt a projektet!' }

  const [{ data: tasks }, { data: docs }] = await Promise.all([
    supabase.from('tasks').select('id').eq('project_id', projectId),
    supabase.from('documents').select('id').eq('project_id', projectId)
  ])

  const taskIds = tasks?.map(t => t.id) || []
  const docIds = docs?.map(d => d.id) || []
  const orQuery = []
  if (taskIds.length > 0) orQuery.push(`task_id.in.(${taskIds.join(',')})`)
  if (docIds.length > 0) orQuery.push(`document_id.in.(${docIds.join(',')})`)

  if (orQuery.length > 0) {
    const { data: attachments } = await supabase.from('attachments').select('file_url').or(orQuery.join(','))
    if (attachments && attachments.length > 0) {
      const filesToRemove = attachments.map(a => a.file_url.split('/').pop() as string)
      await supabase.storage.from('project_files').remove(filesToRemove)
    }
  }

  const { error } = await supabase.from('projects').delete().eq('id', projectId)
  if (error) return { error: 'Hiba történt a törlés során.' }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function toggleProjectMember(projectId: string, workspaceId: string, targetUserId: string, isMember: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs bejelentkezve.' }

  const isManager = await verifyProjectManager(supabase, workspaceId, projectId, user.id)
  if (!isManager) return { error: 'Nincs jogosultságod tagokat kezelni!' }

  if (isMember) {
    const { error } = await supabase.from('project_members').insert({ project_id: projectId, user_id: targetUserId })
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('project_members').delete().eq('project_id', projectId).eq('user_id', targetUserId)
    if (error) return { error: error.message }
  }
  return { success: true }
}



// ==========================================
// FELADATOK (TASKS)
// ==========================================
export async function getTasks(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { tasks: [] }

  const { data, error } = await supabase.from('tasks').select('*').eq('project_id', projectId).order('position', { ascending: true })
  if (error) return { tasks: [] }
  return { tasks: data }
}

export async function createTask(workspaceId: string, projectId: string, title: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }
  if (!title || title.trim() === '') return { error: 'A feladat neve kötelező.' }

  const { data, error } = await supabase.from('tasks').insert({
    workspace_id: workspaceId, project_id: projectId, title: title.trim(), status: status, user_id: user.id
  }).select().single()

  if (error) return { error: 'Nem sikerült létrehozni a feladatot.' }
  return { success: true, task: data }
}

export async function updateTaskStatus(taskId: string, newStatus: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
  if (error) return { error: 'Nem sikerült frissíteni a feladatot.' }
  return { success: true }
}

export async function updateTaskDetails(taskId: string, updates: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const { error } = await supabase.from('tasks').update(updates).eq('id', taskId)
  if (error) return { error: 'Nem sikerült menteni a részleteket.' }
  return { success: true }
}

export async function updateTaskOrders(updates: { id: string; status: string; position: number }[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const promises = updates.map(update => supabase.from('tasks').update({ status: update.status, position: update.position }).eq('id', update.id))
  try {
    await Promise.all(promises)
    return { success: true }
  } catch (error) {
    return { error: 'Nem sikerült menteni a sorrendet.' }
  }
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const { data: task } = await supabase.from('tasks').select('user_id, workspace_id').eq('id', taskId).single()
  if (!task) return { error: 'Feladat nem található.' }

  if (task.user_id !== user.id) {
    const hasPerm = await checkPermission(task.workspace_id, 'task:manage_all')
    if (!hasPerm) return { error: 'Nincs jogosultságod mások feladatát törölni.' }
  }

  const { data: attachments } = await supabase.from('attachments').select('file_url').eq('task_id', taskId)
  if (attachments && attachments.length > 0) {
    const filesToRemove = attachments.map(a => a.file_url.split('/').pop() as string)
    await supabase.storage.from('project_files').remove(filesToRemove)
  }

  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) return { error: 'Nem sikerült törölni a feladatot.' }
  return { success: true }
}

// ==========================================
// DOKUMENTUMOK
// ==========================================
export async function getDocuments(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('documents').select('*').eq('project_id', projectId).order('updated_at', { ascending: false })
  if (error) return { error: 'Hiba a dokumentumok betöltésekor.' }
  return { documents: data }
}

export async function createDocument(projectId: string, title: string, folderName: string = 'Általános') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const { data, error } = await supabase.from('documents')
    .insert([{ project_id: projectId, user_id: user.id, title, content: '', folder_name: folderName }])
    .select().single()

  if (error) return { error: 'Nem sikerült létrehozni a dokumentumot.' }
  return { document: data }
}

export async function updateDocument(documentId: string, updates: { title?: string; content?: string; folder_name?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const { error } = await supabase.from('documents').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', documentId)
  if (error) return { error: 'Hiba a mentéskor.' }
  return { success: true }
}

export async function deleteDocument(documentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const { data: doc } = await supabase.from('documents').select('user_id, projects(workspace_id)').eq('id', documentId).single()
  if (!doc) return { error: 'Dokumentum nem található.' }

  if (doc.user_id !== user.id) {
    // @ts-ignore
    const wsId = doc.projects?.workspace_id
    if (wsId) {
      const hasPerm = await checkPermission(wsId, 'document:manage_all')
      if (!hasPerm) return { error: 'Nincs jogosultságod mások dokumentumát törölni.' }
    }
  }

  const { data: attachments } = await supabase.from('attachments').select('file_url').eq('document_id', documentId)
  if (attachments && attachments.length > 0) {
    const filesToRemove = attachments.map(a => a.file_url.split('/').pop() as string)
    await supabase.storage.from('project_files').remove(filesToRemove)
  }

  const { error } = await supabase.from('documents').delete().eq('id', documentId)
  if (error) return { error: 'Nem sikerült törölni a dokumentumot.' }
  return { success: true }
}

export async function updateDocumentOrders(updates: { id: string; folder_name: string; position: number }[]) {
  const supabase = await createClient()
  const promises = updates.map(update => supabase.from('documents').update({ folder_name: update.folder_name, position: update.position }).eq('id', update.id))
  try {
    await Promise.all(promises)
    return { success: true }
  } catch (error) {
    return { error: 'Nem sikerült menteni a sorrendet.' }
  }
}

// ==========================================
// KOMMENTEK
// ==========================================
export async function getComments(targetType: 'task' | 'document', targetId: string) {
  const supabase = await createClient()
  const column = targetType === 'task' ? 'task_id' : 'document_id'

  const { data, error } = await supabase.from('comments').select('*').eq(column, targetId).order('created_at', { ascending: true })
  if (error) return { comments: [] }

  const { data: { user } } = await supabase.auth.getUser()

  let wsId = null;
  if (targetType === 'task') {
      const { data: tData } = await supabase.from('tasks').select('workspace_id').eq('id', targetId).single()
      wsId = tData?.workspace_id
  } else {
      const { data: dData } = await supabase.from('documents').select('projects(workspace_id)').eq('id', targetId).single()
      // @ts-ignore
      wsId = dData?.projects?.workspace_id
  }

  let members: any[] = []
  if (wsId) {
      const { data: mData } = await supabase.rpc('get_workspace_users', { ws_id: wsId })
      members = mData || []
  }

  const formattedComments = data.map(c => {
    const member = members.find(m => m.user_id === c.user_id)
    return {
      ...c,
      user: {
        email: member?.email || (user && c.user_id === user.id ? user.email : `Kolléga`),
        name: member?.name || member?.email?.split('@')[0],
        avatar_url: member?.avatar_url
      }
    }
  })

  return { comments: formattedComments }
}

export async function addComment(targetType: 'task' | 'document', targetId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const column = targetType === 'task' ? 'task_id' : 'document_id'
  const { data, error } = await supabase.from('comments').insert([{ [column]: targetId, user_id: user.id, content }]).select().single()
  if (error) return { error: 'Hiba a kommenteléskor.' }

  const commentWithUser = {
    ...data,
    user: { 
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url
    }
  }

  return { comment: commentWithUser }
}

export async function deleteComment(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod' }
  // A biztonság kedvéért itt rákötjük a user_id-t is, így csak a sajátját törölheti
  await supabase.from('comments').delete().eq('id', id).eq('user_id', user.id)
  return { success: true }
}

// ==========================================
// FÁJLOK ÉS CSATOLMÁNYOK
// ==========================================
export async function getAttachments(targetType: 'task' | 'document', targetId: string) {
  const supabase = await createClient()
  const column = targetType === 'task' ? 'task_id' : 'document_id'
  const { data, error } = await supabase.from('attachments').select('*').eq(column, targetId).order('created_at', { ascending: false })
  if (error) return { attachments: [] }
  return { attachments: data }
}

export async function uploadAttachment(targetType: 'task' | 'document', targetId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const file = formData.get('file') as File
  if (!file) return { error: 'Nem található fájl.' }

  const fileExt = file.name.split('.').pop()
  const storageFileName = `${targetId}-${Math.random().toString(36).substring(2)}.${fileExt}`

  const { error: uploadError } = await supabase.storage.from('project_files').upload(storageFileName, file)
  if (uploadError) return { error: 'Nem sikerült feltölteni a fájlt.' }

  const { data: publicUrlData } = supabase.storage.from('project_files').getPublicUrl(storageFileName)

  const column = targetType === 'task' ? 'task_id' : 'document_id'
  const { data, error: dbError } = await supabase.from('attachments').insert([{ 
    [column]: targetId, user_id: user.id, file_name: file.name, file_url: publicUrlData.publicUrl, file_size: file.size 
  }]).select().single()

  if (dbError) return { error: 'Adatbázis hiba történt.' }
  return { attachment: data }
}

export async function deleteAttachment(id: string, fileName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod' }

  await supabase.storage.from('project_files').remove([fileName])
  await supabase.from('attachments').delete().eq('id', id)
  return { success: true }
}

export async function getProjectFiles(projectId: string) {
  const supabase = await createClient()
  const [{ data: tasks }, { data: docs }] = await Promise.all([
    supabase.from('tasks').select('id').eq('project_id', projectId),
    supabase.from('documents').select('id').eq('project_id', projectId)
  ])
  const taskIds = tasks?.map(t => t.id) || []
  const docIds = docs?.map(d => d.id) || []
  if (taskIds.length === 0 && docIds.length === 0) return { files: [] }

  const orQuery = []
  if (taskIds.length > 0) orQuery.push(`task_id.in.(${taskIds.join(',')})`)
  if (docIds.length > 0) orQuery.push(`document_id.in.(${docIds.join(',')})`)

  const { data } = await supabase.from('attachments').select('*').or(orQuery.join(',')).order('created_at', { ascending: false })
  return { files: data || [] }
}

export async function getWorkspaceFiles(workspaceId: string) {
  const supabase = await createClient()
  const { data: projects } = await supabase.from('projects').select('id').eq('workspace_id', workspaceId)
  if (!projects || projects.length === 0) return { files: [] }
  const projectIds = projects.map(p => p.id)

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

  const { data } = await supabase.from('attachments').select('*').or(orQuery.join(',')).order('created_at', { ascending: false })
  return { files: data || [] }
}

export async function getWorkspaceMembers(workspaceId: string) {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { data: members } = await supabase.rpc('get_workspace_users', { ws_id: workspaceId })
  if (!members) return { members: [] }

  const formattedMembers = members.map((m: any) => ({
    user_id: m.user_id,
    email: currentUser && m.user_id === currentUser.id ? `${m.email} (Te)` : m.email,
  }))
  return { members: formattedMembers }
}

// ==========================================
// IDŐKÖVETÉS
// ==========================================
export async function addTimeEntry(workspaceId: string, projectId: string | null, description: string, date: string, durationMinutes: number, taskId: string | null = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }
  if (durationMinutes <= 0) return { error: 'Az időtartamnak nagyobbnak kell lennie 0-nál.' }

  const { error } = await supabase.from('time_entries').insert([{
    workspace_id: workspaceId, project_id: projectId || null, user_id: user.id,
    description: description.trim() || 'Névtelen munka', date, duration_minutes: durationMinutes, task_id: taskId || null
  }])

  if (error) return { error: 'Nem sikerült elmenteni az időt.' }
  return { success: true }
}

export async function updateTimeEntry(entryId: string, updates: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const { data: entry } = await supabase.from('time_entries').select('user_id, workspace_id').eq('id', entryId).single()
  if (!entry) return { error: 'Bejegyzés nem található.' }

  if (entry.user_id !== user.id) {
    const hasPerm = await checkPermission(entry.workspace_id, 'time:manage_all')
    if (!hasPerm) return { error: 'Csak a saját időbejegyzésedet szerkesztheted!' }
  }

  if (updates.description !== undefined && !updates.description.trim()) updates.description = 'Névtelen munka'

  const { error } = await supabase.from('time_entries').update(updates).eq('id', entryId)
  if (error) return { error: 'Nem sikerült frissíteni a bejegyzést.' }
  return { success: true }
}

export async function deleteTimeEntry(entryId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

  const { data: entry } = await supabase.from('time_entries').select('user_id, workspace_id').eq('id', entryId).single()
  if (!entry) return { error: 'Bejegyzés nem található.' }

  if (entry.user_id !== user.id) {
    const hasPerm = await checkPermission(entry.workspace_id, 'time:manage_all')
    if (!hasPerm) return { error: 'Csak a saját időbejegyzésedet törölheted!' }
  }

  const { error } = await supabase.from('time_entries').delete().eq('id', entryId)
  if (error) return { error: 'Nem sikerült törölni a bejegyzést.' }
  return { success: true }
}