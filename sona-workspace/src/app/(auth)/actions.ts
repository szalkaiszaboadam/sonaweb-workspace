'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Hiba esetén visszadobjuk a login oldalra egy hibaüzenettel az URL-ben
    redirect('/login?message=Hibás+email+vagy+jelszó')
  }
  
  // Sikeres belépés után irány a Workspace választó
  redirect('/workspaces')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string // Új: Név kiolvasása

  const supabase = await createClient()

const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
      },
      // MEGMONDJUK A SUPABASE-NEK, HOVA IRÁNYÍTSON VISSZA A KATTINTÁS UTÁN:
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

if (error) {
    // ÚJ SOR: Kiíratjuk a terminálba a pontos okot
    console.error("SUPABASE REGISZTRÁCIÓS HIBA:", error.message)
    redirect('/register?message=Hiba a regisztráció során')
  }

  // MÓDOSÍTOTT RÉSZ: Sikeres regisztráció után kiírjuk, hogy nézze meg az e-mailt
  // A sima szöveg helyett URL-kompatibilis formátumra alakítjuk az ékezeteket
  redirect(`/login?message=${encodeURIComponent('Sikeres regisztráció! Kérlek, erősítsd meg az e-mail címedet a kiküldött levélben lévő linkkel.')}`)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // FONTOS: A link kattintása után ide fogja visszadobni, ahol kérjük az ÚJ jelszót!
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?next=/update-password`,
  })

  if (error) {
    console.error("Visszaállítási hiba:", error.message)
    redirect('/forgot-password?message=' + encodeURIComponent('Hiba történt a kérés során.'))
  }

  // Sikeres küldés esetén visszadobjuk a loginra egy zöld üzenettel
  redirect('/login?message=' + encodeURIComponent('Elküldtük a jelszó-visszaállító linket az e-mail címedre!'))
}

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string
  const supabase = await createClient()

  // Jelszó frissítése az adatbázisban
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    console.error("Jelszó frissítési hiba:", error.message)
    redirect('/update-password?message=' + encodeURIComponent('Hiba a jelszó módosításakor. Lehet, hogy túl gyenge a jelszó.'))
  }

  // SIKERES MÓDOSÍTÁS UTÁN: Kijelentkeztetjük az aktív munkamenetből
  await supabase.auth.signOut()

  // Átirányítjuk a bejelentkezési oldalra egy zöld üzenettel
  redirect('/login?message=' + encodeURIComponent('Sikeres jelszómódosítás! Kérlek, jelentkezz be az új jelszavaddal.'))
}