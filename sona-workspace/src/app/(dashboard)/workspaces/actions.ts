'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createWorkspace(formData: FormData) {
  const name = formData.get('name') as string
  if (!name) return { error: 'A munkaterület nevének megadása kötelező.' }

  const supabase = await createClient()
  
  // Lekérdezzük az aktuális felhasználót
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nem vagy bejelentkezve.' }

  // Itt hívjuk meg az SQL-ben létrehozott egyedi függvényünket
  const { data: newWorkspaceId, error: rpcError } = await supabase.rpc('create_new_workspace', {
    workspace_name: name
  })

  if (rpcError) {
    console.error("RPC Hiba:", rpcError) // Hasznos a jövőbeli debuggoláshoz
    return { error: 'Hiba történt a munkaterület létrehozásakor.' }
  }

  // Frissítjük az oldalt, hogy az új kártya azonnal megjelenjen
  revalidatePath('/workspaces')
  
  return { success: true }
}