'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfilePassword(formData: FormData) {
  const password = formData.get('password') as string
  const supabase = await createClient()
  
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }
  
  return { success: true }
}

export async function uploadAvatar(formData: FormData) {
  const file = formData.get('avatar') as File
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || !file) return { error: 'Érvénytelen kérés.' }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`

  // 1. Kép feltöltése
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })

  if (uploadError) return { error: 'Nem sikerült feltölteni a képet.' }

  // 2. Publikus URL lekérése
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  // 3. Metaadat frissítése a fiókban
  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: publicUrl }
  })

  if (updateError) return { error: 'Hiba a profil mentésekor.' }

  revalidatePath('/', 'layout')
  return { success: true, avatar_url: publicUrl }
}