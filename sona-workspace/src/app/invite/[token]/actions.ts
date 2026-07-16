'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function acceptInviteAction(token: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Be kell jelentkezned a meghívó elfogadásához.' }
  }

  // Meghívjuk a biztonságos SQL függvényt
  const { data: workspaceId, error } = await supabase.rpc('accept_workspace_invite', {
    token_val: token
  })

  if (error) {
    console.error('Elfogadási hiba:', error)
    return { error: 'Hiba történt a meghívó elfogadásakor.' }
  }

  // Ha sikeres, azonnal bedobjuk a Workspace dashboardjára!
  redirect(`/${workspaceId}/dashboard`)
}