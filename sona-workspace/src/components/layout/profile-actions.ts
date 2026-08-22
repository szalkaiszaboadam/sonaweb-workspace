'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfilePassword(formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) return { error: 'Nincs bejelentkezve.' }

  // 1. Jelenlegi jelszó ellenőrzése egy háttérben futó bejelentkezéssel
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) {
    return { error: 'A jelenlegi jelszó helytelen.' }
  }

  // 2. Ha a jelenlegi jelszó jó, átírjuk az újra
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
  
  if (updateError) return { error: 'Hiba történt a jelszó frissítésekor.' }

  return { success: true }
}

export async function uploadAvatar(formData: FormData) {
  const file = formData.get('avatar') as File
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !file) return { error: 'Érvénytelen kérés.' }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })

  if (uploadError) return { error: 'Nem sikerült feltölteni a képet.' }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: publicUrl }
  })

  if (updateError) return { error: 'Hiba a profil mentésekor.' }

  revalidatePath('/', 'layout')
  return { success: true, avatar_url: publicUrl }
}