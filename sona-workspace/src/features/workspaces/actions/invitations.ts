'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function inviteUser(workspaceId: string, email: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nincs jogosultságod.' }

// 1. Definiáljuk a típust a lekérdezés előtt
  type MembershipData = {
    is_owner: boolean
    workspaces: { name: string } | { name: string }[] | null
  }

  // 2. Lekérdezzük az adatot (itt a 'data' változóba tesszük először)
  const { data } = await supabase
    .from('workspace_members')
    .select('is_owner, workspaces(name)')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  // 3. Rákényszerítjük a típust
  const membership = data as MembershipData | null

  if (!membership?.is_owner) {
    return { error: 'Csak a Workspace tulajdonosa küldhet meghívót.' }
  }
  // Megnézzük, van-e már aktív meghívó
  const { data: existingInvite } = await supabase
    .from('workspace_invitations')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('email', email)
    .eq('status', 'pending')
    .single()

  if (existingInvite) {
    return { error: 'Ezzel az e-mail címmel már van folyamatban lévő meghívás.' }
  }

  // 2. Létrehozzuk a meghívót az adatbázisban
  const { data: invite, error } = await supabase
    .from('workspace_invitations')
    .insert({
      workspace_id: workspaceId,
      email: email,
      inviter_id: user.id,
    })
    .select('token')
    .single()

  if (error) return { error: 'Hiba történt a meghívó létrehozásakor.' }

  // 3. E-MAIL KÜLDÉSE BREVO API-VAL
  const workspaceName = Array.isArray(membership.workspaces) 
    ? membership.workspaces[0]?.name 
    : membership.workspaces?.name

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const inviteUrl = `${appUrl}/invite/${invite.token}`

  try {
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY as string,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { 
          name: 'SONA Workspace', 
          email: 'info@sonaweb.hu' // Később ide a hitelesített feladó e-mailed jön
        },
        to: [{ email: email }],
        subject: `Meghívó a(z) ${workspaceName} munkaterülethez`,
        htmlContent: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 40px 20px; background-color: #F4F2F0; border-radius: 12px;">
            <div style="background-color: #ffffff; padding: 40px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb;">
              <h1 style="color: #111827; font-size: 24px; margin-bottom: 8px;">Meghívó munkaterülethez</h1>
              <p style="color: #4b5563; font-size: 16px; margin-bottom: 32px; line-height: 1.5;">
                Meghívást kaptál, hogy csatlakozz a(z) <strong>${workspaceName}</strong> munkaterülethez a SONA rendszerben.
              </p>
              
              <a href="${inviteUrl}" style="display: inline-block; background-color: #BF2234; color: #ffffff; font-weight: 500; font-size: 16px; text-decoration: none; padding: 12px 32px; border-radius: 6px;">
                Meghívó elfogadása
              </a>
              
              <p style="color: #9ca3af; font-size: 14px; margin-top: 32px;">
                Ez a link 7 napig érvényes.<br>Ha nem te kérted ezt az e-mailt, nyugodtan hagyd figyelmen kívül.
              </p>
            </div>
          </div>
        `
      })
    })

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.json()
      console.error('Brevo API hiba:', errorData)
      // Ha az email küldés elszáll, érdemes lehet visszavonni a DB-ből is, 
      // de egyelőre elég, ha logoljuk.
    }
  } catch (err) {
    console.error('Hálózat hiba a Brevo API hívásakor:', err)
  }

  revalidatePath(`/${workspaceId}/team`)
  return { success: true }
}

// ... itt marad a korábban megírt revokeInvitation és acceptInvitation

// 2. Meghívó visszavonása
export async function revokeInvitation(invitationId: string, workspaceId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('workspace_invitations')
    .update({ status: 'revoked' })
    .eq('id', invitationId)

  if (error) return { error: 'Hiba a meghívás visszavonásakor.' }

  revalidatePath(`/${workspaceId}/team`)
  return { success: true }
}

// 3. Meghívó elfogadása (Ezt a /invite/[token] oldalról hívjuk majd)
export async function acceptInvitation(token: string) {
  // Ennél a lépésnél admin jogra (Service Role) lehet szükség, ha a lekérdezést 
  // úgy akarjuk megcsinálni, hogy ne kössük RLS-hez a token olvasását.
  // Ehhez az .env fájlba be kell tenni a SUPABASE_SERVICE_ROLE_KEY-t is, 
  // de egyelőre a publikus RLS bypass nélkül, Server Actionben kezeljük az RLS miatt.
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Be kell jelentkezned a meghívó elfogadásához.' }

  // Itt a bypass miatt egy trükköt használunk (RPC függvényt hívunk majd, 
  // de most megírjuk a logikát tisztán).
  const { data: invite, error: fetchError } = await supabase
    .from('workspace_invitations')
    .select('*')
    .eq('token', token)
    .single()

  if (fetchError || !invite) return { error: 'Érvénytelen vagy nem létező meghívó.' }
  if (invite.status !== 'pending') return { error: 'Ez a meghívó már nem érvényes.' }
  if (new Date(invite.expires_at) < new Date()) return { error: 'A meghívó lejárt.' }
  
  // Opcionális biztonság: ellenőrizhetjük, hogy az email amivel belépett, 
  // megegyezik-e a meghívottal.
  if (user.email !== invite.email) {
    return { error: 'Ez a meghívó egy másik e-mail címre szól.' }
  }

  // 1. Frissítjük a meghívót Accepted-re
  await supabase
    .from('workspace_invitations')
    .update({ status: 'accepted' })
    .eq('id', invite.id)

  // 2. Hozzáadjuk a workspace_members táblához (Memberként)
  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: invite.workspace_id,
      user_id: user.id,
      is_owner: false, // Csak sima tag
    })

  if (memberError) return { error: 'Hiba történt a tagság létrehozásakor.' }

  return { success: true, workspaceId: invite.workspace_id }
}